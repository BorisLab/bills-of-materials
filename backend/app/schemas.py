from pydantic import BaseModel, EmailStr
from typing import Optional, List
from enum import Enum

class RoleEnum(str, Enum):
    admin = "admin"
    commercial = "commercial"
    client = "client"
    acheteur = "acheteur"

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

class ComponentUpdate(BaseModel):
    prix_unitaire: Optional[float] = None
    stock_disponible: Optional[int] = None
    delai_livraison_semaines: Optional[int] = None
    equivalent_ref: Optional[str] = None

class ComponentOut(BaseModel):
    id_composant: int
    num_composant_fabric: str
    description: Optional[str] = None
    prix_unitaire: float
    stock_disponible: int
    delai_livraison_semaines: int
    equivalent_ref: Optional[str] = None

    class Config:
        from_attributes = True

class QuoteLineOut(BaseModel):
    id_ligne_devis: int
    quantite_demande: int
    libelle_extrait_comp: Optional[str] = None
    
    composant_id: int
    num_composant_fabric: str
    description: Optional[str] = None
    prix_unitaire: float

    class Config:
        from_attributes = True

class QuoteOut(BaseModel):
    id_devis: int
    prix_total: Optional[float] = None
    remise_pourcentage: float = 0.0
    commentaire_commercial: Optional[str] = None
    statut: str
    cree_le: Optional[str] = None
    
    lignes: List[QuoteLineOut] = []

    class Config:
        from_attributes = True
