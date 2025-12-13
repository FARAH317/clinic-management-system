# backend/services/billing-service/app.py
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime
import os
import requests

app = Flask(__name__)
CORS(app)

# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///billing.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# URLs des autres services
APPOINTMENT_SERVICE_URL = os.getenv('APPOINTMENT_SERVICE_URL', 'http://appointment-service:5003')
PATIENT_SERVICE_URL = os.getenv('PATIENT_SERVICE_URL', 'http://patient-service:5002')
DOCTOR_SERVICE_URL = os.getenv('DOCTOR_SERVICE_URL', 'http://doctor-service:5006')

# ==================== MODELS ====================
class Invoice(db.Model):
    __tablename__ = 'invoices'
    
    id = db.Column(db.Integer, primary_key=True)
    consultation_id = db.Column(db.Integer, nullable=False)  # ID du rendez-vous
    patient_id = db.Column(db.Integer, nullable=False)
    doctor_id = db.Column(db.Integer, nullable=False)
    
    # Montants
    montant_total = db.Column(db.Float, nullable=False)  # Montant total
    remboursement = db.Column(db.Float, default=0.0)  # Remboursement mutuelle/assurance
    reste_a_payer = db.Column(db.Float, nullable=False)  # Montant restant
    
    # Détails
    consultation_fee = db.Column(db.Float, default=0.0)
    medication_cost = db.Column(db.Float, default=0.0)
    additional_fees = db.Column(db.Float, default=0.0)
    
    # Statut
    status = db.Column(db.String(20), default='pending')  # pending, paid, cancelled
    payment_method = db.Column(db.String(50))  # cash, card, insurance, etc.
    
    # Dates
    invoice_date = db.Column(db.DateTime, default=datetime.utcnow)
    payment_date = db.Column(db.DateTime)
    due_date = db.Column(db.DateTime)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'consultation_id': self.consultation_id,
            'patient_id': self.patient_id,
            'doctor_id': self.doctor_id,
            'montant_total': round(self.montant_total, 2),
            'remboursement': round(self.remboursement, 2),
            'reste_a_payer': round(self.reste_a_payer, 2),
            'consultation_fee': round(self.consultation_fee, 2),
            'medication_cost': round(self.medication_cost, 2),
            'additional_fees': round(self.additional_fees, 2),
            'status': self.status,
            'payment_method': self.payment_method,
            'invoice_date': self.invoice_date.strftime('%Y-%m-%d %H:%M:%S'),
            'payment_date': self.payment_date.strftime('%Y-%m-%d %H:%M:%S') if self.payment_date else None,
            'due_date': self.due_date.strftime('%Y-%m-%d') if self.due_date else None,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S')
        }

class BMIRecord(db.Model):
    __tablename__ = 'bmi_records'
    
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, nullable=False)
    consultation_id = db.Column(db.Integer)
    
    # Mesures
    weight = db.Column(db.Float, nullable=False)  # en kg
    height = db.Column(db.Float, nullable=False)  # en cm
    bmi = db.Column(db.Float, nullable=False)  # IMC calculé
    category = db.Column(db.String(50))  # Sous-poids, Normal, Surpoids, Obésité
    
    # Notes
    notes = db.Column(db.Text)
    recorded_by = db.Column(db.String(100))  # Médecin/infirmière
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'consultation_id': self.consultation_id,
            'weight': self.weight,
            'height': self.height,
            'bmi': round(self.bmi, 2),
            'category': self.category,
            'notes': self.notes,
            'recorded_by': self.recorded_by,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S')
        }

# ==================== HELPER FUNCTIONS ====================
def calculate_bmi(weight, height_cm):
    """Calculer l'IMC et déterminer la catégorie"""
    height_m = height_cm / 100
    bmi = weight / (height_m ** 2)
    
    if bmi < 18.5:
        category = "Insuffisance pondérale"
    elif 18.5 <= bmi < 25:
        category = "Poids normal"
    elif 25 <= bmi < 30:
        category = "Surpoids"
    elif 30 <= bmi < 35:
        category = "Obésité modérée"
    elif 35 <= bmi < 40:
        category = "Obésité sévère"
    else:
        category = "Obésité morbide"
    
    return round(bmi, 2), category

def get_doctor_fee(doctor_id):
    """Récupérer les frais de consultation du médecin"""
    try:
        response = requests.get(f"{DOCTOR_SERVICE_URL}/api/doctors/{doctor_id}")
        if response.status_code == 200:
            doctor = response.json().get('doctor')
            return doctor.get('consultation_fee', 50.0)
        return 50.0
    except:
        return 50.0

# ==================== ROUTES - BILLING ====================

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'service': 'billing-service'}), 200

