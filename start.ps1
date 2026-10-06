<#
.SYNOPSIS
    Поднимает всё окружение SpaceHub: гейтвей FastAPI и frontend Vite.

.DESCRIPTION
    Скрипт максимально "бездумный": создаёт venv и .env при необходимости,
    проверяет доступность 1С, занимает фиксированные порты (иначе Vite молча
    уедет на 5174 и браузер откроет не тот адрес), дожидается готовности
    обоих сервисов и открывает каталог.

    Каждый сервис стартует в отдельном окне PowerShell и пишет лог:
    server/logs/gateway-<порт>.log и client/logs/client-<порт>.log.

.EXAMPLE
    .\start.ps1
    .\start.ps1 -NoBrowser
    .\start.ps1 -GatewayPort 8010 -ClientPort 5180
#>

[CmdletBinding()]
param(
    [int] $GatewayPort = 8000,
    [int] $ClientPort = 5173,
    [string] $OneCBaseUrl = "",
    [switch] $NoBrowser
)

$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$root = $PSScriptRoot
$serverDir = Join-Path $root "server"
$clientDir = Join-Path $root "client"

function Write-Step($message) { Write-Host "==> $message" -ForegroundColor Cyan }
function Write-Ok($message) { Write-Host "    [ok] $message" -ForegroundColor Green }
function Write-Warn($message) { Write-Host "    [!] $message" -ForegroundColor Yellow }
function Write-Fail($message) { Write-Host "    [x] $message" -ForegroundColor Red }

function Get-Listener([int] $port) {
    # ищем в любом family: Vite по умолчанию слушает только [::1]
    $conn = Get-NetTCPConnection -State Listen -LocalPort $port -ErrorAction SilentlyContinue |
        Select-Object -First 1
    if (-not $conn) { return $null }

    $proc = Get-CimInstance Win32_Process -Filter "ProcessId=$($conn.OwningProcess)" -ErrorAction SilentlyContinue
    return [pscustomobject]@{ Port = $port; Pid = $conn.OwningProcess; Command = $proc.CommandLine }
}

function Wait-Url([string] $url, [int] $seconds, [string] $label) {
    $deadline = (Get-Date).AddSeconds($seconds)
    while ((Get-Date) -lt $deadline) {
        try {
            $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 5
            if ($response.StatusCode -eq 200) { return $response }
        } catch {
            # сервис ещё поднимается
        }
        Start-Sleep -Milliseconds 700
    }
    Write-Fail "$label не ответил за $seconds с: $url"
    return $null
}

function Show-Log([string] $path) {
    if (-not (Test-Path $path)) { return }
    Write-Host "    --- хвост лога ---" -ForegroundColor DarkGray
    Get-Content $path -Tail 15 | ForEach-Object { Write-Host "    $_" -ForegroundColor DarkGray }
}

function Start-Service([string] $script, [int] $port) {
    Start-Process -FilePath "powershell.exe" -ArgumentList @(
        "-NoExit", "-NoProfile", "-ExecutionPolicy", "Bypass", "-File", $script, "-Port", $port
    ) | Out-Null
}

Write-Host ""
Write-Host "  SpaceHub - запуск окружения" -ForegroundColor White
Write-Host "  гейтвей :$GatewayPort | клиент :$ClientPort" -ForegroundColor DarkGray
Write-Host ""

# ---------------------------------------------------------------- 1С
if (-not $OneCBaseUrl) {
    $OneCBaseUrl = "http://localhost:8080/spacehub/hs/api/v1"
    $envFile = Join-Path $serverDir ".env"
    if (Test-Path $envFile) {
        $line = Select-String -Path $envFile -Pattern '^\s*ONEC_BASE_URL\s*=\s*(.+?)\s*$' |
            Select-Object -First 1
        if ($line) { $OneCBaseUrl = $line.Matches[0].Groups[1].Value.Trim() }
    }
}

Write-Step "Проверка 1С: $OneCBaseUrl"
$onecOk = $false
foreach ($attempt in 1..3) {
    try {
        $probe = Invoke-WebRequest -Uri "$OneCBaseUrl/resources" -UseBasicParsing -TimeoutSec 10
        if ($probe.StatusCode -eq 200) { $onecOk = $true; break }
    } catch {
        if ($attempt -lt 3) { Start-Sleep -Seconds 2 }
    }
}
if ($onecOk) {
    Write-Ok "1С отвечает"
} else {
    Write-Warn "1С не отвечает - каталог покажет состояние ошибки."
    Write-Warn "Поднимите веб-сервер 1С и обновите страницу (или перезапустите .\start.ps1)."
}

