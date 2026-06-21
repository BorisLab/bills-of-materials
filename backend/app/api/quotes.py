from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from app.database import get_db
from app.models import User, Component, Quote, QuoteLine, QuoteStatusEnum
from app.schemas import ComponentCreate, QuoteOut
from app.api.deps import get_current_user
from app.services.pricing import calculate_deterministic_price

router = APIRouter()

@router.post("/", response_model=QuoteOut, status_code=status.HTTP_201_CREATED)
async def create_quote(
    components: List[ComponentCreate],
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if not components:
        raise HTTPException(status_code=400, detail="La liste de composants est vide.")

    # Create the Quote
    new_quote = Quote(
        utilisateur_id=current_user.id_utilisateur,
        statut=QuoteStatusEnum.en_attente,
        prix_total=0.0
    )
    db.add(new_quote)
    await db.flush() # flush to get the id_devis

    total_price = 0.0
    
    # In a real scenario we'd do a batch insert, but here we process one by one
    # to check existence and calculate deterministic prices
    for comp_data in components:
        # Check if component already exists
        result = await db.execute(select(Component).where(Component.num_composant_fabric == comp_data.num_composant_fabric))
        db_comp = result.scalars().first()
        
        if not db_comp:
            # Create new component and calculate deterministic price
            price = calculate_deterministic_price(comp_data.num_composant_fabric)
            db_comp = Component(
                num_composant_fabric=comp_data.num_composant_fabric,
                description=comp_data.description,
                prix_unitaire=price
            )
            db.add(db_comp)
            await db.flush() # get id_composant

        # Create Quote Line
        line_price = db_comp.prix_unitaire * comp_data.quantite_demande
        total_price += line_price
        
        new_line = QuoteLine(
            quantite_demande=comp_data.quantite_demande,
            libelle_extrait_comp=comp_data.description,
            devis_id=new_quote.id_devis,
            composant_id=db_comp.id_composant
        )
        db.add(new_line)
        
    # Update total price of the quote
    new_quote.prix_total = round(total_price, 2)
    
    await db.commit()
    
    # Refresh to return full object
    # We need to eager load the lines and components, or we can just fetch it again
    # But for simplicity, we can do a query with joins or construct the response manually.
    
    # Eager loading:
    from sqlalchemy.orm import selectinload
    result = await db.execute(
        select(Quote)
        .options(selectinload(Quote.lignes).selectinload(QuoteLine.composant))
        .where(Quote.id_devis == new_quote.id_devis)
    )
    final_quote = result.scalars().first()
    
    # We have to map the SQLAlchemy model to our Pydantic schema because our schema
    # expects flat fields for component details
    lines_out = []
    for line in final_quote.lignes:
        lines_out.append({
            "id_ligne_devis": line.id_ligne_devis,
            "quantite_demande": line.quantite_demande,
            "libelle_extrait_comp": line.libelle_extrait_comp,
            "composant_id": line.composant.id_composant,
            "num_composant_fabric": line.composant.num_composant_fabric,
            "description": line.composant.description,
            "prix_unitaire": line.composant.prix_unitaire
        })
        
    response = {
        "id_devis": final_quote.id_devis,
        "prix_total": final_quote.prix_total,
        "statut": final_quote.statut,
        "lignes": lines_out
    }
    
    return response

@router.get("/", response_model=List[Dict])
async def list_quotes(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # For MVP, if commercial or admin, show all. If client, show only their quotes.
    if current_user.role in ["commercial", "admin"]:
        result = await db.execute(select(Quote).order_by(Quote.id_devis.desc()))
    else:
        result = await db.execute(select(Quote).where(Quote.utilisateur_id == current_user.id_utilisateur).order_by(Quote.id_devis.desc()))
    
    quotes = result.scalars().all()
    return [{"id_devis": q.id_devis, "prix_total": q.prix_total, "statut": q.statut.value} for q in quotes]

@router.put("/{id_devis}", status_code=status.HTTP_200_OK)
async def update_quote_status(
    id_devis: int,
    statut: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role not in ["commercial", "admin"]:
        raise HTTPException(status_code=403, detail="Forbidden")

    result = await db.execute(select(Quote).where(Quote.id_devis == id_devis))
    quote = result.scalars().first()
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")

    try:
        quote.statut = QuoteStatusEnum(statut)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid status")

    await db.commit()
    return {"message": "Status updated successfully"}
