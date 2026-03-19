# /users, role assignment

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.db.session import get_db
from app.core.dependencies import get_current_user, require_admin
from app.models.user import User

router = APIRouter(prefix="/users", tags=["users"])

class RoleUpdate(BaseModel):
    role: str

@router.get("/")
def list_users(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    users = db.query(User).all()
    return [
        {
            "id": str(u.id),
            "email": u.email,
            "name": u.name,
            "picture": u.picture,
            "role": u.role,
            "is_active": u.is_active,
            "created_at": u.created_at
        }
        for u in users
    ]

@router.patch("/{user_id}/role")
def update_role(
    user_id: str,
    data: RoleUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user)
):
    if data.role not in ["admin", "employee"]:
        raise HTTPException(status_code=400, detail="Role must be admin or employee")

    user = db.query(User).filter(User.id ==  user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.role = data.role
    db.commit()
    return {"message": f"{user.email} is not {data.role}"}

@router.patch("{user_id}/deactivate")
def deactivate_user(
    user_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.is_active = False
    db.commit()
    return {"message": f"{user.email} deactivated"}