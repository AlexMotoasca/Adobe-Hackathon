@echo off
echo Starting MindMarket Server...
if exist "node.cmd" (
  call node.cmd server.js
) else (
  node server.js
)
pause
