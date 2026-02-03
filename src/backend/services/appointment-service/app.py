# backend/services/appointment-service/app.py
# Template pour les autres services (RDV, Ordonnances, Médicaments)

from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime, timedelta
import os
import requests

app = Flask(__name__)
CORS(app)

# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///appointments.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# URLs des autres services
PATIENT_SERVICE_URL = os.getenv('PATIENT_SERVICE_URL', 'http://localhost:5002')

# ==================== MODELS ====================
class Appointment(db.Model):
    __tablename__ = 'appointments'
    
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, nullable=False)
    doctor_name = db.Column(db.String(100), nullable=False)
    appointment_date = db.Column(db.DateTime, nullable=False)
    duration = db.Column(db.Integer, default=30)  # en minutes
    status = db.Column(db.String(20), default='scheduled')  # scheduled, completed, cancelled
    reason = db.Column(db.String(200))
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'doctor_name': self.doctor_name,
            'appointment_date': self.appointment_date.strftime('%Y-%m-%d %H:%M'),
            'duration': self.duration,
            'status': self.status,
            'reason': self.reason,
            'notes': self.notes,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S')
        }

# ==================== HELPER FUNCTIONS ====================
def get_patient_from_service(patient_id):
    """Récupérer les infos d'un patient depuis le patient-service"""
    try:
        response = requests.get(f"{PATIENT_SERVICE_URL}/api/patients/{patient_id}")
        if response.status_code == 200:
            data = response.json()
            return data.get('patient')
        return None
    except Exception as e:
        print(f"Erreur lors de la récupération du patient: {e}")
        return None

def update_past_appointments():
    """Mettre à jour automatiquement le statut des rendez-vous passés"""
    try:
        now = datetime.utcnow()

        # Mettre à jour les rendez-vous passés qui ne sont pas encore terminés ou annulés
        past_appointments = Appointment.query.filter(
            Appointment.appointment_date < now,
            Appointment.status == 'scheduled'  # Ne mettre à jour que les rendez-vous planifiés
        ).all()

        updated_count = 0
        for appointment in past_appointments:
            appointment.status = 'completed'
            appointment.updated_at = datetime.utcnow()
            updated_count += 1

        if updated_count > 0:
            db.session.commit()
            print(f"✅ {updated_count} rendez-vous passés automatiquement marqués comme terminés")

        return updated_count
    except Exception as e:
        print(f"Erreur lors de la mise à jour automatique des rendez-vous: {e}")
        db.session.rollback()
        return 0

# ==================== ROUTES ====================

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'service': 'appointment-service'}), 200

