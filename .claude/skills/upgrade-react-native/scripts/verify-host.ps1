<#
.SYNOPSIS
  Verifies the Android host after a React Native version change.

.DESCRIPTION
  Runs every check in order and prints one line per step plus a final RESULT line.
  Full logs go to $env:TEMP\rn-verify; only the relevant lines are printed when a step fails.
  Exit code: 0 = PASS, 1 = FAIL, 2 = PARTIAL (emulator not available or skipped).
#>
[CmdletBinding()]
param(
    [string] $NativeButtonText = 'Abrir Componente React Native',
    [string] $ExpectedText = 'Example',
    [string] $MainComponent = 'UIComponentsView',
    [string] $PackageName = 'com.example.androidhostapp',
    [int] $MetroPort = 8081,
    [int] $RenderTimeoutSeconds = 90,
    [switch] $SkipEmulator
)

$ErrorActionPreference = 'Stop'

$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..\..\..')).Path
$HostDir = Join-Path $RepoRoot 'apps\host-android'
$LogDir = Join-Path $env:TEMP 'rn-verify'
$MaxFailureLines = 12
$MaxLineLength = 220
$PollIntervalSeconds = 3
$FatalLogPattern = 'FATAL EXCEPTION|Invariant Violation|Unable to resolve module|UnsatisfiedLinkError'
$FailureLogPattern = 'FATAL EXCEPTION|Invariant Violation|Unable to resolve|UnsatisfiedLinkError|\berror\b|\bFAILED\b|^e: |error TS\d+'
$AppLogPattern = 'ReactNative|BridgelessReact|ReactHost|FATAL EXCEPTION'

New-Item -ItemType Directory -Force -Path $LogDir | Out-Null

function Write-Step([string] $status, [string] $name, [string] $detail) {
    Write-Host ('[{0}] {1,-10} {2}' -f $status, $name, $detail)
}

function Write-FailureLines([string] $logFile) {
    $lines = Get-Content $logFile -ErrorAction SilentlyContinue
    $relevant = @($lines | Where-Object { $_ -cmatch $FailureLogPattern })
    if ($relevant.Count -eq 0) { $relevant = @($lines) }
    $relevant | Select-Object -Last $MaxFailureLines | ForEach-Object {
        '    ' + $_.Substring(0, [Math]::Min($MaxLineLength, $_.Length))
    }
    Write-Host "    full log: $logFile"
}

function Stop-WithFailure([string] $name, [string] $detail, [string] $logFile) {
    Write-Step 'FAIL' $name $detail
    if ($logFile) { Write-FailureLines $logFile }
    Write-Host "RESULT: FAIL ($name)"
    exit 1
}

