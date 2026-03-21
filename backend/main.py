from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Approvisionnement, AuditApprovisionnement, Fournisseur, Produit
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:80",
        "http://localhost"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def root():
    return {"message": "API stock audit OK"}

#validation des données d'entrée pour l'approvisionnement, des produits et des fournisseurs
class ApprovisionnementCreate(BaseModel):
    id_frs: int
    id_produit: int
    qteentree: int

class ProduitCreate(BaseModel):
    design: str
    stock: int

class FournisseurCreate(BaseModel):
    nom: str

# Endpoints pour la gestion des produits, fournisseurs, approvisionnements et audit
@app.post("/user/approvisionnement")
def add_approvisionnement(data: ApprovisionnementCreate, db: Session = Depends(get_db)):
    app = Approvisionnement(**data.dict())
    db.add(app)
    db.commit()
    return {"message": "Approvisionnement ajouté"}

@app.get("/user/approvisionnements")
def get_approvisionnements(db: Session = Depends(get_db)):
    return db.query(Approvisionnement).all()

@app.put("/user/approvisionnement/{id}")
def update_approvisionnement(id: int, data: ApprovisionnementCreate, db: Session = Depends(get_db)):
    app = db.query(Approvisionnement).filter(Approvisionnement.id == id).first()
    app.id_frs = data.id_frs
    app.id_produit = data.id_produit
    app.qteentree = data.qteentree
    db.commit()
    return {"message": "Approvisionnement modifié"}

@app.delete("/user/approvisionnement/{id}")
def delete_approvisionnement(id: int, db: Session = Depends(get_db)):
    app = db.query(Approvisionnement).filter(Approvisionnement.id == id).first()
    db.delete(app)
    db.commit()
    return {"message": "Approvisionnement supprimé"}



@app.get("/admin/audit")
def get_audit(db: Session = Depends(get_db)):
    return db.query(AuditApprovisionnement).all()

@app.get("/admin/stats")
def get_stats(db: Session = Depends(get_db)):
    return {
        "insertions": db.query(AuditApprovisionnement).filter_by(action_type="ajout").count(),
        "modifications": db.query(AuditApprovisionnement).filter_by(action_type="modification").count(),
        "suppressions": db.query(AuditApprovisionnement).filter_by(action_type="suppression").count()
    }



@app.post("/user/produits")
def add_produit(data: ProduitCreate, db: Session = Depends(get_db)):
    produit = Produit(**data.dict())
    db.add(produit)
    db.commit()
    return {"message": "Produit ajouté"}

@app.get("/user/produits")
def get_produits(db: Session = Depends(get_db)):
    return db.query(Produit).all()

@app.put("/user/produits/{id}")
def update_produit(id: int, data: ProduitCreate, db: Session = Depends(get_db)):
    produit = db.query(Produit).filter(Produit.id_produit == id).first()
    produit.design = data.design
    produit.stock = data.stock
    db.commit()
    return {"message": "Produit modifié"}

@app.delete("/user/produits/{id}")
def delete_produit(id: int, db: Session = Depends(get_db)):
    produit = db.query(Produit).filter(Produit.id_produit == id).first()
    db.delete(produit)
    db.commit()
    return {"message": "Produit supprimé"}



@app.post("/user/fournisseurs")
def add_fournisseur(data: FournisseurCreate, db: Session = Depends(get_db)):
    frs = Fournisseur(**data.dict())
    db.add(frs)
    db.commit()
    return {"message": "Fournisseur ajouté"}

@app.get("/user/fournisseurs")
def get_fournisseurs(db: Session = Depends(get_db)):
    return db.query(Fournisseur).all()

@app.put("/user/fournisseurs/{id}")
def update_fournisseur(id: int, data: FournisseurCreate, db: Session = Depends(get_db)):
    frs = db.query(Fournisseur).filter(Fournisseur.id_frs == id).first()
    frs.nom = data.nom
    db.commit()
    return {"message": "Fournisseur modifié"}

@app.delete("/user/fournisseurs/{id}")
def delete_fournisseur(id: int, db: Session = Depends(get_db)):
    frs = db.query(Fournisseur).filter(Fournisseur.id_frs == id).first()
    db.delete(frs)
    db.commit()
    return {"message": "Fournisseur supprimé"}