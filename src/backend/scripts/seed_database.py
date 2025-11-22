#!/usr/bin/env python3
"""
Script pour peupler les bases de données avec des données de test
Usage: python seed_database.py
"""

import requests
import json
from datetime import datetime, timedelta
from colorama import init, Fore, Style

# Initialiser colorama
init()

# Configuration
BASE_URLS = {
    'auth': 'http://localhost:5001/api',
    'patient': 'http://localhost:5002/api',
    'appointment': 'http://localhost:5003/api',
    'prescription': 'http://localhost:5004/api',
    'medicine': 'http://localhost:5005/api',
    'doctor': 'http://localhost:5006/api'
}

def print_success(text):
    print(f"{Fore.GREEN}✓ {text}{Style.RESET_ALL}")

def print_error(text):
    print(f"{Fore.RED}✗ {text}{Style.RESET_ALL}")

def print_info(text):
    print(f"{Fore.CYAN}ℹ {text}{Style.RESET_ALL}")

def print_header(text):
    print(f"\n{Fore.YELLOW}{'='*60}")
    print(f"{text:^60}")
    print(f"{'='*60}{Style.RESET_ALL}\n")

# ==================== DONNÉES DE TEST ====================

USERS = [
    {
        'username': 'admin',
        'email': 'admin@clinic.com',
        'password': 'Admin@123',
        'first_name': 'Admin',
        'last_name': 'System',
        'role': 'admin'
    },
    {
        'username': 'dr.smith',
        'email': 'dr.smith@clinic.com',
        'password': 'Doctor@123',
        'first_name': 'John',
        'last_name': 'Smith',
        'role': 'doctor'
    },
    {
        'username': 'dr.jones',
        'email': 'dr.jones@clinic.com',
        'password': 'Doctor@123',
        'first_name': 'Sarah',
        'last_name': 'Jones',
        'role': 'doctor'
    },
    {
        'username': 'nurse.marie',
        'email': 'marie@clinic.com',
        'password': 'Nurse@123',
        'first_name': 'Marie',
        'last_name': 'Dubois',
        'role': 'nurse'
    }
]

PATIENTS = [
    {
        'first_name': 'Alice',
        'last_name': 'Dupont',
        'email': 'alice.dupont@email.com',
        'phone': '0612345678',
        'date_of_birth': '1990-05-15',
        'gender': 'Femme',
        'blood_group': 'A+',
        'allergies': 'Pénicilline',
        'medical_history': 'Hypertension'
    },
    {
        'first_name': 'Bob',
        'last_name': 'Martin',
        'email': 'bob.martin@email.com',
        'phone': '0623456789',
        'date_of_birth': '1985-08-22',
        'gender': 'Homme',
        'blood_group': 'O+',
        'allergies': 'Aucune',
        'medical_history': 'Diabète type 2'
    },
    {
        'first_name': 'Claire',
        'last_name': 'Bernard',
        'email': 'claire.bernard@email.com',
        'phone': '0634567890',
        'date_of_birth': '1992-11-30',
        'gender': 'Femme',
        'blood_group': 'B+',
        'allergies': 'Latex',
        'medical_history': 'Asthme'
    },
    {
        'first_name': 'David',
        'last_name': 'Petit',
        'email': 'david.petit@email.com',
        'phone': '0645678901',
        'date_of_birth': '1988-03-12',
        'gender': 'Homme',
        'blood_group': 'AB+',
        'allergies': 'Aucune',
        'medical_history': 'Aucun'
    },
    {
        'first_name': 'Emma',
        'last_name': 'Leroy',
        'email': 'emma.leroy@email.com',
        'phone': '0656789012',
        'date_of_birth': '1995-07-18',
        'gender': 'Femme',
        'blood_group': 'O-',
        'allergies': 'Fruits de mer',
        'medical_history': 'Migraines chroniques'
    }
]

