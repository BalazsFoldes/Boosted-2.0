@echo off
echo Backend indítása...
start cmd /k "python -m uvicorn app.main:app --reload --port 8000"

echo Frontend indítása...
start cmd /k "cd frontend && npm run dev"

echo Mindkettő elindítva!