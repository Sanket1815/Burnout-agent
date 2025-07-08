from fastapi import WebSocket
from typing import Dict, Any
import json

class WebSocketManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
    
    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        self.active_connections[user_id] = websocket
    
    def disconnect(self, user_id: str):
        if user_id in self.active_connections:
            del self.active_connections[user_id]
    
    async def send_personal_message(self, message: Dict[str, Any], user_id: str):
        if user_id in self.active_connections:
            await self.active_connections[user_id].send_text(json.dumps(message))
    
    async def broadcast_message(self, message: Dict[str, Any]):
        for connection in self.active_connections.values():
            await connection.send_text(json.dumps(message))
    
    async def send_burnout_update(self, user_id: str, burnout_data: Dict[str, Any]):
        await self.send_personal_message({
            "type": "burnout_update",
            "data": burnout_data
        }, user_id)

websocket_manager = WebSocketManager()