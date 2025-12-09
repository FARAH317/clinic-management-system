# backend/services/prescription-service/app.py
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime, timedelta
import os
import requests

app = Flask(__name__)
CORS(app)


# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///prescriptions.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# URLs des autres services
PATIENT_SERVICE_URL = os.getenv('PATIENT_SERVICE_URL', 'http://localhost:5002')
MEDICINE_SERVICE_URL = os.getenv('MEDICINE_SERVICE_URL', 'http://localhost:5005')

# ==================== MODELS ====================
class Prescription(db.Model):
    __tablename__ = 'prescriptions'
    
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, nullable=False)
    doctor_name = db.Column(db.String(100), nullable=False)
    diagnosis = db.Column(db.String(200), nullable=False)
    notes = db.Column(db.Text)
    prescription_date = db.Column(db.DateTime, default=datetime.utcnow)
    valid_until = db.Column(db.DateTime)
    status = db.Column(db.String(20), default='active')  # active, expired, cancelled
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relation avec les médicaments prescrits
    medications = db.relationship('PrescriptionMedication', backref='prescription', cascade='all, delete-orphan')
    
    def to_dict(self, include_medications=True):
        result = {
            'id': self.id,
            'patient_id': self.patient_id,
            'doctor_name': self.doctor_name,
            'diagnosis': self.diagnosis,
            'notes': self.notes,
            'prescription_date': self.prescription_date.strftime('%Y-%m-%d %H:%M'),
            'valid_until': self.valid_until.strftime('%Y-%m-%d') if self.valid_until else None,
            'status': self.status,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S')
        }
        
        if include_medications:
            result['medications'] = [m.to_dict() for m in self.medications]
        
        return result

class PrescriptionMedication(db.Model):
    __tablename__ = 'prescription_medications'
    
    id = db.Column(db.Integer, primary_key=True)
    prescription_id = db.Column(db.Integer, db.ForeignKey('prescriptions.id'), nullable=False)
    medicine_id = db.Column(db.Integer, nullable=False)  # ID du médicament dans medicine-service
    medicine_name = db.Column(db.String(100), nullable=False)  # Cache du nom
    dosage = db.Column(db.String(50), nullable=False)  # ex: "500mg"
    frequency = db.Column(db.String(100), nullable=False)  # ex: "2 fois par jour"
    duration = db.Column(db.String(50), nullable=False)  # ex: "7 jours"
    instructions = db.Column(db.Text)  # Instructions spéciales
    quantity = db.Column(db.Integer, default=1)  # Nombre de boîtes/unités
    
    def to_dict(self):
        return {
            'id': self.id,
            'medicine_id': self.medicine_id,
            'medicine_name': self.medicine_name,
            'dosage': self.dosage,
            'frequency': self.frequency,
            'duration': self.duration,
            'instructions': self.instructions,
            'quantity': self.quantity
        }

# ==================== HELPER FUNCTIONS ====================
def get_patient_info(patient_id):
    """Récupérer les infos d'un patient"""
    try:
        response = requests.get(f"{PATIENT_SERVICE_URL}/api/patients/{patient_id}")
        if response.status_code == 200:
            return response.json().get('patient')
        return None
    except Exception as e:
        print(f"Erreur récupération patient: {e}")
        return None

def get_medicine_info(medicine_id):
    """Récupérer les infos d'un médicament"""
    try:
        response = requests.get(f"{MEDICINE_SERVICE_URL}/api/medicines/{medicine_id}")
        if response.status_code == 200:
            return response.json().get('medicine')
        return None
    except Exception as e:
        print(f"Erreur récupération médicament: {e}")
        return None

def check_medicine_stock(medicine_id, quantity):
    """Vérifier le stock d'un médicament"""
    try:
        response = requests.get(f"{MEDICINE_SERVICE_URL}/api/medicines/{medicine_id}/stock")
        if response.status_code == 200:
            stock = response.json().get('stock', 0)
            return stock >= quantity
        return False
    except Exception as e:
        print(f"Erreur vérification stock: {e}")
        return False

# ==================== ROUTES ====================

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'service': 'prescription-service'}), 200

