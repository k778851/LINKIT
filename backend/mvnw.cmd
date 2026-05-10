@REM Maven Wrapper — delegates to system Maven if available, otherwise downloads
@echo off
setlocal

set MAVEN_WRAPPER_PROPERTIES=.mvn\wrapper\maven-wrapper.properties
set MAVEN_PROJECTBASEDIR=%~dp0

@REM Use MAVEN_HOME if set, otherwise try PATH
if defined MAVEN_HOME (
  set MVN_CMD=%MAVEN_HOME%\bin\mvn.cmd
  goto run
)

@REM Try system maven
where mvn.cmd >nul 2>&1
if %ERRORLEVEL% == 0 (
  set MVN_CMD=mvn.cmd
  goto run
)

@REM Fallback: download Maven distribution defined in wrapper properties
for /f "tokens=2 delims==" %%i in ('findstr "distributionUrl" "%MAVEN_PROJECTBASEDIR%%MAVEN_WRAPPER_PROPERTIES%"') do set DIST_URL=%%i
set MAVEN_USER_HOME=%USERPROFILE%\.m2
set MAVEN_DIST_DIR=%MAVEN_USER_HOME%\wrapper\dists
if not exist "%MAVEN_DIST_DIR%" mkdir "%MAVEN_DIST_DIR%"
for %%F in ("%DIST_URL%") do set DIST_FILENAME=%%~nxF
set DIST_ZIP=%MAVEN_DIST_DIR%\%DIST_FILENAME%
if not exist "%DIST_ZIP%" (
  echo Downloading Maven from %DIST_URL%
  curl -fsSL -o "%DIST_ZIP%" "%DIST_URL%"
)
@REM Extract (PowerShell)
set EXTRACT_DIR=%MAVEN_DIST_DIR%\%DIST_FILENAME:~0,-8%
if not exist "%EXTRACT_DIR%" (
  powershell -Command "Expand-Archive -Path '%DIST_ZIP%' -DestinationPath '%MAVEN_DIST_DIR%'"
)
for /d %%d in ("%MAVEN_DIST_DIR%\apache-maven-*") do set MVN_CMD=%%d\bin\mvn.cmd

:run
"%MVN_CMD%" %*
