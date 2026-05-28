@echo off
setlocal EnableExtensions EnableDelayedExpansion

rem Project root = this bat file folder (no hardcoded absolute path)
set "ROOT=%~dp0"
cd /d "%ROOT%"

set "CFG=config\launch.ini"
if not exist "config" mkdir config

rem defaults
set "BACKEND_ENABLED=1"
set "USE_VENV=1"
set "VENV_DIR=.venv"
set "CREATE_VENV=1"
set "PYTHON_CMD=python"
set "HOST=127.0.0.1"
set "PORT=7400"
set "RELOAD=1"
set "AUTO_INSTALL_DEPS=1"
set "UI_LANG=zh"
set "UI_THEME=light"

if exist "%CFG%" (
  for /f "usebackq tokens=1,* delims==" %%A in ("%CFG%") do (
    set "K=%%~A"
    set "V=%%~B"
    if defined K (
      if not "!K:~0,1!"=="[" if not "!K:~0,1!"==";" if not "!K:~0,1!"=="#" (
        for /f "tokens=* delims= " %%i in ("!K!") do set "K=%%i"
        for /f "tokens=* delims= " %%i in ("!V!") do set "V=%%i"

        if /I "!K!"=="enabled" set "BACKEND_ENABLED=!V!"
        if /I "!K!"=="use_venv" set "USE_VENV=!V!"
        if /I "!K!"=="venv_dir" set "VENV_DIR=!V!"
        if /I "!K!"=="create_venv" set "CREATE_VENV=!V!"
        if /I "!K!"=="python_cmd" set "PYTHON_CMD=!V!"
        if /I "!K!"=="host" set "HOST=!V!"
        if /I "!K!"=="port" set "PORT=!V!"
        if /I "!K!"=="reload" set "RELOAD=!V!"
        if /I "!K!"=="auto_install_deps" set "AUTO_INSTALL_DEPS=!V!"
        if /I "!K!"=="language" set "UI_LANG=!V!"
        if /I "!K!"=="theme" set "UI_THEME=!V!"
      )
    )
  )
)

(
  echo window.APP_CONFIG = {
  echo   backend_host: "!HOST!",
  echo   backend_port: !PORT!,
  echo   backend_url: "http://!HOST!:!PORT!",
  echo   ui_lang: "!UI_LANG!",
  echo   ui_theme: "!UI_THEME!"
  echo };
) > config\runtime-config.js

if not "%BACKEND_ENABLED%"=="1" (
  echo [INFO] Backend disabled in config\launch.ini
  exit /b 0
)

if not exist "backend\main.py" (
  echo [ERROR] backend\main.py not found.
  pause
  exit /b 1
)

set "PYTHON_EXE="

if "%USE_VENV%"=="1" (
  set "VENV_PY=%VENV_DIR%\Scripts\python.exe"

  if not exist "!VENV_PY!" (
    if not "%CREATE_VENV%"=="1" (
      echo [ERROR] venv python not found: !VENV_PY!
      pause
      exit /b 1
    )

    set "BOOTSTRAP="
    call %PYTHON_CMD% -V >nul 2>nul && set "BOOTSTRAP=%PYTHON_CMD%"
    if not defined BOOTSTRAP (
      call py -3 -V >nul 2>nul && set "BOOTSTRAP=py -3"
    )
    if not defined BOOTSTRAP (
      echo [ERROR] Cannot create venv. Python not found.
      pause
      exit /b 1
    )

    echo [INFO] Creating local virtual environment: %VENV_DIR%
    call !BOOTSTRAP! -m venv "%VENV_DIR%"
    if errorlevel 1 (
      echo [ERROR] Failed to create venv.
      pause
      exit /b 1
    )
  )

  if not exist "!VENV_PY!" (
    echo [ERROR] venv python not found after creation: !VENV_PY!
    pause
    exit /b 1
  )

  set "PYTHON_EXE=!VENV_PY!"
) else (
  call %PYTHON_CMD% -V >nul 2>nul && set "PYTHON_EXE=%PYTHON_CMD%"
  if not defined PYTHON_EXE (
    call py -3 -V >nul 2>nul && set "PYTHON_EXE=py -3"
  )
  if not defined PYTHON_EXE (
    echo [ERROR] Python not found.
    pause
    exit /b 1
  )
)

if "%AUTO_INSTALL_DEPS%"=="1" (
  echo [INFO] Installing backend dependencies...
  call "!PYTHON_EXE!" -m pip install -r backend\requirements.txt
  if errorlevel 1 (
    echo [ERROR] pip install failed.
    pause
    exit /b 1
  )
)

set "UVICORN_CMD="!PYTHON_EXE!" -m uvicorn backend.main:app --host %HOST% --port %PORT%"
if "%RELOAD%"=="1" set "UVICORN_CMD=!UVICORN_CMD! --reload"

echo [INFO] Starting backend at http://%HOST%:%PORT%
start "Gentleman Mosaic Backend" cmd /k "cd /d ""%ROOT%"" && !UVICORN_CMD!"

if exist "standalone.html" (
  echo [INFO] Opening standalone.html
  start "" "standalone.html"
) else (
  echo [WARN] standalone.html not found.
)

endlocal
exit /b 0
