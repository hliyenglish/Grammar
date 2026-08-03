@echo off
echo ==============================================
echo       GRAMMAR PROJECT - GITHUB AUTO SYNC
echo ==============================================
echo.

:: Check if git is initialized
if not exist ".git" (
    echo [INFO] Git repository is not initialized. Initializing now...
    git init
    git branch -M main
    echo [INFO] Please enter your GitHub repository URL (e.g., https://github.com/username/grammar.git):
    set /p repo_url=URL: 
    git remote add origin %repo_url%
)

echo [INFO] Adding all changes...
git add .

echo [INFO] Committing changes...
:: Get current date and time for commit message
set datetime=%date% %time%
git commit -m "Auto-sync update: %datetime%"

echo [INFO] Pushing to GitHub...
git push -u origin main

echo.
echo ==============================================
echo       SYNC COMPLETED SUCCESSFULLY!
echo ==============================================
pause
