# backend/services/medicine-service/app.py
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime, timedelta
import os

app = Flask(__name__)
CORS(app)


# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///medicines.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# ==================== MODELS ====================
class Medicine(db.Model):
    __tablename__ = 'medicines'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    generic_name = db.Column(db.String(100))
    manufacturer = db.Column(db.String(100))
    category = db.Column(db.String(50))  # Antibiotique, Antalgique, etc.
    description = db.Column(db.Text)
    dosage_form = db.Column(db.String(50))  # Comprimé, Sirop, Injectable, etc.
    strength = db.Column(db.String(50))  # 500mg, 10ml, etc.
    
    # Gestion du stock
    stock_quantity = db.Column(db.Integer, default=0)
    min_stock_level = db.Column(db.Integer, default=10)
    unit_price = db.Column(db.Float, default=0.0)
    
    # Informations réglementaires
    requires_prescription = db.Column(db.Boolean, default=True)
    controlled_substance = db.Column(db.Boolean, default=False)
    
    # Dates
    expiry_date = db.Column(db.Date)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relation avec l'historique
    stock_history = db.relationship('StockHistory', backref='medicine', cascade='all, delete-orphan')
    
    def to_dict(self, include_history=False):
        result = {
            'id': self.id,
            'name': self.name,
            'generic_name': self.generic_name,
            'manufacturer': self.manufacturer,
            'category': self.category,
            'description': self.description,
            'dosage_form': self.dosage_form,
            'strength': self.strength,
            'stock_quantity': self.stock_quantity,
            'min_stock_level': self.min_stock_level,
            'unit_price': self.unit_price,
            'requires_prescription': self.requires_prescription,
            'controlled_substance': self.controlled_substance,
            'expiry_date': self.expiry_date.strftime('%Y-%m-%d') if self.expiry_date else None,
            'stock_status': self.get_stock_status(),
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S')
        }
        
        if include_history:
            result['stock_history'] = [h.to_dict() for h in self.stock_history]
        
        return result
    
    def get_stock_status(self):
        """Déterminer le statut du stock"""
        if self.stock_quantity == 0:
            return 'out_of_stock'
        elif self.stock_quantity <= self.min_stock_level:
            return 'low_stock'
        else:
            return 'in_stock'

class StockHistory(db.Model):
    __tablename__ = 'stock_history'
    
    id = db.Column(db.Integer, primary_key=True)
    medicine_id = db.Column(db.Integer, db.ForeignKey('medicines.id'), nullable=False)
    transaction_type = db.Column(db.String(20), nullable=False)  # purchase, sale, adjustment, expired
    quantity = db.Column(db.Integer, nullable=False)
    previous_quantity = db.Column(db.Integer, nullable=False)
    new_quantity = db.Column(db.Integer, nullable=False)
    notes = db.Column(db.Text)
    transaction_date = db.Column(db.DateTime, default=datetime.utcnow)
    user = db.Column(db.String(100))  # Qui a fait la transaction
    
    def to_dict(self):
        return {
            'id': self.id,
            'transaction_type': self.transaction_type,
            'quantity': self.quantity,
            'previous_quantity': self.previous_quantity,
            'new_quantity': self.new_quantity,
            'notes': self.notes,
            'transaction_date': self.transaction_date.strftime('%Y-%m-%d %H:%M:%S'),
            'user': self.user
        }

class MedicineCategory(db.Model):
    __tablename__ = 'medicine_categories'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
    description = db.Column(db.Text)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description
        }

