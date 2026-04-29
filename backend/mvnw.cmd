@REM Maven Wrapper Script (Windows)
@echo off
setlocal

set MAVEN_WRAPPER_JAR=.mvn\wrapper\maven-wrapper.jar
set MAVEN_WRAPPER_PROPERTIES=.mvn\wrapper\maven-wrapper.properties
set MAVEN_PROJECTBASEDIR=%~dp0

@REM Wrapper JAR 없으면 다운로드
if not exist "%MAVEN_PROJECTBASEDIR%\%MAVEN_WRAPPER_JAR%" (
  for /f "tokens=2 delims==" %%i in ('findstr "wrapperUrl" "%MAVEN_PROJECTBASEDIR%\%MAVEN_WRAPPER_PROPERTIES%"') do set WRAPPER_URL=%%i
  echo Downloading Maven Wrapper from %WRAPPER_URL%
  curl -o "%MAVEN_PROJECTBASEDIR%\%MAVEN_WRAPPER_JAR%" "%WRAPPER_URL%"
)

java -jar "%MAVEN_PROJECTBASEDIR%\%MAVEN_WRAPPER_JAR%" %*
