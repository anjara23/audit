from sqlalchemy import Column, Integer, String, ForeignKey, TIMESTAMP, text
from database import Base

class Fournisseur(Base):
    __tablename__ = "fournisseur"
    id_frs = Column(Integer, primary_key=True, index=True)
    nom = Column(String)

class Produit(Base):
    __tablename__ = "produit"
    id_produit = Column(Integer, primary_key=True, index=True)
    design = Column(String)
    stock = Column(Integer)

class Approvisionnement(Base):
    __tablename__ = "approvisionnement"
    id = Column(Integer, primary_key=True, index=True)
    id_frs = Column(Integer, ForeignKey("fournisseur.id_frs"))
    id_produit = Column(Integer, ForeignKey("produit.id_produit"))
    qteentree = Column(Integer)

class AuditApprovisionnement(Base):
    __tablename__ = "audit_approvisionnement"
    id = Column(Integer, primary_key=True, index=True)
    action_type = Column(String)
    date_action = Column(TIMESTAMP, server_default=text("CURRENT_TIMESTAMP"))
    nom = Column(String)
    design = Column(String)
    qteentree_ancien = Column(Integer)
    qteentree_nouv = Column(Integer)
    utilisateur = Column(String)