# ==================== HELPER FUNCTIONS ====================
def record_stock_transaction(medicine_id, transaction_type, quantity, notes=None, user=None):
    """Enregistrer une transaction de stock"""
    medicine = Medicine.query.get(medicine_id)
    if not medicine:
        return False
    
    previous_qty = medicine.stock_quantity
    
    # Calculer la nouvelle quantité
    if transaction_type in ['purchase', 'adjustment_increase']:
        new_qty = previous_qty + quantity
    elif transaction_type in ['sale', 'expired', 'adjustment_decrease']:
        new_qty = previous_qty - quantity
    else:
        new_qty = previous_qty
    
    # Créer l'historique
    history = StockHistory(
        medicine_id=medicine_id,
        transaction_type=transaction_type,
        quantity=abs(quantity),
        previous_quantity=previous_qty,
        new_quantity=new_qty,
        notes=notes,
        user=user
    )
    
    # Mettre à jour le stock
    medicine.stock_quantity = new_qty
    medicine.updated_at = datetime.utcnow()
    
    db.session.add(history)
    db.session.commit()
    
    return True

# ==================== ROUTES ====================

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'service': 'medicine-service'}), 200

@app.route('/api/medicines', methods=['GET'])
def get_medicines():
    """Récupérer tous les médicaments"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        search = request.args.get('search', '')
        category = request.args.get('category')
        stock_status = request.args.get('stock_status')  # in_stock, low_stock, out_of_stock
        
        query = Medicine.query
        
        # Recherche
        if search:
            query = query.filter(
                db.or_(
                    Medicine.name.ilike(f'%{search}%'),
                    Medicine.generic_name.ilike(f'%{search}%'),
                    Medicine.manufacturer.ilike(f'%{search}%')
                )
            )
        
        # Filtrer par catégorie
        if category:
            query = query.filter_by(category=category)
        
        # Filtrer par statut de stock
        if stock_status == 'out_of_stock':
            query = query.filter(Medicine.stock_quantity == 0)
        elif stock_status == 'low_stock':
            query = query.filter(
                Medicine.stock_quantity > 0,
                Medicine.stock_quantity <= Medicine.min_stock_level
            )
        elif stock_status == 'in_stock':
            query = query.filter(Medicine.stock_quantity > Medicine.min_stock_level)
        
        # Pagination
        pagination = query.order_by(Medicine.name).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'success': True,
            'medicines': [m.to_dict() for m in pagination.items],
            'total': pagination.total,
            'pages': pagination.pages,
            'current_page': page
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/medicines/<int:medicine_id>', methods=['GET'])
def get_medicine(medicine_id):
    """Récupérer un médicament par ID"""
    try:
        include_history = request.args.get('include_history', 'false').lower() == 'true'
        medicine = Medicine.query.get_or_404(medicine_id)
        return jsonify({
            'success': True,
            'medicine': medicine.to_dict(include_history=include_history)
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 404

@app.route('/api/medicines', methods=['POST'])
def create_medicine():
    """Créer un nouveau médicament"""
    try:
        data = request.get_json()
        
        # Validation
        required_fields = ['name', 'category', 'dosage_form']
        for field in required_fields:
            if field not in data:
                return jsonify({'success': False, 'error': f'{field} est requis'}), 400
        
        # Vérifier si le médicament existe déjà
        if Medicine.query.filter_by(name=data['name']).first():
            return jsonify({'success': False, 'error': 'Ce médicament existe déjà'}), 400
        
        # Créer le médicament
        medicine = Medicine(
            name=data['name'],
            generic_name=data.get('generic_name'),
            manufacturer=data.get('manufacturer'),
            category=data['category'],
            description=data.get('description'),
            dosage_form=data['dosage_form'],
            strength=data.get('strength'),
            stock_quantity=data.get('stock_quantity', 0),
            min_stock_level=data.get('min_stock_level', 10),
            unit_price=data.get('unit_price', 0.0),
            requires_prescription=data.get('requires_prescription', True),
            controlled_substance=data.get('controlled_substance', False),
            expiry_date=datetime.strptime(data['expiry_date'], '%Y-%m-%d').date() if data.get('expiry_date') else None
        )
        
        db.session.add(medicine)
        db.session.commit()
        
        # Enregistrer le stock initial
        if medicine.stock_quantity > 0:
            record_stock_transaction(
                medicine.id,
                'purchase',
                medicine.stock_quantity,
                notes='Stock initial',
                user=data.get('user', 'System')
            )
        
        return jsonify({
            'success': True,
            'message': 'Médicament créé avec succès',
            'medicine': medicine.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/medicines/<int:medicine_id>', methods=['PUT'])
def update_medicine(medicine_id):
    """Mettre à jour un médicament"""
    try:
        medicine = Medicine.query.get_or_404(medicine_id)
        data = request.get_json()
        
        # Mettre à jour les champs
        updateable_fields = [
            'generic_name', 'manufacturer', 'category', 'description',
            'dosage_form', 'strength', 'min_stock_level', 'unit_price',
            'requires_prescription', 'controlled_substance'
        ]
        
        for field in updateable_fields:
            if field in data:
                setattr(medicine, field, data[field])
        
        if 'expiry_date' in data:
            medicine.expiry_date = datetime.strptime(data['expiry_date'], '%Y-%m-%d').date()
        
        medicine.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Médicament mis à jour avec succès',
            'medicine': medicine.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/medicines/<int:medicine_id>', methods=['DELETE'])
def delete_medicine(medicine_id):
    """Supprimer un médicament"""
    try:
        medicine = Medicine.query.get_or_404(medicine_id)
        db.session.delete(medicine)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Médicament supprimé avec succès'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/medicines/<int:medicine_id>/stock', methods=['GET'])
def get_medicine_stock(medicine_id):
    """Récupérer le stock d'un médicament"""
    try:
        medicine = Medicine.query.get_or_404(medicine_id)
        return jsonify({
            'success': True,
            'medicine_id': medicine_id,
            'stock': medicine.stock_quantity,
            'min_level': medicine.min_stock_level,
            'status': medicine.get_stock_status()
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 404

@app.route('/api/medicines/<int:medicine_id>/stock/update', methods=['POST'])
def update_medicine_stock(medicine_id):
    """Mettre à jour le stock d'un médicament"""
    try:
        data = request.get_json()
        
        # Validation
        if 'transaction_type' not in data or 'quantity' not in data:
            return jsonify({'success': False, 'error': 'transaction_type et quantity requis'}), 400
        
        valid_types = ['purchase', 'sale', 'adjustment_increase', 'adjustment_decrease', 'expired']
        if data['transaction_type'] not in valid_types:
            return jsonify({'success': False, 'error': f'Type de transaction invalide. Utilisez: {valid_types}'}), 400
        
        quantity = int(data['quantity'])
        if quantity <= 0:
            return jsonify({'success': False, 'error': 'La quantité doit être positive'}), 400
        
        # Enregistrer la transaction
        success = record_stock_transaction(
            medicine_id,
            data['transaction_type'],
            quantity,
            notes=data.get('notes'),
            user=data.get('user', 'System')
        )
        
        if not success:
            return jsonify({'success': False, 'error': 'Médicament non trouvé'}), 404
        
        medicine = Medicine.query.get(medicine_id)
        
        return jsonify({
            'success': True,
            'message': 'Stock mis à jour avec succès',
            'medicine': medicine.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/medicines/<int:medicine_id>/history', methods=['GET'])
def get_stock_history(medicine_id):
    """Récupérer l'historique du stock d'un médicament"""
    try:
        medicine = Medicine.query.get_or_404(medicine_id)
        
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        pagination = StockHistory.query.filter_by(medicine_id=medicine_id)\
            .order_by(StockHistory.transaction_date.desc())\
            .paginate(page=page, per_page=per_page, error_out=False)
        
        return jsonify({
            'success': True,
            'medicine': medicine.to_dict(include_history=False),
            'history': [h.to_dict() for h in pagination.items],
            'total': pagination.total,
            'pages': pagination.pages,
            'current_page': page
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/medicines/low-stock', methods=['GET'])
def get_low_stock_medicines():
    """Récupérer les médicaments en rupture ou stock faible"""
    try:
        low_stock = Medicine.query.filter(
            Medicine.stock_quantity <= Medicine.min_stock_level
        ).order_by(Medicine.stock_quantity).all()
        
        return jsonify({
            'success': True,
            'medicines': [m.to_dict() for m in low_stock],
            'count': len(low_stock)
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/medicines/expiring', methods=['GET'])
def get_expiring_medicines():
    """Récupérer les médicaments qui expirent bientôt"""
    try:
        days = request.args.get('days', 30, type=int)
        today = datetime.now().date()
        future_date = today + timedelta(days=days)
        
        expiring = Medicine.query.filter(
            Medicine.expiry_date.isnot(None),
            Medicine.expiry_date <= future_date,
            Medicine.expiry_date >= today
        ).order_by(Medicine.expiry_date).all()
        
        return jsonify({
            'success': True,
            'medicines': [m.to_dict() for m in expiring],
            'count': len(expiring),
            'days': days
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/medicines/stats', methods=['GET'])
def get_medicine_stats():
    """Obtenir les statistiques des médicaments"""
    try:
        total = Medicine.query.count()
        in_stock = Medicine.query.filter(
            Medicine.stock_quantity > Medicine.min_stock_level
        ).count()
        low_stock = Medicine.query.filter(
            Medicine.stock_quantity > 0,
            Medicine.stock_quantity <= Medicine.min_stock_level
        ).count()
        out_of_stock = Medicine.query.filter_by(stock_quantity=0).count()
        
        # Valeur totale du stock
        from sqlalchemy import func
        total_value = db.session.query(
            func.sum(Medicine.stock_quantity * Medicine.unit_price)
        ).scalar() or 0
        
        # Catégories
        categories = db.session.query(
            Medicine.category,
            func.count(Medicine.id).label('count')
        ).group_by(Medicine.category).all()
        
        return jsonify({
            'success': True,
            'stats': {
                'total_medicines': total,
                'in_stock': in_stock,
                'low_stock': low_stock,
                'out_of_stock': out_of_stock,
                'total_stock_value': round(total_value, 2),
                'categories': [
                    {'name': cat, 'count': count}
                    for cat, count in categories
                ]
            }
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/medicines/categories', methods=['GET'])
def get_categories():
    """Récupérer toutes les catégories de médicaments"""
    try:
        categories = MedicineCategory.query.all()
        return jsonify({
            'success': True,
            'categories': [c.to_dict() for c in categories]
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/medicines/categories', methods=['POST'])
def create_category():
    """Créer une nouvelle catégorie"""
    try:
        data = request.get_json()
        
        if 'name' not in data:
            return jsonify({'success': False, 'error': 'name est requis'}), 400
        
        category = MedicineCategory(
            name=data['name'],
            description=data.get('description')
        )
        
        db.session.add(category)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Catégorie créée avec succès',
            'category': category.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

# ==================== MAIN ====================
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        
        # Créer des catégories par défaut
        default_categories = [
            {'name': 'Antibiotique', 'description': 'Médicaments contre les infections bactériennes'},
            {'name': 'Antalgique', 'description': 'Médicaments contre la douleur'},
            {'name': 'Antipyrétique', 'description': 'Médicaments contre la fièvre'},
            {'name': 'Anti-inflammatoire', 'description': 'Médicaments réduisant l\'inflammation'},
            {'name': 'Antiviral', 'description': 'Médicaments contre les virus'},
            {'name': 'Cardiovasculaire', 'description': 'Médicaments pour le cœur et la circulation'}
        ]
        
        for cat_data in default_categories:
            if not MedicineCategory.query.filter_by(name=cat_data['name']).first():
                category = MedicineCategory(**cat_data)
                db.session.add(category)
        
        db.session.commit()
        print("✅ Medicine Service: Database tables created successfully!")
    
    port = int(os.getenv('PORT', 5005))
    app.run(host='0.0.0.0', port=port, debug=True)