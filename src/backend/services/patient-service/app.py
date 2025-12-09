# backend/services/patient-service/app.py
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)


# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///patients.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# ==================== MODELS ====================
class Patient(db.Model):
    __tablename__ = 'patients'
    
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    date_of_birth = db.Column(db.Date, nullable=False)
    gender = db.Column(db.String(10), nullable=False)
    address = db.Column(db.String(200))
    blood_group = db.Column(db.String(5))
    allergies = db.Column(db.Text)
    medical_history = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'email': self.email,
            'phone': self.phone,
            'date_of_birth': self.date_of_birth.strftime('%Y-%m-%d'),
            'gender': self.gender,
            'address': self.address,
            'blood_group': self.blood_group,
            'allergies': self.allergies,
            'medical_history': self.medical_history,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            'updated_at': self.updated_at.strftime('%Y-%m-%d %H:%M:%S')
        }

# ==================== ROUTES ====================
@app.route('/')
def home():
    return jsonify({"message": "Patient service is running!"})

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'service': 'patient-service'}), 200

@app.route('/api/patients', methods=['GET'])
def get_patients():
    """Récupérer tous les patients"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        search = request.args.get('search', '')
        
        query = Patient.query
        
        # Recherche
        if search:
            query = query.filter(
                db.or_(
                    Patient.first_name.ilike(f'%{search}%'),
                    Patient.last_name.ilike(f'%{search}%'),
                    Patient.email.ilike(f'%{search}%')
                )
            )
        
        # Pagination
        pagination = query.order_by(Patient.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'success': True,
            'patients': [p.to_dict() for p in pagination.items],
            'total': pagination.total,
            'pages': pagination.pages,
            'current_page': page
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/patients/<int:patient_id>', methods=['GET'])
def get_patient(patient_id):
    """Récupérer un patient par ID"""
    try:
        patient = Patient.query.get_or_404(patient_id)
        return jsonify({'success': True, 'patient': patient.to_dict()}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 404

@app.route('/api/patients', methods=['POST'])
def create_patient():
    """Créer un nouveau patient"""
    try:
        data = request.get_json()
        
        # Validation
        required_fields = ['first_name', 'last_name', 'email', 'phone', 'date_of_birth', 'gender']
        for field in required_fields:
            if field not in data:
                return jsonify({'success': False, 'error': f'{field} est requis'}), 400
        
        # Vérifier si l'email existe déjà
        if Patient.query.filter_by(email=data['email']).first():
            return jsonify({'success': False, 'error': 'Email déjà utilisé'}), 400
        
        # Créer le patient
        patient = Patient(
            first_name=data['first_name'],
            last_name=data['last_name'],
            email=data['email'],
            phone=data['phone'],
            date_of_birth=datetime.strptime(data['date_of_birth'], '%Y-%m-%d'),
            gender=data['gender'],
            address=data.get('address'),
            blood_group=data.get('blood_group'),
            allergies=data.get('allergies'),
            medical_history=data.get('medical_history')
        )
        
        db.session.add(patient)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Patient créé avec succès',
            'patient': patient.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/patients/<int:patient_id>', methods=['PUT'])
def update_patient(patient_id):
    """Mettre à jour un patient"""
    try:
        patient = Patient.query.get_or_404(patient_id)
        data = request.get_json()
        
        # Mettre à jour les champs
        if 'first_name' in data:
            patient.first_name = data['first_name']
        if 'last_name' in data:
            patient.last_name = data['last_name']
        if 'email' in data:
            # Vérifier si le nouvel email est déjà utilisé
            existing = Patient.query.filter_by(email=data['email']).first()
            if existing and existing.id != patient_id:
                return jsonify({'success': False, 'error': 'Email déjà utilisé'}), 400
            patient.email = data['email']
        if 'phone' in data:
            patient.phone = data['phone']
        if 'date_of_birth' in data:
            patient.date_of_birth = datetime.strptime(data['date_of_birth'], '%Y-%m-%d')
        if 'gender' in data:
            patient.gender = data['gender']
        if 'address' in data:
            patient.address = data['address']
        if 'blood_group' in data:
            patient.blood_group = data['blood_group']
        if 'allergies' in data:
            patient.allergies = data['allergies']
        if 'medical_history' in data:
            patient.medical_history = data['medical_history']
        
        patient.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Patient mis à jour avec succès',
            'patient': patient.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/patients/<int:patient_id>', methods=['DELETE'])
def delete_patient(patient_id):
    """Supprimer un patient"""
    try:
        patient = Patient.query.get_or_404(patient_id)
        db.session.delete(patient)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Patient supprimé avec succès'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/patients/stats', methods=['GET'])
def get_patient_stats():
    """Obtenir les statistiques des patients"""
    try:
        total_patients = Patient.query.count()
        male_patients = Patient.query.filter_by(gender='Homme').count()
        female_patients = Patient.query.filter_by(gender='Femme').count()
        
        # Nouveaux patients ce mois
        from datetime import datetime, timedelta
        first_day = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        new_this_month = Patient.query.filter(Patient.created_at >= first_day).count()
        
        return jsonify({
            'success': True,
            'stats': {
                'total': total_patients,
                'male': male_patients,
                'female': female_patients,
                'new_this_month': new_this_month
            }
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# ==================== MAIN ====================
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        print("✅ Database tables created successfully!")
    
    port = int(os.getenv('PORT', 5002))
    app.run(host='0.0.0.0', port=port, debug=True)