function Invoke-Logged([string] $name, [string] $commandLine, [string] $workingDirectory) {
    $logFile = Join-Path $LogDir "$name.log"
    Push-Location $workingDirectory
    try {
        & cmd.exe /d /s /c "$commandLine > `"$logFile`" 2>&1"
        $exitCode = $LASTEXITCODE
    } finally {
        Pop-Location
    }
    return [pscustomobject] @{ Succeeded = ($exitCode -eq 0); LogFile = $logFile }
}

function Get-JsonVersion([string] $packageJsonPath, [string[]] $sections, [string] $packageName) {
    $json = Get-Content $packageJsonPath -Raw | ConvertFrom-Json
    foreach ($section in $sections) {
        $value = $json.$section.$packageName
        if ($value) { return $value }
    }
    return $null
}

# --- environment -------------------------------------------------------------

if (-not $env:JAVA_HOME) {
    $androidStudioJdk = 'C:\Program Files\Android\Android Studio\jbr'
    if (Test-Path "$androidStudioJdk\bin\java.exe") { $env:JAVA_HOME = $androidStudioJdk }
}
$sdkDir = Join-Path $env:LOCALAPPDATA 'Android\Sdk'
$localProperties = Join-Path $HostDir 'local.properties'
if (Test-Path $localProperties) {
    $sdkLine = Select-String -Path $localProperties -Pattern '^sdk\.dir=(.+)$' | Select-Object -First 1
    if ($sdkLine) { $sdkDir = ($sdkLine.Matches[0].Groups[1].Value -replace '\\\\', '\' -replace '\\:', ':') }
}
$adb = Join-Path $sdkDir 'platform-tools\adb.exe'

# --- step 1: versions --------------------------------------------------------

$hostPackageJson = Join-Path $HostDir 'package.json'
$declaredNative = Get-JsonVersion $hostPackageJson @('dependencies') 'react-native'
$declaredReact = Get-JsonVersion $hostPackageJson @('dependencies') 'react'
$installedNative = (Get-Content (Join-Path $RepoRoot 'node_modules\react-native\package.json') -Raw | ConvertFrom-Json).version
$installedReact = (Get-Content (Join-Path $RepoRoot 'node_modules\react\package.json') -Raw | ConvertFrom-Json).version
$gradleFile = Join-Path $HostDir 'app\build.gradle.kts'
$gradleVersions = @(Select-String -Path $gradleFile -Pattern '(react-android|hermes-android):([\d.]+)' |
    ForEach-Object { $_.Matches[0].Groups[2].Value } | Sort-Object -Unique)
$nestedCopies = @(Get-ChildItem (Join-Path $RepoRoot 'modules'), (Join-Path $RepoRoot 'apps') -Directory |
    Where-Object { Test-Path (Join-Path $_.FullName 'node_modules\react-native\package.json') } |
    ForEach-Object { $_.Name })

$versionProblems = @()
if ($declaredNative -ne $installedNative) { $versionProblems += "host declares react-native $declaredNative but $installedNative is installed" }
if ($declaredReact -ne $installedReact) { $versionProblems += "host declares react $declaredReact but $installedReact is installed" }
if ($gradleVersions.Count -gt 1 -or ($gradleVersions.Count -eq 1 -and $gradleVersions[0] -ne $installedNative)) {
    $versionProblems += "Gradle uses react-android/hermes-android $($gradleVersions -join ',') but react-native $installedNative is installed"
}
if ($nestedCopies.Count -gt 0) { $versionProblems += "nested react-native copy in: $($nestedCopies -join ', ')" }

if ($versionProblems.Count -gt 0) {
    Write-Step 'FAIL' 'versions' ($versionProblems -join '; ')
    Write-Host 'RESULT: FAIL (versions)'
    exit 1
}
Write-Step 'PASS' 'versions' "react-native $installedNative (package.json = installed = gradle), react $installedReact, no nested copies"

# --- step 2: UI modules ------------------------------------------------------

$builtModules = @()
foreach ($moduleDir in Get-ChildItem (Join-Path $RepoRoot 'modules') -Directory) {
    $modulePackageJson = Join-Path $moduleDir.FullName 'package.json'
    if (-not (Test-Path $modulePackageJson)) { continue }
    if (-not (Get-Content $modulePackageJson -Raw | ConvertFrom-Json).scripts.build) { continue }
    $result = Invoke-Logged "module-$($moduleDir.Name)" 'npm run build' $moduleDir.FullName
    if (-not $result.Succeeded) { Stop-WithFailure 'modules' "$($moduleDir.Name) build failed" $result.LogFile }
    $builtModules += $moduleDir.Name
}
Write-Step 'PASS' 'modules' "built: $($builtModules -join ', ')"

# --- step 3: Metro bundle ----------------------------------------------------

$bundleFile = Join-Path $LogDir 'host.bundle'
$bundle = Invoke-Logged 'bundle' "npx react-native bundle --platform android --dev true --entry-file index.js --bundle-output `"$bundleFile`" --reset-cache" $HostDir
if (-not $bundle.Succeeded -or -not (Test-Path $bundleFile)) { Stop-WithFailure 'bundle' 'Metro bundle failed' $bundle.LogFile }
Write-Step 'PASS' 'bundle' ('{0:N1} MB' -f ((Get-Item $bundleFile).Length / 1MB))

# --- step 4: Gradle ----------------------------------------------------------

$gradle = Invoke-Logged 'gradle' '.\gradlew.bat assembleDebug testDebugUnitTest --console=plain' $HostDir
if (-not $gradle.Succeeded) { Stop-WithFailure 'gradle' 'assembleDebug or unit tests failed' $gradle.LogFile }
Write-Step 'PASS' 'gradle' 'assembleDebug + unit tests'

# --- step 5: emulator --------------------------------------------------------

if ($SkipEmulator) {
    Write-Step 'SKIP' 'emulator' 'skipped by -SkipEmulator'
    Write-Host 'RESULT: PARTIAL (emulator skipped)'
    exit 2
}

$connectedDevices = @(& $adb devices | Select-String '\tdevice$')
if ($connectedDevices.Count -eq 0) {
    Write-Step 'SKIP' 'emulator' 'no device connected (start one, e.g. emulator -avd Pixel_9)'
    Write-Host 'RESULT: PARTIAL (emulator not available)'
    exit 2
}

function Invoke-AdbQuiet([string] $arguments) {
    # adb writes progress to stderr; running it through cmd keeps the report compact.
    & cmd.exe /d /s /c "`"$adb`" $arguments >nul 2>&1"
}

function Get-UiDump {
    # Stale dumps must never be read: remove both copies first, uiautomator fails while the app is busy.
    $dumpFile = Join-Path $LogDir 'ui.xml'
    Remove-Item $dumpFile -ErrorAction SilentlyContinue
    Invoke-AdbQuiet 'shell rm -f /sdcard/ui.xml'
    Invoke-AdbQuiet 'shell uiautomator dump /sdcard/ui.xml'
    Invoke-AdbQuiet "pull /sdcard/ui.xml `"$dumpFile`""
    if (-not (Test-Path $dumpFile)) { return '' }
    return Get-Content $dumpFile -Raw
}

function Find-TextCenter([string] $uiDump, [string] $text) {
    $pattern = '(?:text|content-desc)="' + [regex]::Escape($text) + '"[^>]*bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"'
    $match = [regex]::Match($uiDump, $pattern)
    if (-not $match.Success) { return $null }
    $bounds = 1..4 | ForEach-Object { [int] $match.Groups[$_].Value }
    return @{ X = [int](($bounds[0] + $bounds[2]) / 2); Y = [int](($bounds[1] + $bounds[3]) / 2) }
}

function Tap-Text([string] $text, [int] $timeoutSeconds) {
    $deadline = (Get-Date).AddSeconds($timeoutSeconds)
    do {
        $center = Find-TextCenter (Get-UiDump) $text
        if ($center) {
            Invoke-AdbQuiet "shell input tap $($center.X) $($center.Y)"
            return $true
        }
        Start-Sleep -Seconds $PollIntervalSeconds
    } while ((Get-Date) -lt $deadline)
    return $false
}

function Close-CompatibilityDialog([string] $uiDump) {
    # Android 15+ shows this dialog when native libraries are not 16 KB aligned.
    if ($uiDump -notmatch 'Android App Compatibility') { return }
    $center = Find-TextCenter $uiDump 'OK'
    if ($center) { Invoke-AdbQuiet "shell input tap $($center.X) $($center.Y)" }
}

$emulatorLog = Join-Path $LogDir 'emulator.log'
$metroOut = Join-Path $LogDir 'metro.out.log'
$metroErr = Join-Path $LogDir 'metro.err.log'

# Metro must be restarted: rebuilding lib/ leaves a running Metro with a stale file index.
$listener = Get-NetTCPConnection -LocalPort $MetroPort -State Listen -ErrorAction SilentlyContinue
if ($listener) { Stop-Process -Id $listener.OwningProcess -Force }
$npx = (Get-Command npx.cmd).Source
Start-Process -FilePath $npx -ArgumentList 'react-native', 'start', '--reset-cache' -WorkingDirectory $HostDir `
    -WindowStyle Hidden -RedirectStandardOutput $metroOut -RedirectStandardError $metroErr

$metroReady = $false
for ($attempt = 0; $attempt -lt 30 -and -not $metroReady; $attempt++) {
    Start-Sleep -Seconds 2
    try { $metroReady = (Invoke-WebRequest "http://localhost:$MetroPort/status" -UseBasicParsing -TimeoutSec 2).StatusCode -eq 200 } catch { }
}
if (-not $metroReady) { Stop-WithFailure 'emulator' 'Metro did not start' $metroErr }

$apk = Join-Path $HostDir 'app\build\outputs\apk\debug\app-debug.apk'
Invoke-AdbQuiet "reverse tcp:$MetroPort tcp:$MetroPort"
Invoke-AdbQuiet "install -r `"$apk`""
Invoke-AdbQuiet 'logcat -c'
Invoke-AdbQuiet "shell am force-stop $PackageName"
Invoke-AdbQuiet "shell am start -n $PackageName/.MainActivity"

if (-not (Tap-Text $NativeButtonText 30)) {
    Stop-WithFailure 'emulator' "native button '$NativeButtonText' not found" $null
}

$rendered = $false
$deadline = (Get-Date).AddSeconds($RenderTimeoutSeconds)
while ((Get-Date) -lt $deadline -and -not $rendered) {
    Start-Sleep -Seconds $PollIntervalSeconds
    $appLog = & $adb logcat -d
    if ($appLog -match $FatalLogPattern) { break }
    $uiDump = Get-UiDump
    Close-CompatibilityDialog $uiDump
    $nativeButton = Find-TextCenter $uiDump $NativeButtonText
    if ($nativeButton) {
        # Still on the native screen: the previous tap was lost (app was not ready yet).
        Invoke-AdbQuiet "shell input tap $($nativeButton.X) $($nativeButton.Y)"
        continue
    }
    $rendered = ($appLog -match "Running `"$MainComponent`"") -and (Find-TextCenter $uiDump $ExpectedText)
}

$appLog = & $adb logcat -d
$appLog | Where-Object { $_ -match $AppLogPattern } | Set-Content $emulatorLog
if ($appLog -match $FatalLogPattern) { Stop-WithFailure 'emulator' 'app crashed or JS error' $emulatorLog }
if (-not $rendered) { Stop-WithFailure 'emulator' "'$ExpectedText' not rendered within ${RenderTimeoutSeconds}s" $emulatorLog }

if (-not (Tap-Text $ExpectedText 10)) { Stop-WithFailure 'emulator' "'$ExpectedText' disappeared before it could be tapped" $emulatorLog }
Start-Sleep -Seconds 2
$afterTapLog = & $adb logcat -d
if ($afterTapLog -match $FatalLogPattern) { Stop-WithFailure 'emulator' "app crashed after tapping '$ExpectedText'" $emulatorLog }
Write-Step 'PASS' 'emulator' "$MainComponent rendered '$ExpectedText', tap OK, no crash"

if ($afterTapLog -match 'Legacy Architecture') {
    Write-Step 'INFO' 'app logs' 'Legacy Architecture warning present (host has isNewArchEnabled = false)'
}
Write-Host 'RESULT: PASS'
exit 0
