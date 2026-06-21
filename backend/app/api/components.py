from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from app.database import get_db
from app.models import User, Component
from app.api.deps import get_current_user
from pydantic import BaseModel

router = APIRouter()

class ComponentUpdate(BaseModel):
    prix_unitaire: float

@router.get("/")
async def list_components(
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Component).limit(100))
    components = result.scalars().all()
    return [{"id_composant": c.id_composant, "num_composant_fabric": c.num_composant_fabric, "description": c.description, "prix_unitaire": c.prix_unitaire} for c in components]

@router.put("/{id_composant}")
async def update_component_price(
    id_composant: int,
    comp_in: ComponentUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
        
    result = await db.execute(select(Component).where(Component.id_composant == id_composant))
    comp = result.scalars().first()
    if not comp:
        raise HTTPException(status_code=404, detail="Component not found")
        
    comp.prix_unitaire = comp_in.prix_unitaire
    await db.commit()
    return {"message": "Component updated"}
