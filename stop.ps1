<#
.SYNOPSIS
    Останавливает процессы SpaceHub на указанных портах.

.DESCRIPTION
    Убивает всё дерево процесса: у "uvicorn --reload" сокет держит дочерний
    python-процесс, поэтому одного родителя мало - остаётся сирота с занятым
    портом. Консольные окна, запущенные через start.ps1, закрываются тоже.

.EXAMPLE
    .\stop.ps1
    .\stop.ps1 -Ports 8000,5173
#>

[CmdletBinding()]
param(
    [string[]] $Ports = @("8000", "5173")
)

$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# принимаем и "8010,5180", и массив из консоли
$portList = @($Ports | ForEach-Object { $_ -split "," } | ForEach-Object { [int]$_.Trim() })

function Get-Proc([int] $id_) {
    Get-CimInstance Win32_Process -Filter "ProcessId=$id_" -ErrorAction SilentlyContinue
}

function Stop-Tree([int] $id_, [string] $reason, [int] $depth = 0) {
    $proc = Get-Proc $id_
    $indent = " " * (4 + $depth * 2)

    foreach ($child in @(Get-CimInstance Win32_Process -Filter "ParentProcessId=$id_" -ErrorAction SilentlyContinue)) {
        Stop-Tree $child.ProcessId $reason ($depth + 1)
    }

    if ($proc) {
        Stop-Process -Id $id_ -Force -ErrorAction SilentlyContinue
        Write-Host "$indent остановлен pid $id_ ($reason)" -ForegroundColor Green

        $parent = Get-Proc $proc.ParentProcessId
        # консоль, из которой запущен сервис через run.ps1, закрываем вместе с ним
        if ($parent -and $parent.Name -eq "powershell.exe" -and $parent.CommandLine -match "run\.ps1") {
            Stop-Process -Id $parent.ProcessId -Force -ErrorAction SilentlyContinue
            Write-Host "$indent закрыто окно PowerShell (pid $($parent.ProcessId))" -ForegroundColor Green
        }
    }
}

function Test-PortFree([int] $port) {
    # порт может быть занят на 127.0.0.1, на [::1] или на обоих сразу (Vite
    # по умолчанию слушает только IPv6), поэтому проверяем оба loopback
    foreach ($address in @([System.Net.IPAddress]::Loopback, [System.Net.IPAddress]::IPv6Loopback)) {
        $listener = New-Object System.Net.Sockets.TcpListener($address, $port)
        try {
            $listener.Start()
        } catch {
            return $false
        } finally {
            $listener.Stop()
        }
    }
    return $true
}

foreach ($port in $portList) {
    $conns = @(Get-NetTCPConnection -State Listen -LocalPort $port -ErrorAction SilentlyContinue)
    if (-not $conns) {
        Write-Host "порт $port свободен" -ForegroundColor DarkGray
        continue
    }
    foreach ($conn in $conns) { Stop-Tree $conn.OwningProcess "порт $port" }
}

# uvicorn --reload мог оставить сироту с сокетом: проверяем фактической попыткой занять порт
Start-Sleep -Milliseconds 800
$busy = $portList | Where-Object { -not (Test-PortFree $_) }
if ($busy) {
    Write-Host "порты всё ещё заняты: $($busy -join ', ')" -ForegroundColor Yellow
    exit 1
}
Write-Host "порты свободны: $($portList -join ', ')" -ForegroundColor Cyan