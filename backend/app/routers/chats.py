from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.db import get_db
from app.models.user import User
from app.models.chat import Chat
from app.schemas.chat import ChatCreate, ChatResponse
from app.utils.auth import get_current_active_user

router = APIRouter(prefix="/chats", tags=["chats"])


@router.post("", response_model=ChatResponse, status_code=status.HTTP_201_CREATED)
def send_message(
    chat_data: ChatCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Send a chat message"""
    # Verify receiver exists
    receiver = db.query(User).filter(User.id == chat_data.receiver_id).first()
    if not receiver:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Receiver not found"
        )
    
    new_chat = Chat(
        sender_id=current_user.id,
        receiver_id=chat_data.receiver_id,
        message=chat_data.message
    )
    db.add(new_chat)
    db.commit()
    db.refresh(new_chat)
    
    return new_chat


@router.get("/conversation/{user_id}", response_model=list[ChatResponse])
def get_conversation(
    user_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100)
):
    """Get conversation between current user and another user (polling endpoint)"""
    # Verify other user exists
    other_user = db.query(User).filter(User.id == user_id).first()
    if not other_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Get messages where current_user is sender or receiver with the other user
    messages = db.query(Chat).filter(
        ((Chat.sender_id == current_user.id) & (Chat.receiver_id == user_id)) |
        ((Chat.sender_id == user_id) & (Chat.receiver_id == current_user.id))
    ).order_by(Chat.created_at.asc()).offset(skip).limit(limit).all()
    
    # Mark messages as read when conversation is opened
    unread_messages = [msg for msg in messages if msg.receiver_id == current_user.id and not msg.is_read]
    for msg in unread_messages:
        msg.is_read = True
    if unread_messages:
        db.commit()
    
    return messages


@router.patch("/{chat_id}/read", response_model=ChatResponse)
def mark_message_as_read(
    chat_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Mark a message as read"""
    chat = db.query(Chat).filter(Chat.id == chat_id).first()
    if not chat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found"
        )
    
    if chat.receiver_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to mark this message as read"
        )
    
    chat.is_read = True
    db.commit()
    db.refresh(chat)
    return chat


@router.get("/unread/count", response_model=dict)
def get_unread_count(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get count of unread messages per conversation"""
    from sqlalchemy import func
    from collections import defaultdict
    
    unread_messages = db.query(Chat).filter(
        Chat.receiver_id == current_user.id,
        Chat.is_read == False
    ).all()
    
    # Group by sender_id
    unread_counts = defaultdict(int)
    for msg in unread_messages:
        unread_counts[msg.sender_id] += 1
    
    return dict(unread_counts)

