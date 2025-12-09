# Dockerfile pour microservice
FROM python:3.11-slim

WORKDIR /app

# Copier requirements et installer
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copier tout le code source
COPY . .

# Exposer le port interne du microservice (Flask)
EXPOSE 5002

# Lancer l'application
CMD ["python", "app.py"]
