@echo off
chcp 65001 > nul
echo ==========================================================
echo    KHỞI ĐỘNG BACKEND .NET 8 TRA CỨU GIÁ ĐẤT (IOC 1022)
echo ==========================================================
echo.
set "DOTNET_ROOT=C:\Users\luudu\.dotnet"
set "PATH=%DOTNET_ROOT%;%PATH%"
dotnet run --launch-profile http