@app.route('/api/appointments', methods=['GET'])
def get_appointments():
    """Récupérer tous les rendez-vous"""
    try:
        # Mettre à jour automatiquement les rendez-vous passés avant de récupérer la liste
        update_past_appointments()

        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        status = request.args.get('status')
        date = request.args.get('date')  # Format: YYYY-MM-DD

        query = Appointment.query
        
        # Filtrer par statut
        if status:
            query = query.filter_by(status=status)
        
        # Filtrer par date
        if date:
            target_date = datetime.strptime(date, '%Y-%m-%d')
            next_day = target_date + timedelta(days=1)
            query = query.filter(
                Appointment.appointment_date >= target_date,
                Appointment.appointment_date < next_day
            )
        
        # Pagination
        pagination = query.order_by(Appointment.appointment_date.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        # Enrichir avec les données patients
        appointments = []
        for apt in pagination.items:
            apt_dict = apt.to_dict()
            patient = get_patient_from_service(apt.patient_id)
            if patient:
                apt_dict['patient'] = {
                    'name': f"{patient['first_name']} {patient['last_name']}",
                    'email': patient['email'],
                    'phone': patient['phone']
                }
            appointments.append(apt_dict)
        
        return jsonify({
            'success': True,
            'appointments': appointments,
            'total': pagination.total,
            'pages': pagination.pages,
            'current_page': page
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/appointments/<int:appointment_id>', methods=['GET'])
def get_appointment(appointment_id):
    """Récupérer un rendez-vous par ID"""
    try:
        appointment = Appointment.query.get_or_404(appointment_id)
        apt_dict = appointment.to_dict()
        
        # Ajouter les infos du patient
        patient = get_patient_from_service(appointment.patient_id)
        if patient:
            apt_dict['patient'] = patient
        
        return jsonify({'success': True, 'appointment': apt_dict}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 404

@app.route('/api/appointments', methods=['POST'])
@app.route('/api/appointments', methods=['POST'])
def create_appointment():
    """Créer un nouveau rendez-vous (patients sans compte possible)"""
    try:
        data = request.get_json()

        # Validation minimale
        required_fields = ['first_name', 'last_name', 'email', 'doctor_name', 'appointment_date']
        for field in required_fields:
            if field not in data:
                return jsonify({'success': False, 'error': f'{field} est requis'}), 400

        # Vérifier si le patient existe via email
        patient_res = requests.get(f"{PATIENT_SERVICE_URL}/api/patients?search={data['email']}")
        if patient_res.status_code == 200 and patient_res.json().get('patients'):
            patient = patient_res.json()['patients'][0]
            patient_id = patient['id']
        else:
            # Créer le patient si inexistant
            new_patient_res = requests.post(f"{PATIENT_SERVICE_URL}/api/patients", json={
                'first_name': data['first_name'],
                'last_name': data['last_name'],
                'email': data['email'],
                'phone': data.get('phone', ''),
                'date_of_birth': data.get('date_of_birth', '1990-01-01'),
                'gender': data.get('gender', 'Homme')
            })
            if new_patient_res.status_code == 201 and new_patient_res.json().get('success'):
                patient_id = new_patient_res.json()['patient']['id']
            else:
                return jsonify({'success': False, 'error': 'Impossible de créer le patient'}), 500

        # Créer le rendez-vous
        # Handle both formats: with seconds and without seconds
        try:
            appointment_date = datetime.strptime(data['appointment_date'], '%Y-%m-%d %H:%M:%S')
        except ValueError:
            appointment_date = datetime.strptime(data['appointment_date'], '%Y-%m-%d %H:%M')

        appointment = Appointment(
            patient_id=patient_id,
            doctor_name=data['doctor_name'],
            appointment_date=appointment_date,
            duration=data.get('duration', 30),
            reason=data.get('reason'),
            notes=data.get('notes')
        )

        db.session.add(appointment)
        db.session.commit()

        return jsonify({'success': True, 'appointment': appointment.to_dict()}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/appointments/<int:appointment_id>', methods=['PUT'])
def update_appointment(appointment_id):
    """Mettre à jour un rendez-vous"""
    try:
        appointment = Appointment.query.get_or_404(appointment_id)
        data = request.get_json()
        
        # Mettre à jour les champs
        if 'doctor_name' in data:
            appointment.doctor_name = data['doctor_name']
        if 'appointment_date' in data:
            # Handle both formats: with seconds and without seconds
            try:
                appointment.appointment_date = datetime.strptime(data['appointment_date'], '%Y-%m-%d %H:%M:%S')
            except ValueError:
                appointment.appointment_date = datetime.strptime(data['appointment_date'], '%Y-%m-%d %H:%M')
        if 'duration' in data:
            appointment.duration = data['duration']
        if 'status' in data:
            appointment.status = data['status']
        if 'reason' in data:
            appointment.reason = data['reason']
        if 'notes' in data:
            appointment.notes = data['notes']
        
        appointment.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Rendez-vous mis à jour avec succès',
            'appointment': appointment.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/appointments/<int:appointment_id>', methods=['DELETE'])
def delete_appointment(appointment_id):
    """Supprimer un rendez-vous"""
    try:
        appointment = Appointment.query.get_or_404(appointment_id)
        db.session.delete(appointment)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Rendez-vous supprimé avec succès'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/appointments/stats', methods=['GET'])
def get_appointment_stats():
    """Obtenir les statistiques des rendez-vous"""
    try:
        today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        tomorrow = today + timedelta(days=1)
        week_later = today + timedelta(days=7)
        
        total = Appointment.query.count()
        today_count = Appointment.query.filter(
            Appointment.appointment_date >= today,
            Appointment.appointment_date < tomorrow
        ).count()
        
        this_week = Appointment.query.filter(
            Appointment.appointment_date >= today,
            Appointment.appointment_date < week_later
        ).count()
        
        completed = Appointment.query.filter_by(status='completed').count()
        cancelled = Appointment.query.filter_by(status='cancelled').count()
        
        return jsonify({
            'success': True,
            'stats': {
                'total': total,
                'today': today_count,
                'this_week': this_week,
                'completed': completed,
                'cancelled': cancelled
            }
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/appointments/patient/<int:patient_id>', methods=['GET'])
def get_patient_appointments(patient_id):
    """Récupérer tous les rendez-vous d'un patient"""
    try:
        appointments = Appointment.query.filter_by(patient_id=patient_id)\
            .order_by(Appointment.appointment_date.desc())\
            .all()

        return jsonify({
            'success': True,
            'appointments': [apt.to_dict() for apt in appointments]
        }), 200

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/appointments/update-past', methods=['POST'])
def manual_update_past_appointments():
    """Mettre à jour manuellement les rendez-vous passés (endpoint admin)"""
    try:
        updated_count = update_past_appointments()

        return jsonify({
            'success': True,
            'message': f'{updated_count} rendez-vous passés mis à jour',
            'updated_count': updated_count
        }), 200

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# ==================== MAIN ====================
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        print("✅ Appointment Service: Database tables created successfully!")
    
    port = int(os.getenv('PORT', 5003))
    app.run(host='0.0.0.0', port=port, debug=True)