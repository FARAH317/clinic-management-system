# backend/services/auth-service/app.py
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
import os
import re

app = Flask(__name__)
#CORS(app)
CORS(app, resources={
    r"/*": {
        "origins": [
            "http://localhost:3000",
            "http://localhost:3001"
        ],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})


# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///auth.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET', 'your-secret-key-change-in-production')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)

db = SQLAlchemy(app)
jwt = JWTManager(app)

# ==================== MODELS ====================
class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    role = db.Column(db.String(20), default='user')  # admin, doctor, nurse, user
    is_active = db.Column(db.Boolean, default=True)
    last_login = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'role': self.role,
            'is_active': self.is_active,
            'last_login': self.last_login.strftime('%Y-%m-%d %H:%M:%S') if self.last_login else None,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S')
        }

class LoginHistory(db.Model):
    __tablename__ = 'login_history'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    ip_address = db.Column(db.String(45))
    user_agent = db.Column(db.String(255))
    login_time = db.Column(db.DateTime, default=datetime.utcnow)
    success = db.Column(db.Boolean, default=True)

# ==================== HELPER FUNCTIONS ====================
def validate_email(email):
    """Valider le format de l'email"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password(password):
    """Valider la force du mot de passe"""
    if len(password) < 8:
        return False, "Le mot de passe doit contenir au moins 8 caractères"
    if not re.search(r'[A-Z]', password):
        return False, "Le mot de passe doit contenir au moins une majuscule"
    if not re.search(r'[a-z]', password):
        return False, "Le mot de passe doit contenir au moins une minuscule"
    if not re.search(r'\d', password):
        return False, "Le mot de passe doit contenir au moins un chiffre"
    return True, "OK"

def log_login_attempt(user_id, ip_address, user_agent, success):
    """Enregistrer une tentative de connexion"""
    history = LoginHistory(
        user_id=user_id,
        ip_address=ip_address,
        user_agent=user_agent,
        success=success
    )
    db.session.add(history)
    db.session.commit()

# ==================== ROUTES ====================

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'service': 'auth-service'}), 200

@app.route('/api/auth/register', methods=['POST'])
def register():
    """Inscription d'un nouvel utilisateur"""
    try:
        data = request.get_json()
        
        # Validation des champs requis
        required_fields = ['username', 'email', 'password', 'first_name', 'last_name']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'success': False, 'error': f'{field} est requis'}), 400
        
        # Valider l'email
        if not validate_email(data['email']):
            return jsonify({'success': False, 'error': 'Format email invalide'}), 400
        
        # Valider le mot de passe
        is_valid, message = validate_password(data['password'])
        if not is_valid:
            return jsonify({'success': False, 'error': message}), 400
        
        # Vérifier si l'utilisateur existe déjà
        if User.query.filter_by(username=data['username']).first():
            return jsonify({'success': False, 'error': 'Ce nom d\'utilisateur existe déjà'}), 400
        
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'success': False, 'error': 'Cet email est déjà utilisé'}), 400
        
        # Créer l'utilisateur
        user = User(
            username=data['username'],
            email=data['email'],
            first_name=data['first_name'],
            last_name=data['last_name'],
            role=data.get('role', 'user')
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        # Créer le token
        access_token = create_access_token(
            identity=user.id,
            additional_claims={'role': user.role, 'email': user.email}
        )
        
        return jsonify({
            'success': True,
            'message': 'Inscription réussie',
            'user': user.to_dict(),
            'access_token': access_token
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    """Connexion utilisateur"""
    try:
        data = request.get_json()
        
        # Validation
        if not data.get('username') or not data.get('password'):
            return jsonify({'success': False, 'error': 'Username et password requis'}), 400
        
        # Trouver l'utilisateur (par username ou email)
        user = User.query.filter(
            (User.username == data['username']) | (User.email == data['username'])
        ).first()
        
        # Vérifier l'utilisateur et le mot de passe
        if not user or not user.check_password(data['password']):
            return jsonify({'success': False, 'error': 'Identifiants incorrects'}), 401
        
        # Vérifier si le compte est actif
        if not user.is_active:
            return jsonify({'success': False, 'error': 'Compte désactivé'}), 403
        
        # Mettre à jour le dernier login
        user.last_login = datetime.utcnow()
        db.session.commit()
        
        # Enregistrer la tentative de connexion
        ip_address = request.remote_addr
        user_agent = request.headers.get('User-Agent', '')[:255]
        log_login_attempt(user.id, ip_address, user_agent, True)
        
        # Créer le token JWT
        access_token = create_access_token(
            identity=user.id,
            additional_claims={
                'role': user.role,
                'email': user.email,
                'username': user.username
            }
        )
        
        return jsonify({
            'success': True,
            'message': 'Connexion réussie',
            'user': user.to_dict(),
            'access_token': access_token
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/auth/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Récupérer les infos de l'utilisateur connecté"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'success': False, 'error': 'Utilisateur non trouvé'}), 404
        
        return jsonify({
            'success': True,
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/auth/users', methods=['GET'])
@jwt_required()
def get_users():
    """Récupérer tous les utilisateurs (admin uniquement)"""
    try:
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        # Vérifier si l'utilisateur est admin
        if current_user.role != 'admin':
            return jsonify({'success': False, 'error': 'Accès non autorisé'}), 403
        
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        search = request.args.get('search', '')
        role = request.args.get('role')
        
        query = User.query
        
        # Recherche
        if search:
            query = query.filter(
                db.or_(
                    User.username.ilike(f'%{search}%'),
                    User.email.ilike(f'%{search}%'),
                    User.first_name.ilike(f'%{search}%'),
                    User.last_name.ilike(f'%{search}%')
                )
            )
        
        # Filtrer par rôle
        if role:
            query = query.filter_by(role=role)
        
        # Pagination
        pagination = query.order_by(User.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'success': True,
            'users': [u.to_dict() for u in pagination.items],
            'total': pagination.total,
            'pages': pagination.pages,
            'current_page': page
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/auth/users/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    """Mettre à jour un utilisateur"""
    try:
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        # Vérifier les permissions (admin ou utilisateur lui-même)
        if current_user.role != 'admin' and current_user_id != user_id:
            return jsonify({'success': False, 'error': 'Accès non autorisé'}), 403
        
        user = User.query.get_or_404(user_id)
        data = request.get_json()
        
        # Mettre à jour les champs
        if 'first_name' in data:
            user.first_name = data['first_name']
        if 'last_name' in data:
            user.last_name = data['last_name']
        if 'email' in data:
            if not validate_email(data['email']):
                return jsonify({'success': False, 'error': 'Format email invalide'}), 400
            existing = User.query.filter_by(email=data['email']).first()
            if existing and existing.id != user_id:
                return jsonify({'success': False, 'error': 'Email déjà utilisé'}), 400
            user.email = data['email']
        
        # Seul un admin peut changer le rôle
        if 'role' in data and current_user.role == 'admin':
            user.role = data['role']
        
        # Changer le mot de passe
        if 'password' in data:
            is_valid, message = validate_password(data['password'])
            if not is_valid:
                return jsonify({'success': False, 'error': message}), 400
            user.set_password(data['password'])
        
        user.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Utilisateur mis à jour avec succès',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/auth/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    """Supprimer un utilisateur (admin uniquement)"""
    try:
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        if current_user.role != 'admin':
            return jsonify({'success': False, 'error': 'Accès non autorisé'}), 403
        
        user = User.query.get_or_404(user_id)
        
        # Empêcher la suppression de son propre compte
        if user_id == current_user_id:
            return jsonify({'success': False, 'error': 'Vous ne pouvez pas supprimer votre propre compte'}), 400
        
        db.session.delete(user)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Utilisateur supprimé avec succès'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/auth/stats', methods=['GET'])
@jwt_required()
def get_stats():
    """Statistiques utilisateurs"""
    try:
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        if current_user.role != 'admin':
            return jsonify({'success': False, 'error': 'Accès non autorisé'}), 403
        
        total_users = User.query.count()
        active_users = User.query.filter_by(is_active=True).count()
        admins = User.query.filter_by(role='admin').count()
        doctors = User.query.filter_by(role='doctor').count()
        
        # Nouveaux utilisateurs ce mois
        first_day = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        new_this_month = User.query.filter(User.created_at >= first_day).count()
        
        return jsonify({
            'success': True,
            'stats': {
                'total_users': total_users,
                'active_users': active_users,
                'admins': admins,
                'doctors': doctors,
                'new_this_month': new_this_month
            }
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/auth/validate-token', methods=['GET'])
@jwt_required()
def validate_token():
    """Valider un token JWT"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user or not user.is_active:
            return jsonify({'success': False, 'error': 'Token invalide'}), 401
        
        return jsonify({
            'success': True,
            'valid': True,
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 401

# ==================== MAIN ====================
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        
        # Créer un admin par défaut s'il n'existe pas
        admin = User.query.filter_by(username='admin').first()
        if not admin:
            admin = User(
                username='admin',
                email='admin@clinic.com',
                first_name='Admin',
                last_name='System',
                role='admin'
            )
            admin.set_password('Admin@123')
            db.session.add(admin)
            db.session.commit()
            print("✅ Admin user created: username=admin, password=Admin@123")
        
        print("✅ Auth Service: Database tables created successfully!")
    
    port = int(os.getenv('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=True)