from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.database import get_db
from app.models import User, Component
from app.api.deps import get_current_user
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

class ComponentCreateFull(BaseModel):
    num_composant_fabric: str
    description: Optional[str] = None
    prix_unitaire: float
    stock_disponible: int = 100
    delai_livraison_semaines: int = 1
    equivalent_ref: Optional[str] = None

class ComponentUpdateFull(BaseModel):
    prix_unitaire: Optional[float] = None
    stock_disponible: Optional[int] = None
    delai_livraison_semaines: Optional[int] = None
    equivalent_ref: Optional[str] = None

@router.get("")
async def list_components(
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Component).order_by(Component.id_composant.desc()).limit(200))
    components = result.scalars().all()
    return [
        {
            "id_composant": c.id_composant,
            "num_composant_fabric": c.num_composant_fabric,
            "description": c.description,
            "prix_unitaire": c.prix_unitaire,
            "stock_disponible": c.stock_disponible,
            "delai_livraison_semaines": c.delai_livraison_semaines,
            "equivalent_ref": c.equivalent_ref
        }
        for c in components
    ]

@router.post("", status_code=201)
async def create_component(
    comp_in: ComponentCreateFull,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role not in ["admin", "acheteur"]:
        raise HTTPException(status_code=403, detail="Non autorisé")

    result = await db.execute(select(Component).where(Component.num_composant_fabric == comp_in.num_composant_fabric))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Composant existe déjà")

    new_comp = Component(
        num_composant_fabric=comp_in.num_composant_fabric,
        description=comp_in.description,
        prix_unitaire=comp_in.prix_unitaire,
        stock_disponible=comp_in.stock_disponible,
        delai_livraison_semaines=comp_in.delai_livraison_semaines,
        equivalent_ref=comp_in.equivalent_ref
    )
    db.add(new_comp)
    await db.commit()
    await db.refresh(new_comp)
    return {
        "id_composant": new_comp.id_composant,
        "num_composant_fabric": new_comp.num_composant_fabric,
        "description": new_comp.description,
        "prix_unitaire": new_comp.prix_unitaire,
        "stock_disponible": new_comp.stock_disponible,
        "delai_livraison_semaines": new_comp.delai_livraison_semaines,
        "equivalent_ref": new_comp.equivalent_ref
    }

@router.put("/{id_composant}")
async def update_component(
    id_composant: int,
    comp_in: ComponentUpdateFull,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role not in ["admin", "acheteur"]:
        raise HTTPException(status_code=403, detail="Non autorisé")
        
    result = await db.execute(select(Component).where(Component.id_composant == id_composant))
    comp = result.scalars().first()
    if not comp:
        raise HTTPException(status_code=404, detail="Composant introuvable")
        
    if comp_in.prix_unitaire is not None:
        comp.prix_unitaire = comp_in.prix_unitaire
    if comp_in.stock_disponible is not None:
        comp.stock_disponible = comp_in.stock_disponible
    if comp_in.delai_livraison_semaines is not None:
        comp.delai_livraison_semaines = comp_in.delai_livraison_semaines
    if comp_in.equivalent_ref is not None:
        comp.equivalent_ref = comp_in.equivalent_ref

    await db.commit()
    return {"message": "Composant mis à jour avec succès"}