@app.route('/api/prescriptions', methods=['GET'])
def get_prescriptions():
    """Récupérer toutes les ordonnances"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        status = request.args.get('status')
        patient_id = request.args.get('patient_id', type=int)
        
        query = Prescription.query
        
        # Filtrer par statut
        if status:
            query = query.filter_by(status=status)
        
        # Filtrer par patient
        if patient_id:
            query = query.filter_by(patient_id=patient_id)
        
        # Pagination
        pagination = query.order_by(Prescription.prescription_date.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        # Enrichir avec les données patients
        prescriptions = []
        for pres in pagination.items:
            pres_dict = pres.to_dict()
            patient = get_patient_info(pres.patient_id)
            if patient:
                pres_dict['patient'] = {
                    'name': f"{patient['first_name']} {patient['last_name']}",
                    'email': patient['email']
                }
            prescriptions.append(pres_dict)
        
        return jsonify({
            'success': True,
            'prescriptions': prescriptions,
            'total': pagination.total,
            'pages': pagination.pages,
            'current_page': page
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/prescriptions/<int:prescription_id>', methods=['GET'])
def get_prescription(prescription_id):
    """Récupérer une ordonnance par ID"""
    try:
        prescription = Prescription.query.get_or_404(prescription_id)
        pres_dict = prescription.to_dict()
        
        # Ajouter les infos du patient
        patient = get_patient_info(prescription.patient_id)
        if patient:
            pres_dict['patient'] = patient
        
        # Enrichir les médicaments avec les détails complets
        for med in pres_dict['medications']:
            medicine = get_medicine_info(med['medicine_id'])
            if medicine:
                med['medicine_details'] = medicine
        
        return jsonify({'success': True, 'prescription': pres_dict}), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 404

@app.route('/api/prescriptions', methods=['POST'])
def create_prescription():
    """Créer une nouvelle ordonnance"""
    try:
        data = request.get_json()
        
        # Validation
        required_fields = ['patient_id', 'doctor_name', 'diagnosis', 'medications']
        for field in required_fields:
            if field not in data:
                return jsonify({'success': False, 'error': f'{field} est requis'}), 400
        
        if not isinstance(data['medications'], list) or len(data['medications']) == 0:
            return jsonify({'success': False, 'error': 'Au moins un médicament requis'}), 400
        
        # Vérifier que le patient existe
        patient = get_patient_info(data['patient_id'])
        if not patient:
            return jsonify({'success': False, 'error': 'Patient non trouvé'}), 404
        
        # Calculer la date de validité (30 jours par défaut)
        valid_until = datetime.utcnow() + timedelta(days=data.get('validity_days', 30))
        
        # Créer l'ordonnance
        prescription = Prescription(
            patient_id=data['patient_id'],
            doctor_name=data['doctor_name'],
            diagnosis=data['diagnosis'],
            notes=data.get('notes'),
            valid_until=valid_until,
            status='active'
        )
        
        db.session.add(prescription)
        db.session.flush()  # Pour obtenir l'ID
        
        # Ajouter les médicaments
        for med_data in data['medications']:
            # Validation des champs médicament
            required_med_fields = ['medicine_id', 'dosage', 'frequency', 'duration']
            for field in required_med_fields:
                if field not in med_data:
                    db.session.rollback()
                    return jsonify({'success': False, 'error': f'{field} requis pour chaque médicament'}), 400
            
            # Récupérer le nom du médicament
            medicine = get_medicine_info(med_data['medicine_id'])
            if not medicine:
                db.session.rollback()
                return jsonify({'success': False, 'error': f'Médicament {med_data["medicine_id"]} non trouvé'}), 404
            
            # Vérifier le stock (optionnel)
            quantity = med_data.get('quantity', 1)
            if not check_medicine_stock(med_data['medicine_id'], quantity):
                print(f"⚠️ Stock insuffisant pour {medicine['name']}")
            
            # Ajouter le médicament à l'ordonnance
            pres_med = PrescriptionMedication(
                prescription_id=prescription.id,
                medicine_id=med_data['medicine_id'],
                medicine_name=medicine['name'],
                dosage=med_data['dosage'],
                frequency=med_data['frequency'],
                duration=med_data['duration'],
                instructions=med_data.get('instructions'),
                quantity=quantity
            )
            db.session.add(pres_med)
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Ordonnance créée avec succès',
            'prescription': prescription.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/prescriptions/<int:prescription_id>', methods=['PUT'])
def update_prescription(prescription_id):
    """Mettre à jour une ordonnance"""
    try:
        prescription = Prescription.query.get_or_404(prescription_id)
        data = request.get_json()
        
        # Mettre à jour les champs
        if 'doctor_name' in data:
            prescription.doctor_name = data['doctor_name']
        if 'diagnosis' in data:
            prescription.diagnosis = data['diagnosis']
        if 'notes' in data:
            prescription.notes = data['notes']
        if 'status' in data:
            prescription.status = data['status']
        if 'valid_until' in data:
            prescription.valid_until = datetime.strptime(data['valid_until'], '%Y-%m-%d')
        
        prescription.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Ordonnance mise à jour avec succès',
            'prescription': prescription.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/prescriptions/<int:prescription_id>', methods=['DELETE'])
def delete_prescription(prescription_id):
    """Supprimer une ordonnance"""
    try:
        prescription = Prescription.query.get_or_404(prescription_id)
        db.session.delete(prescription)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Ordonnance supprimée avec succès'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/prescriptions/<int:prescription_id>/medications', methods=['POST'])
def add_medication_to_prescription(prescription_id):
    """Ajouter un médicament à une ordonnance existante"""
    try:
        prescription = Prescription.query.get_or_404(prescription_id)
        data = request.get_json()
        
        # Validation
        required_fields = ['medicine_id', 'dosage', 'frequency', 'duration']
        for field in required_fields:
            if field not in data:
                return jsonify({'success': False, 'error': f'{field} est requis'}), 400
        
        # Récupérer le nom du médicament
        medicine = get_medicine_info(data['medicine_id'])
        if not medicine:
            return jsonify({'success': False, 'error': 'Médicament non trouvé'}), 404
        
        # Ajouter le médicament
        pres_med = PrescriptionMedication(
            prescription_id=prescription_id,
            medicine_id=data['medicine_id'],
            medicine_name=medicine['name'],
            dosage=data['dosage'],
            frequency=data['frequency'],
            duration=data['duration'],
            instructions=data.get('instructions'),
            quantity=data.get('quantity', 1)
        )
        
        db.session.add(pres_med)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Médicament ajouté à l\'ordonnance',
            'medication': pres_med.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/prescriptions/medications/<int:medication_id>', methods=['DELETE'])
def remove_medication(medication_id):
    """Retirer un médicament d'une ordonnance"""
    try:
        medication = PrescriptionMedication.query.get_or_404(medication_id)
        db.session.delete(medication)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Médicament retiré de l\'ordonnance'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/prescriptions/patient/<int:patient_id>', methods=['GET'])
