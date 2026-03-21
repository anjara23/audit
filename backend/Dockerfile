# Image Python légère
FROM python:3.13-slim

#Dossier de travail dans le conteneur
WORKDIR /app

#Copier et installer les dépendances
# layer mis en cache si requirements ne change pas
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# copie le reste du code
COPY . .

# port exposé par FastAPI
EXPOSE 8000

# lancement de uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]