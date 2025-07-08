from fastapi import FastAPI, HTTPException, Depends, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import List, Optional
import json
import os
from dotenv import load_dotenv

from database.database import engine, get_db
from database.models import Base
from api.auth import auth_router
from api.burnout import burnout_router
from api.journal import journal_router
from api.work_sessions import work_sessions_router
from api.integrations import integrations_router
from services.websocket_manager import WebSocketManager

load_dotenv()

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Burnout Detection Agent",
    description="AI-powered burnout detection and analysis system",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=json.loads(os.getenv("CORS_ORIGINS", '["http://localhost:3000"]')),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# WebSocket manager
websocket_manager = WebSocketManager()

# Include routers
app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])
app.include_router(burnout_router, prefix="/api/burnout", tags=["Burnout Analysis"])
app.include_router(journal_router, prefix="/api/journal", tags=["Journal"])
app.include_router(work_sessions_router, prefix="/api/work-sessions", tags=["Work Sessions"])
app.include_router(integrations_router, prefix="/api/integrations", tags=["Integrations"])

@app.get("/")
async def root():
    return {"message": "Burnout Detection Agent API", "version": "1.0.0"}

@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await websocket_manager.connect(websocket, user_id)
    try:
        while True:
            data = await websocket.receive_text()
            # Handle incoming websocket messages
            await websocket_manager.send_personal_message(json.loads(data), user_id)
    except WebSocketDisconnect:
        websocket_manager.disconnect(user_id)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)