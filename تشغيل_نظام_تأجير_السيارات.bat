@echo off
:: Set character encoding to UTF-8 to display Arabic correctly
chcp 65001 > nul

echo ===================================================
echo  جاري تشغيل منصة نظام تأجير السيارات...
echo  Starting Call Center Car Rental System...
echo ===================================================

cd /d "%userprofile%\Desktop\dd"

:: Run the start-dev script
powershell -ExecutionPolicy Bypass -File start-dev.ps1

echo.
echo الانتظار لمدة 5 ثوانٍ حتى تبدأ الخوادم بالعمل...
echo Waiting 5 seconds for servers to start...
timeout /t 5 > nul

echo.
echo جاري فتح متصفح الويب على الرابط http://localhost:3000...
echo Opening web browser at http://localhost:3000...
start http://localhost:3000

echo.
echo تم التشغيل بنجاح! يمكنك إغلاق هذه النافذة.
echo Startup completed! You can close this window.
timeout /t 3 > nul
exit
