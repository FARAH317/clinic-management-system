# backend/services/doctor-service/app.py
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)

# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///doctors.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# ==================== MODELS ====================
class Doctor(db.Model):
    __tablename__ = 'doctors'
    
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    specialization = db.Column(db.String(100), nullable=False)  # Cardiologue, Pédiatre, etc.
    license_number = db.Column(db.String(50), unique=True, nullable=False)  # Numéro d'ordre
    
    # Informations professionnelles
    years_of_experience = db.Column(db.Integer, default=0)
    education = db.Column(db.Text)  # Formation et diplômes
    languages = db.Column(db.String(200))  # Langues parlées (séparées par virgules)
    bio = db.Column(db.Text)  # Biographie
    
    # Disponibilité
    is_active = db.Column(db.Boolean, default=True)
    consultation_fee = db.Column(db.Float, default=0.0)
    
    # Horaires de travail
    working_days = db.Column(db.String(100))  # Lundi,Mardi,Mercredi...
    working_hours_start = db.Column(db.String(10))  # 09:00
    working_hours_end = db.Column(db.String(10))  # 17:00
    
    # Localisation
    office_address = db.Column(db.String(200))
    city = db.Column(db.String(100))
    
    # Dates
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'full_name': f"{self.first_name} {self.last_name}",
            'email': self.email,
            'phone': self.phone,
            'specialization': self.specialization,
            'license_number': self.license_number,
            'years_of_experience': self.years_of_experience,
            'education': self.education,
            'languages': self.languages.split(',') if self.languages else [],
            'bio': self.bio,
            'is_active': self.is_active,
            'consultation_fee': self.consultation_fee,
            'working_days': self.working_days.split(',') if self.working_days else [],
            'working_hours': {
                'start': self.working_hours_start,
                'end': self.working_hours_end
            },
            'office_address': self.office_address,
            'city': self.city,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S')
        }

class Specialization(db.Model):
    __tablename__ = 'specializations'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(db.Text)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description
        }

# ==================== ROUTES ====================

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'service': 'doctor-service'}), 200

