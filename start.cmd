@echo off
echo Starting MindMarket Server...
call "%~dp0node.cmd" "%~dp0server.js" %*
exit /b %errorlevel%