def get_patient_prescriptions(patient_id):
    """Récupérer toutes les ordonnances d'un patient"""
    try:
        prescriptions = Prescription.query.filter_by(patient_id=patient_id)\
            .order_by(Prescription.prescription_date.desc())\
            .all()
        
        return jsonify({
            'success': True,
            'prescriptions': [p.to_dict() for p in prescriptions]
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/prescriptions/stats', methods=['GET'])
def get_prescription_stats():
    """Obtenir les statistiques des ordonnances"""
    try:
        total = Prescription.query.count()
        active = Prescription.query.filter_by(status='active').count()
        expired = Prescription.query.filter_by(status='expired').count()
        
        # Ordonnances ce mois
        first_day = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        this_month = Prescription.query.filter(
            Prescription.prescription_date >= first_day
        ).count()
        
        # Médicaments les plus prescrits
        from sqlalchemy import func
        most_prescribed = db.session.query(
            PrescriptionMedication.medicine_name,
            func.count(PrescriptionMedication.id).label('count')
        ).group_by(PrescriptionMedication.medicine_name)\
         .order_by(func.count(PrescriptionMedication.id).desc())\
         .limit(5).all()
        
        return jsonify({
            'success': True,
            'stats': {
                'total': total,
                'active': active,
                'expired': expired,
                'this_month': this_month,
                'most_prescribed': [
                    {'name': name, 'count': count}
                    for name, count in most_prescribed
                ]
            }
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/prescriptions/check-expiry', methods=['GET'])
def check_expiring_prescriptions():
    """Vérifier les ordonnances qui expirent bientôt"""
    try:
        # Ordonnances qui expirent dans les 7 prochains jours
        today = datetime.utcnow()
        week_later = today + timedelta(days=7)
        
        expiring = Prescription.query.filter(
            Prescription.status == 'active',
            Prescription.valid_until <= week_later,
            Prescription.valid_until >= today
        ).all()
        
        result = []
        for pres in expiring:
            pres_dict = pres.to_dict(include_medications=False)
            patient = get_patient_info(pres.patient_id)
            if patient:
                pres_dict['patient'] = {
                    'name': f"{patient['first_name']} {patient['last_name']}",
                    'email': patient['email'],
                    'phone': patient['phone']
                }
            result.append(pres_dict)
        
        return jsonify({
            'success': True,
            'expiring_prescriptions': result,
            'count': len(result)
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# ==================== MAIN ====================
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        print("✅ Prescription Service: Database tables created successfully!")
    
    port = int(os.getenv('PORT', 5004))
    app.run(host='0.0.0.0', port=port, debug=True)