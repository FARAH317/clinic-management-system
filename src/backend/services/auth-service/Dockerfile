# Utiliser l'image Python 3.11
FROM python:3.11-slim

# Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Copier requirements et installer
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copier le code source
COPY . .

# Exposer le port sur lequel Flask va tourner
EXPOSE 5001

# Commande pour lancer l'application
CMD ["python", "app.py"]
