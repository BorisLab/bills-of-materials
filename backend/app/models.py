import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Enum, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

class RoleEnum(str, enum.Enum):
    admin = "admin"
    commercial = "commercial"
    ingenieur = "ingenieur"

class QuoteStatusEnum(str, enum.Enum):
    en_attente = "en_attente"
    valide = "valide"
    refuse = "refuse"

class User(Base):
    __tablename__ = "utilisateurs"

    id_utilisateur = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    pwd = Column(String, nullable=False)
    role = Column(Enum(RoleEnum), default=RoleEnum.commercial, nullable=False)

    devis = relationship("Quote", back_populates="utilisateur")

class Component(Base):
    __tablename__ = "composants"

    id_composant = Column(Integer, primary_key=True, index=True)
    num_composant_fabric = Column(String, unique=True, index=True, nullable=False)
    description = Column(String, nullable=True)
    prix_unitaire = Column(Float, nullable=False)

    lignes_devis = relationship("QuoteLine", back_populates="composant")

class Quote(Base):
    __tablename__ = "devis"

    id_devis = Column(Integer, primary_key=True, index=True)
    prix_total = Column(Float, nullable=True)
    statut = Column(Enum(QuoteStatusEnum), default=QuoteStatusEnum.en_attente, nullable=False)
    cree_le = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    utilisateur_id = Column(Integer, ForeignKey("utilisateurs.id_utilisateur"), nullable=False)
    utilisateur = relationship("User", back_populates="devis")
    lignes = relationship("QuoteLine", back_populates="devis", cascade="all, delete-orphan")

class QuoteLine(Base):
    __tablename__ = "lignes_devis"

    id_ligne_devis = Column(Integer, primary_key=True, index=True)
    quantite_demande = Column(Integer, nullable=False)
    libelle_extrait_comp = Column(String, nullable=True)

    devis_id = Column(Integer, ForeignKey("devis.id_devis"), nullable=False)
    composant_id = Column(Integer, ForeignKey("composants.id_composant"), nullable=False)

    devis = relationship("Quote", back_populates="lignes")
    composant = relationship("Component", back_populates="lignes_devis")
