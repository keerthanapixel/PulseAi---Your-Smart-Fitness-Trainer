@echo off
echo ==========================================
echo Starting AI Fitness Hub FastAPI Backend...
echo ==========================================
cd /d "%~dp0backend"
python -m uvicorn app.main:app --reload --port 8000
pause
