@echo off
rem Classroom Mission Control - lets phones on the classroom Wi-Fi reach this laptop (port 8080).
rem Run once. Windows asks for permission because it changes the firewall.
net session >nul 2>&1
if %errorlevel% neq 0 (
  powershell -NoProfile -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
  exit /b
)
netsh advfirewall firewall delete rule name="Classroom Mission Control 8080" >nul 2>&1
netsh advfirewall firewall add rule name="Classroom Mission Control 8080" dir=in action=allow protocol=TCP localport=8080 profile=private,domain,public
echo.
echo Done. Student phones on the same Wi-Fi can now reach Mission Control on this laptop.
echo You only need to do this once.
pause
