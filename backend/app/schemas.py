from pydantic import BaseModel, EmailStr
from typing import Optional, List
from enum import Enum

class RoleEnum(str, Enum):
    admin = "admin"
    commercial = "commercial"
    client = "client"

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: Optional[RoleEnum] = RoleEnum.commercial

class UserOut(BaseModel):
    id_utilisateur: int
    email: EmailStr
    role: RoleEnum

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class ComponentCreate(BaseModel):
    num_composant_fabric: str
    description: Optional[str] = None
    quantite_demande: int

class QuoteLineOut(BaseModel):
    id_ligne_devis: int
    quantite_demande: int
    libelle_extrait_comp: Optional[str] = None
    
    # We will include basic component info
    composant_id: int
    num_composant_fabric: str
    description: Optional[str] = None
    prix_unitaire: float

    class Config:
        from_attributes = True

class QuoteOut(BaseModel):
    id_devis: int
    prix_total: Optional[float] = None
    statut: str
    
    lignes: List[QuoteLineOut] = []

    class Config:
        from_attributes = True