MEDICINES = [
    {
        'name': 'Paracétamol 500mg',
        'generic_name': 'Acetaminophen',
        'manufacturer': 'PharmaCorp',
        'category': 'Antalgique',
        'dosage_form': 'Comprimé',
        'strength': '500mg',
        'stock_quantity': 150,
        'min_stock_level': 30,
        'unit_price': 5.50,
        'expiry_date': '2026-12-31'
    },
    {
        'name': 'Amoxicilline 1g',
        'generic_name': 'Amoxicillin',
        'manufacturer': 'AntibioLab',
        'category': 'Antibiotique',
        'dosage_form': 'Comprimé',
        'strength': '1g',
        'stock_quantity': 80,
        'min_stock_level': 20,
        'unit_price': 12.00,
        'expiry_date': '2026-06-30'
    },
    {
        'name': 'Ibuprofène 400mg',
        'generic_name': 'Ibuprofen',
        'manufacturer': 'PharmaCorp',
        'category': 'Anti-inflammatoire',
        'dosage_form': 'Comprimé',
        'strength': '400mg',
        'stock_quantity': 120,
        'min_stock_level': 25,
        'unit_price': 7.80,
        'expiry_date': '2027-03-31'
    },
    {
        'name': 'Omeprazole 20mg',
        'generic_name': 'Omeprazole',
        'manufacturer': 'GastroMed',
        'category': 'Cardiovasculaire',
        'dosage_form': 'Gélule',
        'strength': '20mg',
        'stock_quantity': 60,
        'min_stock_level': 15,
        'unit_price': 9.50,
        'expiry_date': '2026-09-30'
    },
    {
        'name': 'Aspirine 100mg',
        'generic_name': 'Aspirin',
        'manufacturer': 'PharmaCorp',
        'category': 'Antalgique',
        'dosage_form': 'Comprimé',
        'strength': '100mg',
        'stock_quantity': 200,
        'min_stock_level': 40,
        'unit_price': 4.20,
        'expiry_date': '2027-12-31'
    },
    {
        'name': 'Ventoline 100mcg',
        'generic_name': 'Salbutamol',
        'manufacturer': 'RespiLab',
        'category': 'Antiviral',
        'dosage_form': 'Inhalateur',
        'strength': '100mcg',
        'stock_quantity': 45,
        'min_stock_level': 10,
        'unit_price': 15.80,
        'expiry_date': '2026-08-31'
    }
]

# ==================== FONCTIONS DE PEUPLEMENT ====================

def seed_users():
    """Créer les utilisateurs"""
    print_header("CRÉATION DES UTILISATEURS")
    
    created = 0
    for user in USERS:
        try:
            # L'admin est créé automatiquement, on tente juste de se connecter
            if user['username'] == 'admin':
                response = requests.post(
                    f"{BASE_URLS['auth']}/auth/login",
                    json={'username': user['username'], 'password': user['password']}
                )
                if response.status_code == 200:
                    print_success(f"Admin déjà existant: {user['username']}")
                    created += 1
                continue
            
            response = requests.post(
                f"{BASE_URLS['auth']}/auth/register",
                json=user
            )
            
            if response.status_code == 201:
                print_success(f"Utilisateur créé: {user['username']} ({user['role']})")
                created += 1
            elif response.status_code == 400:
                print_info(f"Utilisateur existe déjà: {user['username']}")
                created += 1
            else:
                print_error(f"Erreur création {user['username']}: {response.json()}")
                
        except Exception as e:
            print_error(f"Erreur {user['username']}: {str(e)}")
    
    print_info(f"\nTotal utilisateurs: {created}/{len(USERS)}")
    return created > 0

def seed_patients():
    """Créer les patients"""
    print_header("CRÉATION DES PATIENTS")
    
    patient_ids = []
    for patient in PATIENTS:
        try:
            response = requests.post(
                f"{BASE_URLS['patient']}/patients",
                json=patient
            )
            
            if response.status_code == 201:
                patient_id = response.json()['patient']['id']
                patient_ids.append(patient_id)
                print_success(f"Patient créé: {patient['first_name']} {patient['last_name']} (ID: {patient_id})")
            elif response.status_code == 400:
                print_info(f"Patient existe déjà: {patient['email']}")
            else:
                print_error(f"Erreur création patient: {response.json()}")
                
        except Exception as e:
            print_error(f"Erreur patient: {str(e)}")
    
    print_info(f"\nTotal patients créés: {len(patient_ids)}/{len(PATIENTS)}")
    return patient_ids

