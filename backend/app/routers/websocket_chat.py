"""
WebSocket Chat Router - Real-time messaging
"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db import get_db
from app.models.user import User
from app.models.chat import Chat
from app.schemas.chat import ChatResponse
from typing import Dict, List
import json

router = APIRouter()

# Store active WebSocket connections
active_connections: Dict[int, List[WebSocket]] = {}


class ConnectionManager:
    """Manages WebSocket connections"""
    
    def __init__(self):
        self.active_connections: Dict[int, List[WebSocket]] = {}
    
    async def connect(self, websocket: WebSocket, user_id: int):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)
    
    def disconnect(self, websocket: WebSocket, user_id: int):
        if user_id in self.active_connections:
            self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
    
    async def send_personal_message(self, message: dict, user_id: int):
        """Send message to a specific user"""
        if user_id in self.active_connections:
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_json(message)
                except:
                    pass  # Connection closed
    
    async def broadcast(self, message: dict, exclude_user_id: int = None):
        """Broadcast message to all connected users except one"""
        for user_id, connections in self.active_connections.items():
            if user_id != exclude_user_id:
                for connection in connections:
                    try:
                        await connection.send_json(message)
                    except:
                        pass


manager = ConnectionManager()


@router.websocket("/ws/chat/{user_id}")
async def websocket_chat_endpoint(
    websocket: WebSocket,
    user_id: int,
    token: str = None
):
    """
    WebSocket endpoint for real-time chat
    
    Query params:
        - token: JWT token for authentication
    
    Message format (JSON):
        {
            "type": "message",
            "receiver_id": 123,
            "message": "Hello!"
        }
    """
    # TODO: Verify JWT token and get user
    # For now, using user_id from path (should verify token)
    
    await manager.connect(websocket, user_id)
    
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            if message_data.get("type") == "message":
                receiver_id = message_data.get("receiver_id")
                message_text = message_data.get("message")
                
                if receiver_id and message_text:
                    # Save to database (you'll need to pass db session)
                    # For now, just forward the message
                    await manager.send_personal_message({
                        "type": "message",
                        "sender_id": user_id,
                        "receiver_id": receiver_id,
                        "message": message_text,
                        "timestamp": None  # Should get from DB
                    }, receiver_id)
                    
                    # Echo back to sender
                    await manager.send_personal_message({
                        "type": "message_sent",
                        "receiver_id": receiver_id,
                        "message": message_text
                    }, user_id)
            
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)