# ---------------------------------------------------------------- гейтвей
Write-Step "Гейтвей (FastAPI)"
$python = Join-Path $serverDir ".venv\Scripts\python.exe"
if (-not (Test-Path $python)) {
    Write-Host "    создаю venv и ставлю зависимости..." -ForegroundColor DarkGray
    & python -m venv (Join-Path $serverDir ".venv")
    & $python -m pip install --quiet --upgrade pip
    & $python -m pip install --quiet -r (Join-Path $serverDir "requirements.txt")
    Write-Ok "venv готов"
}

$gatewayBusy = Get-Listener $GatewayPort
$startGateway = $true
if ($gatewayBusy) {
    $health = $null
    try { $health = Invoke-WebRequest -Uri "http://127.0.0.1:$GatewayPort/health" -UseBasicParsing -TimeoutSec 10 } catch { }
    if ($health -and $health.Content -match '"onec"\s*:\s*"(available|unavailable)"') {
        if ($health.Content -match '"onec"\s*:\s*"available"') {
            Write-Ok "порт $GatewayPort уже занят рабочим гейтвеем (pid $($gatewayBusy.Pid)) - перезапускать не буду"
        } else {
            Write-Warn "гейтвей уже запущен (pid $($gatewayBusy.Pid)), но 1С для него недоступна"
        }
        $startGateway = $false
    } else {
        Write-Fail "порт $GatewayPort занят, но это не наш гейтвей: pid $($gatewayBusy.Pid)"
        Write-Fail "освободите порт: .\stop.ps1 -Ports $GatewayPort   (или запустите с -GatewayPort 8010)"
        exit 1
    }
}

if ($startGateway) {
    $gatewayLog = Join-Path $serverDir "logs\gateway-$GatewayPort.log"
    Start-Service (Join-Path $serverDir "run.ps1") $GatewayPort
    Write-Host "    окно 'SpaceHub Gateway :$GatewayPort', лог server\logs\gateway-$GatewayPort.log" -ForegroundColor DarkGray

    $gateway = Wait-Url "http://127.0.0.1:$GatewayPort/health" 45 "гейтвей"
    if (-not $gateway) {
        Show-Log $gatewayLog
        exit 1
    }
    if ($gateway.Content -match '"onec"\s*:\s*"available"') {
        Write-Ok "гейтвей готов и видит 1С"
    } else {
        Write-Warn "гейтвей поднялся, но 1С недоступна: $($gateway.Content)"
    }
}

# ---------------------------------------------------------------- frontend
Write-Step "Frontend (Vite)"
if (-not (Test-Path (Join-Path $clientDir "node_modules"))) {
    Write-Host "    ставлю npm-зависимости..." -ForegroundColor DarkGray
    Push-Location $clientDir
    & npm install --silent
    Pop-Location
    Write-Ok "node_modules готов"
}

$clientBusy = Get-Listener $ClientPort
$startClient = $true
if ($clientBusy) {
    $page = $null
    try { $page = Invoke-WebRequest -Uri "http://127.0.0.1:$ClientPort/" -UseBasicParsing -TimeoutSec 10 } catch { }
    if ($page -and $page.StatusCode -eq 200 -and $page.Content -match "SpaceHub") {
        Write-Ok "порт $ClientPort уже занят работающим клиентом (pid $($clientBusy.Pid)) - перезапускать не буду"
        $startClient = $false
    } else {
        Write-Fail "порт $ClientPort занят, но это не наш клиент: pid $($clientBusy.Pid) $($clientBusy.Command)"
        Write-Fail "освободите порт: .\stop.ps1 -Ports $ClientPort   (или запустите с -ClientPort 5180)"
        exit 1
    }
}

if ($startClient) {
    if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
        Write-Fail "npm не найден - поставьте Node.js 20+ и откройте терминал заново"
        exit 1
    }

    $clientLog = Join-Path $clientDir "logs\client-$ClientPort.log"
    Start-Service (Join-Path $clientDir "run.ps1") $ClientPort
    Write-Host "    окно 'SpaceHub Client :$ClientPort', лог client\logs\client-$ClientPort.log" -ForegroundColor DarkGray

    $client = Wait-Url "http://127.0.0.1:$ClientPort/" 60 "frontend"
    if (-not $client) {
        Show-Log $clientLog
        exit 1
    }
    Write-Ok "frontend отдаёт index.html"
}

# ---------------------------------------------------------------- итог
$url = "http://localhost:$ClientPort/"
Write-Host ""
Write-Host "  Готово: $url" -ForegroundColor Green
Write-Host "  гейтвей   : http://localhost:$GatewayPort/health" -ForegroundColor DarkGray
Write-Host "  1С        : $OneCBaseUrl" -ForegroundColor DarkGray
Write-Host "  логи      : server\logs\gateway-$GatewayPort.log, client\logs\client-$ClientPort.log" -ForegroundColor DarkGray
Write-Host "  остановить: .\stop.ps1" -ForegroundColor DarkGray
Write-Host ""

if (-not $NoBrowser) { Start-Process $url }