def seed_medicines():
    """Créer les médicaments"""
    print_header("CRÉATION DES MÉDICAMENTS")
    
    medicine_ids = []
    for medicine in MEDICINES:
        try:
            response = requests.post(
                f"{BASE_URLS['medicine']}/medicines",
                json=medicine
            )
            
            if response.status_code == 201:
                medicine_id = response.json()['medicine']['id']
                medicine_ids.append(medicine_id)
                print_success(f"Médicament créé: {medicine['name']} (ID: {medicine_id}, Stock: {medicine['stock_quantity']})")
            elif response.status_code == 400:
                print_info(f"Médicament existe déjà: {medicine['name']}")
            else:
                print_error(f"Erreur création médicament: {response.json()}")
                
        except Exception as e:
            print_error(f"Erreur médicament: {str(e)}")
    
    print_info(f"\nTotal médicaments créés: {len(medicine_ids)}/{len(MEDICINES)}")
    return medicine_ids

def seed_appointments(patient_ids):
    """Créer des rendez-vous"""
    print_header("CRÉATION DES RENDEZ-VOUS")
    
    if not patient_ids:
        print_error("Aucun patient disponible pour créer des RDV")
        return []
    
    doctors = ['Dr. Smith', 'Dr. Jones']
    appointment_ids = []
    
    # Créer des RDV pour les 7 prochains jours
    today = datetime.now()
    
    for i, patient_id in enumerate(patient_ids[:3]):  # RDV pour les 3 premiers patients
        appointment_date = today + timedelta(days=i+1, hours=9+i*2)
        
        appointment = {
            'patient_id': patient_id,
            'doctor_name': doctors[i % len(doctors)],
            'appointment_date': appointment_date.strftime('%Y-%m-%d %H:%M'),
            'duration': 30,
            'reason': ['Consultation de routine', 'Suivi traitement', 'Contrôle'][i % 3]
        }
        
        try:
            response = requests.post(
                f"{BASE_URLS['appointment']}/appointments",
                json=appointment
            )
            
            if response.status_code == 201:
                apt_id = response.json()['appointment']['id']
                appointment_ids.append(apt_id)
                print_success(f"RDV créé: Patient {patient_id} avec {appointment['doctor_name']} le {appointment['appointment_date']}")
            else:
                print_error(f"Erreur création RDV: {response.json()}")
                
        except Exception as e:
            print_error(f"Erreur RDV: {str(e)}")
    
    print_info(f"\nTotal RDV créés: {len(appointment_ids)}")
    return appointment_ids

def seed_prescriptions(patient_ids, medicine_ids):
    """Créer des ordonnances"""
    print_header("CRÉATION DES ORDONNANCES")
    
    if not patient_ids or not medicine_ids:
        print_error("Patients ou médicaments manquants pour créer des ordonnances")
        return []
    
    prescription_ids = []
    
    # Ordonnance 1: Patient 1, 2 médicaments
    if len(patient_ids) > 0 and len(medicine_ids) >= 2:
        prescription = {
            'patient_id': patient_ids[0],
            'doctor_name': 'Dr. Smith',
            'diagnosis': 'Infection respiratoire',
            'notes': 'Repos recommandé',
            'medications': [
                {
                    'medicine_id': medicine_ids[1],  # Amoxicilline
                    'dosage': '1g',
                    'frequency': '3 fois par jour',
                    'duration': '7 jours',
                    'quantity': 1,
                    'instructions': 'Prendre après les repas'
                },
                {
                    'medicine_id': medicine_ids[0],  # Paracétamol
                    'dosage': '500mg',
                    'frequency': '2 fois par jour',
                    'duration': '5 jours',
                    'quantity': 1,
                    'instructions': 'En cas de fièvre'
                }
            ]
        }
        
        try:
            response = requests.post(
                f"{BASE_URLS['prescription']}/prescriptions",
                json=prescription
            )
            
            if response.status_code == 201:
                pres_id = response.json()['prescription']['id']
                prescription_ids.append(pres_id)
                print_success(f"Ordonnance créée: Patient {patient_ids[0]}, {len(prescription['medications'])} médicaments")
            else:
                print_error(f"Erreur création ordonnance: {response.json()}")
                
        except Exception as e:
            print_error(f"Erreur ordonnance: {str(e)}")
    
    # Ordonnance 2: Patient 2, 1 médicament
    if len(patient_ids) > 1 and len(medicine_ids) >= 3:
        prescription = {
            'patient_id': patient_ids[1],
            'doctor_name': 'Dr. Jones',
            'diagnosis': 'Douleurs musculaires',
            'medications': [
                {
                    'medicine_id': medicine_ids[2],  # Ibuprofène
                    'dosage': '400mg',
                    'frequency': '2 fois par jour',
                    'duration': '3 jours',
                    'quantity': 1,
                    'instructions': 'Prendre avec de la nourriture'
                }
            ]
        }
        
        try:
            response = requests.post(
                f"{BASE_URLS['prescription']}/prescriptions",
                json=prescription
            )
            
            if response.status_code == 201:
                pres_id = response.json()['prescription']['id']
                prescription_ids.append(pres_id)
                print_success(f"Ordonnance créée: Patient {patient_ids[1]}, {len(prescription['medications'])} médicament")
            else:
                print_error(f"Erreur création ordonnance: {response.json()}")
                
        except Exception as e:
            print_error(f"Erreur ordonnance: {str(e)}")
    
    print_info(f"\nTotal ordonnances créées: {len(prescription_ids)}")
    return prescription_ids

