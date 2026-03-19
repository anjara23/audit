Application web de gestion d'approvisionnement de stock avec interface utilisateur et supervision administrative.

---

### Backend

```bash
cd backend

# Créer et activer le virtualenv
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # Mac/Linux

# Installer les dépendances
pip install fastapi sqlalchemy psycopg2-binary pydantic uvicorn python-dotenv

# Configurer la base de données
cp .env.example .env
# Éditez .env avec vos propres identifiants PostgreSQL
```

Contenu du fichier `.env` :
```
DATABASE_URL=postgresql://utilisateur:motdepasse@localhost:5432/nomdelabase
```

Lancer le serveur :
```bash
uvicorn main:app --reload
```

Le backend sera accessible sur `http://127.0.0.1:8000`

---

### Frontend

```bash
cd frontend

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

Le frontend sera accessible sur `http://localhost:5173`

---

## Utilisation

| URL | Description |
|-----|-------------|
| `http://localhost:5173/` | Page d'accueil |
| `http://localhost:5173/user` | Interface utilisateur |
| `http://localhost:5173/admin` | Interface administrateur |

### Interface User
- Gérer les **approvisionnements** (ajout, modification, suppression)
- Gérer les **produits** et les **fournisseurs**

### Interface Admin
- Consulter le **journal d'audit** de toutes les opérations
- Visualiser les **statistiques** (ajouts, modifications, suppressions)

---
