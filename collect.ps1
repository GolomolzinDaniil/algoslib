$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

$python = if (Test-Path ".\.venv\Scripts\python.exe") {
    ".\.venv\Scripts\python.exe"
} else {
    "python"
}

& $python "setup.py" "build_ext" "--inplace" "--force" "--build-temp" "build\\temp_ps" "--build-lib" "build\\lib_ps"
exit $LASTEXITCODE