def display_summary():
    """Afficher un résumé des données créées"""
    print_header("RÉSUMÉ DES DONNÉES")
    
    try:
        # Stats patients
        response = requests.get(f"{BASE_URLS['patient']}/patients/stats")
        if response.status_code == 200:
            stats = response.json()['stats']
            print(f"👥 Patients: {stats['total']} (H: {stats['male']}, F: {stats['female']})")
        
        # Stats RDV
        response = requests.get(f"{BASE_URLS['appointment']}/appointments/stats")
        if response.status_code == 200:
            stats = response.json()['stats']
            print(f"📅 Rendez-vous: {stats['total']} (Cette semaine: {stats['this_week']})")
        
        # Stats ordonnances
        response = requests.get(f"{BASE_URLS['prescription']}/prescriptions/stats")
        if response.status_code == 200:
            stats = response.json()['stats']
            print(f"📋 Ordonnances: {stats['total']} (Actives: {stats['active']})")
        
        # Stats médicaments
        response = requests.get(f"{BASE_URLS['medicine']}/medicines/stats")
        if response.status_code == 200:
            stats = response.json()['stats']
            print(f"💊 Médicaments: {stats['total_medicines']} (Stock faible: {stats['low_stock']})")
            print(f"💰 Valeur totale du stock: {stats['total_stock_value']}€")
        
    except Exception as e:
        print_error(f"Erreur récupération stats: {str(e)}")

# ==================== MAIN ====================

def main():
    print_header("🏥 PEUPLEMENT DE LA BASE DE DONNÉES - CLINIC MANAGEMENT")
    print(f"{Fore.YELLOW}Ce script va créer des données de test pour tous les services{Style.RESET_ALL}\n")
    
    # Vérifier que les services sont disponibles
    print_info("Vérification des services...")
    all_services_up = True
    
    for service, url in BASE_URLS.items():
        try:
            # Utiliser l'endpoint health si disponible
            health_url = url.replace('/api', '/health')
            response = requests.get(health_url, timeout=2)
            if response.status_code == 200:
                print_success(f"{service.capitalize()} Service: OK")
            else:
                print_error(f"{service.capitalize()} Service: Erreur")
                all_services_up = False
        except:
            print_error(f"{service.capitalize()} Service: Non disponible")
            all_services_up = False
    
    if not all_services_up:
        print_error("\n⚠️  Tous les services ne sont pas disponibles!")
        print_info("Assurez-vous que tous les services sont démarrés avant de continuer.")
        return
    
    print_success("\n✓ Tous les services sont disponibles!\n")
    
    # Peuplement
    seed_users()
    patient_ids = seed_patients()
    medicine_ids = seed_medicines()
    appointment_ids = seed_appointments(patient_ids)
    prescription_ids = seed_prescriptions(patient_ids, medicine_ids)
    
    # Résumé
    display_summary()
    
    print_header("✅ PEUPLEMENT TERMINÉ AVEC SUCCÈS")
    print(f"{Fore.GREEN}Votre base de données est maintenant prête à être utilisée!{Style.RESET_ALL}\n")
    
    print_info("Comptes de test créés:")
    print("  Admin:    username=admin      password=Admin@123")
    print("  Docteur:  username=dr.smith   password=Doctor@123")
    print("  Docteur:  username=dr.jones   password=Doctor@123")
    print("  Infirmière: username=nurse.marie password=Nurse@123\n")

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print(f"\n{Fore.YELLOW}Opération annulée par l'utilisateur{Style.RESET_ALL}")
        exit(1)