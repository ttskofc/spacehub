<#
    Запуск frontend SpaceHub. Обычно вызывается из корня через start.ps1,
    но можно и руками: .\run.ps1 -Port 5173

    --strictPort важен: без него Vite молча уезжает на 5174 и браузер
    открывает страницу без работающего API.
    Лог текущего запуска: client/logs/client.log
#>

[CmdletBinding()]
param(
    [int] $Port = 5173
)

$ErrorActionPreference = "Continue"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

if (-not (Test-Path (Join-Path $PSScriptRoot "node_modules"))) {
    Write-Host "Нет node_modules - ставлю зависимости..." -ForegroundColor Yellow
    Push-Location $PSScriptRoot
    & npm install
    Pop-Location
}

$logDir = Join-Path $PSScriptRoot "logs"
$logFile = Join-Path $logDir "client-$Port.log"
New-Item -ItemType Directory -Path $logDir -Force | Out-Null
Remove-Item $logFile -ErrorAction SilentlyContinue

Set-Location $PSScriptRoot
$host.UI.RawUI.WindowTitle = "SpaceHub Client :$Port"

# Vite идёт напрямую в гейтвей; прокси-переменные окружения этому мешать не должны
$env:NO_PROXY = "localhost,127.0.0.1,::1"
$env:no_proxy = "localhost,127.0.0.1,::1"

& cmd /c "npm run dev -- --port $Port --strictPort --host 127.0.0.1 2>&1" |
    Tee-Object -FilePath $logFile