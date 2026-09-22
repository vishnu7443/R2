from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Policy

router = APIRouter(prefix="/api/policies")

@router.get("")
def list_policies(db: Session = Depends(get_db)):
    return db.query(Policy).all()

@router.put("/{policy_id}")
def update_policy(
    policy_id: str,
    enabled: bool = Body(..., embed=True),
    value: dict = Body(None, embed=True),
    db: Session = Depends(get_db)
):
    policy = db.query(Policy).filter(Policy.id == policy_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found.")
        
    policy.enabled = enabled
    if value is not None:
        # Merge values
        current_val = dict(policy.value) if policy.value else {}
        current_val.update(value)
        policy.value = current_val
        
    db.commit()
    db.refresh(policy)
    return policy
