@echo off
REM Build C++ extensions for algoslib using VS BuildTools 18.
REM Run from project root: build_ext.bat

setlocal

set "VS_ROOT=C:\Program Files (x86)\Microsoft Visual Studio\18\BuildTools"
set "MSVC_VER=14.50.35717"
set "SDK_ROOT=C:\Program Files (x86)\Windows Kits\10"
set "SDK_VER=10.0.26100.0"

if not exist "%VS_ROOT%\VC\Tools\MSVC\%MSVC_VER%" goto missing_msvc
if not exist "%SDK_ROOT%\Include\%SDK_VER%" goto missing_sdk
if not exist ".venv\Scripts\python.exe" goto missing_venv

set "VS180COMNTOOLS=%VS_ROOT%\Common7\Tools\"
set "DISTUTILS_USE_SDK=1"
set "MSSdk=1"

set "PATH=%VS_ROOT%\VC\Tools\MSVC\%MSVC_VER%\bin\Hostx64\x64;%SDK_ROOT%\bin\%SDK_VER%\x64;%PATH%"
set "INCLUDE=%VS_ROOT%\VC\Tools\MSVC\%MSVC_VER%\include;%SDK_ROOT%\Include\%SDK_VER%\ucrt;%SDK_ROOT%\Include\%SDK_VER%\shared;%SDK_ROOT%\Include\%SDK_VER%\um"
set "LIB=%VS_ROOT%\VC\Tools\MSVC\%MSVC_VER%\lib\x64;%SDK_ROOT%\Lib\%SDK_VER%\ucrt\x64;%SDK_ROOT%\Lib\%SDK_VER%\um\x64"

.venv\Scripts\python setup.py build_ext --inplace
exit /b %errorlevel%

:missing_msvc
echo [ERROR] MSVC %MSVC_VER% not found at %VS_ROOT%\VC\Tools\MSVC\
echo Update MSVC_VER in build_ext.bat to match the installed version.
exit /b 1

:missing_sdk
echo [ERROR] Windows SDK %SDK_VER% not found at %SDK_ROOT%\Include\
echo Update SDK_VER in build_ext.bat to match the installed version.
exit /b 1

:missing_venv
echo [ERROR] .venv\Scripts\python.exe not found. Activate or recreate the venv first.
exit /b 1
