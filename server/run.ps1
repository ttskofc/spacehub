<#
    Запуск гейтвея SpaceHub. Обычно вызывается из корня через start.ps1,
    но можно и руками: .\run.ps1 -Port 8000

    Лог текущего запуска пишется в server/logs/gateway.log и дублируется в окно.
    Через cmd /c нужен потому, что PowerShell иначе считает stderr питона
    ("INFO: ..." от uvicorn) ошибкой и обрывает скрипт.
#>

[CmdletBinding()]
param(
    [int] $Port = 8000
)

$ErrorActionPreference = "Continue"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$python = Join-Path $PSScriptRoot ".venv\Scripts\python.exe"
if (-not (Test-Path $python)) {
    Write-Host "Нет venv: $python" -ForegroundColor Red
    Write-Host "Создайте окружение: cd server; python -m venv .venv; .venv\Scripts\pip install -r requirements.txt" -ForegroundColor Yellow
    exit 1
}

$logDir = Join-Path $PSScriptRoot "logs"
$logFile = Join-Path $logDir "gateway-$Port.log"
New-Item -ItemType Directory -Path $logDir -Force | Out-Null
Remove-Item $logFile -ErrorAction SilentlyContinue

Set-Location $PSScriptRoot
$host.UI.RawUI.WindowTitle = "SpaceHub Gateway :$Port"

& cmd /c "`"$python`" -m uvicorn main:app --reload --host 127.0.0.1 --port $Port 2>&1" |
    Tee-Object -FilePath $logFile