@app.route('/api/doctors', methods=['GET'])
def get_doctors():
    """Récupérer tous les médecins"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        search = request.args.get('search', '')
        specialization = request.args.get('specialization')
        is_active = request.args.get('is_active')
        city = request.args.get('city')
        
        query = Doctor.query
        
        # Recherche
        if search:
            query = query.filter(
                db.or_(
                    Doctor.first_name.ilike(f'%{search}%'),
                    Doctor.last_name.ilike(f'%{search}%'),
                    Doctor.email.ilike(f'%{search}%'),
                    Doctor.specialization.ilike(f'%{search}%')
                )
            )
        
        # Filtrer par spécialisation
        if specialization:
            query = query.filter_by(specialization=specialization)
        
        # Filtrer par statut actif
        if is_active is not None:
            query = query.filter_by(is_active=is_active.lower() == 'true')
        
        # Filtrer par ville
        if city:
            query = query.filter_by(city=city)
        
        # Pagination
        pagination = query.order_by(Doctor.last_name).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'success': True,
            'doctors': [d.to_dict() for d in pagination.items],
            'total': pagination.total,
            'pages': pagination.pages,
            'current_page': page
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/doctors/<int:doctor_id>', methods=['GET'])
def get_doctor(doctor_id):
    """Récupérer un médecin par ID"""
    try:
        doctor = Doctor.query.get_or_404(doctor_id)
        return jsonify({'success': True, 'doctor': doctor.to_dict()}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 404

@app.route('/api/doctors', methods=['POST'])
def create_doctor():
    """Créer un nouveau médecin"""
    try:
        data = request.get_json()
        
        # Validation
        required_fields = ['first_name', 'last_name', 'email', 'phone', 'specialization', 'license_number']
        for field in required_fields:
            if field not in data:
                return jsonify({'success': False, 'error': f'{field} est requis'}), 400
        
        # Vérifier si l'email existe déjà
        if Doctor.query.filter_by(email=data['email']).first():
            return jsonify({'success': False, 'error': 'Email déjà utilisé'}), 400
        
        # Vérifier si le numéro de licence existe déjà
        if Doctor.query.filter_by(license_number=data['license_number']).first():
            return jsonify({'success': False, 'error': 'Numéro de licence déjà utilisé'}), 400
        
        # Créer le médecin
        doctor = Doctor(
            first_name=data['first_name'],
            last_name=data['last_name'],
            email=data['email'],
            phone=data['phone'],
            specialization=data['specialization'],
            license_number=data['license_number'],
            years_of_experience=data.get('years_of_experience', 0),
            education=data.get('education'),
            languages=','.join(data.get('languages', [])) if isinstance(data.get('languages'), list) else data.get('languages'),
            bio=data.get('bio'),
            is_active=data.get('is_active', True),
            consultation_fee=data.get('consultation_fee', 0.0),
            working_days=','.join(data.get('working_days', [])) if isinstance(data.get('working_days'), list) else data.get('working_days'),
            working_hours_start=data.get('working_hours_start', '09:00'),
            working_hours_end=data.get('working_hours_end', '17:00'),
            office_address=data.get('office_address'),
            city=data.get('city')
        )
        
        db.session.add(doctor)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Médecin créé avec succès',
            'doctor': doctor.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/doctors/<int:doctor_id>', methods=['PUT'])
def update_doctor(doctor_id):
    """Mettre à jour un médecin"""
    try:
        doctor = Doctor.query.get_or_404(doctor_id)
        data = request.get_json()
        
        # Mettre à jour les champs
        updateable_fields = [
            'first_name', 'last_name', 'phone', 'specialization',
            'years_of_experience', 'education', 'bio', 'is_active',
            'consultation_fee', 'working_hours_start', 'working_hours_end',
            'office_address', 'city'
        ]
        
        for field in updateable_fields:
            if field in data:
                setattr(doctor, field, data[field])
        
        # Gérer les champs spéciaux (listes)
        if 'languages' in data:
            doctor.languages = ','.join(data['languages']) if isinstance(data['languages'], list) else data['languages']
        
        if 'working_days' in data:
            doctor.working_days = ','.join(data['working_days']) if isinstance(data['working_days'], list) else data['working_days']
        
        # Vérifier l'unicité de l'email
        if 'email' in data:
            existing = Doctor.query.filter_by(email=data['email']).first()
            if existing and existing.id != doctor_id:
                return jsonify({'success': False, 'error': 'Email déjà utilisé'}), 400
            doctor.email = data['email']
        
        doctor.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Médecin mis à jour avec succès',
            'doctor': doctor.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/doctors/<int:doctor_id>', methods=['DELETE'])
def delete_doctor(doctor_id):
    """Supprimer un médecin"""
    try:
        doctor = Doctor.query.get_or_404(doctor_id)
        db.session.delete(doctor)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Médecin supprimé avec succès'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/doctors/<int:doctor_id>/toggle-status', methods=['POST'])
def toggle_doctor_status(doctor_id):
    """Activer/Désactiver un médecin"""
    try:
        doctor = Doctor.query.get_or_404(doctor_id)
        doctor.is_active = not doctor.is_active
        doctor.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'Médecin {"activé" if doctor.is_active else "désactivé"} avec succès',
            'doctor': doctor.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/doctors/stats', methods=['GET'])
def get_doctor_stats():
    """Obtenir les statistiques des médecins"""
    try:
        total = Doctor.query.count()
        active = Doctor.query.filter_by(is_active=True).count()
        inactive = Doctor.query.filter_by(is_active=False).count()
        
        # Médecins par spécialisation
        from sqlalchemy import func
        specializations = db.session.query(
            Doctor.specialization,
            func.count(Doctor.id).label('count')
        ).group_by(Doctor.specialization)\
         .order_by(func.count(Doctor.id).desc())\
         .all()
        
        # Médecins par ville
        cities = db.session.query(
            Doctor.city,
            func.count(Doctor.id).label('count')
        ).filter(Doctor.city.isnot(None))\
         .group_by(Doctor.city)\
         .order_by(func.count(Doctor.id).desc())\
         .limit(5).all()
        
        # Nouveaux médecins ce mois
        first_day = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        new_this_month = Doctor.query.filter(Doctor.created_at >= first_day).count()
        
        return jsonify({
            'success': True,
            'stats': {
                'total': total,
                'active': active,
                'inactive': inactive,
                'new_this_month': new_this_month,
                'by_specialization': [
                    {'specialization': spec, 'count': count}
                    for spec, count in specializations
                ],
                'by_city': [
                    {'city': city, 'count': count}
                    for city, count in cities
                ]
            }
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/doctors/specializations', methods=['GET'])
def get_specializations():
    """Récupérer toutes les spécialisations"""
    try:
        specializations = Specialization.query.all()
        return jsonify({
            'success': True,
            'specializations': [s.to_dict() for s in specializations]
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/doctors/specializations', methods=['POST'])
def create_specialization():
    """Créer une nouvelle spécialisation"""
    try:
        data = request.get_json()
        
        if 'name' not in data:
            return jsonify({'success': False, 'error': 'name est requis'}), 400
        
        # Vérifier si existe déjà
        if Specialization.query.filter_by(name=data['name']).first():
            return jsonify({'success': False, 'error': 'Spécialisation déjà existante'}), 400
        
        specialization = Specialization(
            name=data['name'],
            description=data.get('description')
        )
        
        db.session.add(specialization)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Spécialisation créée avec succès',
            'specialization': specialization.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/doctors/available', methods=['GET'])
def get_available_doctors():
    """Récupérer les médecins disponibles"""
    try:
        day = request.args.get('day')  # Lundi, Mardi, etc.
        specialization = request.args.get('specialization')
        
        query = Doctor.query.filter_by(is_active=True)
        
        if specialization:
            query = query.filter_by(specialization=specialization)
        
        if day:
            query = query.filter(Doctor.working_days.contains(day))
        
        doctors = query.all()
        
        return jsonify({
            'success': True,
            'doctors': [d.to_dict() for d in doctors],
            'count': len(doctors)
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# ==================== MAIN ====================
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        
        # Créer des spécialisations par défaut
        default_specializations = [
            {'name': 'Médecine Générale', 'description': 'Médecin généraliste'},
            {'name': 'Cardiologie', 'description': 'Spécialiste du cœur et système cardiovasculaire'},
            {'name': 'Pédiatrie', 'description': 'Médecin pour enfants'},
            {'name': 'Dermatologie', 'description': 'Spécialiste de la peau'},
            {'name': 'Neurologie', 'description': 'Spécialiste du système nerveux'},
            {'name': 'Orthopédie', 'description': 'Spécialiste des os et articulations'},
            {'name': 'Gynécologie', 'description': 'Santé féminine'},
            {'name': 'Ophtalmologie', 'description': 'Spécialiste des yeux'},
            {'name': 'ORL', 'description': 'Oreilles, Nez, Gorge'},
            {'name': 'Psychiatrie', 'description': 'Santé mentale'}
        ]
        
        for spec_data in default_specializations:
            if not Specialization.query.filter_by(name=spec_data['name']).first():
                spec = Specialization(**spec_data)
                db.session.add(spec)
        
        db.session.commit()
        print("✅ Doctor Service: Database tables created successfully!")
    
    port = int(os.getenv('PORT', 5006))
    app.run(host='0.0.0.0', port=port, debug=True)