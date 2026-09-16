@echo off
chcp 65001 > nul
echo ==========================================================
echo    ĐÓNG GÓI PUBLISH BACKEND .NET 8 (BÀN GIAO / DEPLOY)
echo ==========================================================
echo.
set "DOTNET_ROOT=C:\Users\luudu\.dotnet"
set "PATH=%DOTNET_ROOT%;%PATH%"
dotnet publish -c Release -o ./publish
echo.
echo Đã xuất các file chạy hoàn chỉnh vào thư mục: backend-dotnet\publish
pause