@app.route('/api/invoices', methods=['GET'])
def get_invoices():
    """Récupérer toutes les factures"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        status = request.args.get('status')
        patient_id = request.args.get('patient_id', type=int)
        
        query = Invoice.query
        
        if status:
            query = query.filter_by(status=status)
        if patient_id:
            query = query.filter_by(patient_id=patient_id)
        
        pagination = query.order_by(Invoice.invoice_date.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'success': True,
            'invoices': [i.to_dict() for i in pagination.items],
            'total': pagination.total,
            'pages': pagination.pages,
            'current_page': page
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/invoices/<int:invoice_id>', methods=['GET'])
def get_invoice(invoice_id):
    """Récupérer une facture"""
    try:
        invoice = Invoice.query.get_or_404(invoice_id)
        return jsonify({'success': True, 'invoice': invoice.to_dict()}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 404

@app.route('/api/invoices', methods=['POST'])
def create_invoice():
    """Créer une nouvelle facture"""
    try:
        data = request.get_json()
        
        required_fields = ['consultation_id', 'patient_id', 'doctor_id']
        for field in required_fields:
            if field not in data:
                return jsonify({'success': False, 'error': f'{field} est requis'}), 400
        
        # Récupérer les frais de consultation
        consultation_fee = get_doctor_fee(data['doctor_id'])
        
        # Calculer les coûts
        medication_cost = data.get('medication_cost', 0.0)
        additional_fees = data.get('additional_fees', 0.0)
        montant_total = consultation_fee + medication_cost + additional_fees
        
        # Calculer le remboursement et reste à payer
        remboursement = data.get('remboursement', 0.0)
        reste_a_payer = montant_total - remboursement
        
        # Créer la facture
        invoice = Invoice(
            consultation_id=data['consultation_id'],
            patient_id=data['patient_id'],
            doctor_id=data['doctor_id'],
            consultation_fee=consultation_fee,
            medication_cost=medication_cost,
            additional_fees=additional_fees,
            montant_total=montant_total,
            remboursement=remboursement,
            reste_a_payer=reste_a_payer,
            status=data.get('status', 'pending'),
            payment_method=data.get('payment_method'),
            due_date=datetime.strptime(data['due_date'], '%Y-%m-%d') if data.get('due_date') else None
        )
        
        db.session.add(invoice)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Facture créée avec succès',
            'invoice': invoice.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/invoices/<int:invoice_id>', methods=['PUT'])
def update_invoice(invoice_id):
    """Mettre à jour une facture"""
    try:
        invoice = Invoice.query.get_or_404(invoice_id)
        data = request.get_json()
        
        if 'status' in data:
            invoice.status = data['status']
            if data['status'] == 'paid' and not invoice.payment_date:
                invoice.payment_date = datetime.utcnow()
        
        if 'payment_method' in data:
            invoice.payment_method = data['payment_method']
        
        if 'remboursement' in data:
            invoice.remboursement = data['remboursement']
            invoice.reste_a_payer = invoice.montant_total - invoice.remboursement
        
        invoice.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Facture mise à jour',
            'invoice': invoice.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/invoices/<int:invoice_id>', methods=['DELETE'])
def delete_invoice(invoice_id):
    """Supprimer une facture"""
    try:
        invoice = Invoice.query.get_or_404(invoice_id)
        db.session.delete(invoice)
        db.session.commit()
        
        return jsonify({'success': True, 'message': 'Facture supprimée'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/invoices/stats', methods=['GET'])
def get_invoice_stats():
    """Statistiques des factures"""
    try:
        total_invoices = Invoice.query.count()
        pending = Invoice.query.filter_by(status='pending').count()
        paid = Invoice.query.filter_by(status='paid').count()
        
        from sqlalchemy import func
        total_revenue = db.session.query(func.sum(Invoice.montant_total)).filter_by(status='paid').scalar() or 0
        total_pending = db.session.query(func.sum(Invoice.reste_a_payer)).filter_by(status='pending').scalar() or 0
        
        return jsonify({
            'success': True,
            'stats': {
                'total_invoices': total_invoices,
                'pending': pending,
                'paid': paid,
                'total_revenue': round(total_revenue, 2),
                'total_pending': round(total_pending, 2)
            }
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# ==================== ROUTES - BMI ====================

@app.route('/api/bmi/calculate', methods=['POST'])
def calculate_bmi_route():
    """Calculer l'IMC"""
    try:
        data = request.get_json()
        
        if 'weight' not in data or 'height' not in data:
            return jsonify({'success': False, 'error': 'weight et height requis'}), 400
        
        weight = float(data['weight'])
        height = float(data['height'])
        
        if weight <= 0 or height <= 0:
            return jsonify({'success': False, 'error': 'Valeurs invalides'}), 400
        
        bmi, category = calculate_bmi(weight, height)
        
        # Enregistrer si patient_id fourni
        if 'patient_id' in data:
            record = BMIRecord(
                patient_id=data['patient_id'],
                consultation_id=data.get('consultation_id'),
                weight=weight,
                height=height,
                bmi=bmi,
                category=category,
                notes=data.get('notes'),
                recorded_by=data.get('recorded_by')
            )
            db.session.add(record)
            db.session.commit()
        
        return jsonify({
            'success': True,
            'bmi': bmi,
            'category': category,
            'weight': weight,
            'height': height
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/bmi/records', methods=['GET'])
def get_bmi_records():
    """Récupérer les enregistrements IMC"""
    try:
        patient_id = request.args.get('patient_id', type=int)
        
        query = BMIRecord.query
        if patient_id:
            query = query.filter_by(patient_id=patient_id)
        
        records = query.order_by(BMIRecord.created_at.desc()).all()
        
        return jsonify({
            'success': True,
            'records': [r.to_dict() for r in records]
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/bmi/records/<int:record_id>', methods=['DELETE'])
def delete_bmi_record(record_id):
    """Supprimer un enregistrement IMC"""
    try:
        record = BMIRecord.query.get_or_404(record_id)
        db.session.delete(record)
        db.session.commit()
        
        return jsonify({'success': True, 'message': 'Enregistrement supprimé'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

# ==================== MAIN ====================
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        print("✅ Billing Service: Database tables created successfully!")
    
    port = int(os.getenv('PORT', 5007))
    app.run(host='0.0.0.0', port=port, debug=True)