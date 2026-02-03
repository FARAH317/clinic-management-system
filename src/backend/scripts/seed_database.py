#!/usr/bin/env python3
"""
Script amélioré pour peupler toutes les bases de données,
même si les données existent déjà.
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
    'doctor': 'http://localhost:5006/api',
    'billing': 'http://localhost:5007/api'
}

# ============================================================
# AFFICHAGE
# ============================================================

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


# ============================================================
# OUTILS : rechercher élément existant
# ============================================================

def get_existing_patient(email):
    """Cherche un patient par email via /api/patients?search="""
    try:
        response = requests.get(
            f"{BASE_URLS['patient']}/patients?search={email}"
        )
        if response.status_code == 200:
            data = response.json()
            patients = data.get("patients", [])
            if len(patients) > 0:
                return patients[0]["id"]
    except Exception:
        pass
    return None


def get_existing_medicine(name):
    """Cherche un médicament existant par son nom"""
    try:
        response = requests.get(
            f"{BASE_URLS['medicine']}/medicines?search={name}"
        )
        if response.status_code == 200:
            data = response.json()
            meds = data.get("medicines", [])
            if len(meds) > 0:
                return meds[0]["id"]
    except:
        pass
    return None


def get_existing_doctor(username):
    """cherche un docteur dans le auth-service"""
    try:
        response = requests.get(
            f"{BASE_URLS['doctor']}/doctors?search={username}"
        )
        if response.status_code == 200:
            data = response.json()
            docs = data.get("doctors", [])
            if len(docs) > 0:
                return docs[0]["id"]
    except:
        pass
    return None


# ============================================================
# DONNÉES DE TEST
# ============================================================

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
    },
    {
        'username': 'secretary.jane',
        'email': 'jane@clinic.com',
        'password': 'Secretary@123',
        'first_name': 'Jane',
        'last_name': 'Doe',
        'role': 'secretary'
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
# ============================================================
# FONCTIONS DE PEUPLEMENT AMÉLIORÉES
# ============================================================

def seed_users():
    """Créer ou récupérer les utilisateurs"""
    print_header("CRÉATION DES UTILISATEURS")

    created = 0
    for user in USERS:
        try:
            # Cas admin : essai de login
            if user['username'] == 'admin':
                resp = requests.post(
                    f"{BASE_URLS['auth']}/auth/login",
                    json={'username': user['username'], 'password': user['password']}
                )
                if resp.status_code == 200:
                    print_success(f"Admin déjà existant: {user['username']}")
                    created += 1
                continue

            # Tentative création user
            resp = requests.post(
                f"{BASE_URLS['auth']}/auth/register",
                json=user
            )

            if resp.status_code == 201:
                print_success(f"Utilisateur créé: {user['username']}")
                created += 1
            else:
                print_info(f"Utilisateur existe déjà: {user['username']}")
                created += 1

        except Exception as e:
            print_error(f"Erreur utilisateur {user['username']}: {str(e)}")

    print_info(f"\nTotal utilisateurs: {created}/{len(USERS)}")
    return True


def seed_patients():
    """Créer patients ou récupérer leurs IDs s'ils existent déjà"""
    print_header("CRÉATION DES PATIENTS")

    patient_ids = []

    for patient in PATIENTS:
        existing_id = get_existing_patient(patient["email"])

        if existing_id:
            print_info(f"Patient existe déjà: {patient['email']} (ID={existing_id})")
            patient_ids.append(existing_id)
            continue

        # Création patient
        try:
            resp = requests.post(
                f"{BASE_URLS['patient']}/patients",
                json=patient
            )
            if resp.status_code == 201:
                pid = resp.json()["patient"]["id"]
                print_success(f"Patient créé: {patient['first_name']} {patient['last_name']} (ID={pid})")
                patient_ids.append(pid)
            else:
                print_error(f"Erreur création patient: {resp.text}")

        except Exception as e:
            print_error(f"Erreur patient: {str(e)}")

    print_info(f"\nTotal patients disponibles: {len(patient_ids)}/{len(PATIENTS)}")
    return patient_ids


def seed_medicines():
    """Créer ou récupérer médicaments existants"""
    print_header("CRÉATION DES MÉDICAMENTS")

    medicine_ids = []

    for med in MEDICINES:
        existing_id = get_existing_medicine(med["name"])

        if existing_id:
            print_info(f"Médicament existe déjà: {med['name']} (ID={existing_id})")
            medicine_ids.append(existing_id)
            continue

        try:
            resp = requests.post(
                f"{BASE_URLS['medicine']}/medicines",
                json=med
            )
            if resp.status_code == 201:
                mid = resp.json()["medicine"]["id"]
                print_success(f"Médicament créé: {med['name']} (ID={mid})")
                medicine_ids.append(mid)
            else:
                print_error(f"Erreur création médicament: {resp.text}")

        except Exception as e:
            print_error(f"Erreur médicament: {str(e)}")

    print_info(f"\nTotal médicaments disponibles: {len(medicine_ids)}/{len(MEDICINES)}")
    return medicine_ids


def seed_appointments(patient_ids):
    print_header("CRÉATION DES RENDEZ-VOUS")

    if not patient_ids:
        print_error("Aucun patient disponible, impossible de créer des RDV")
        return []

    appointment_ids = []
    doctors = ["Dr. Smith", "Dr. Jones"]

    now = datetime.now()

    for i, pid in enumerate(patient_ids[:3]):
        apt_date = now + timedelta(days=i+1, hours=9)
        appointment = {
            "patient_id": pid,
            "doctor_name": doctors[i % 2],
            "appointment_date": apt_date.strftime("%Y-%m-%d %H:%M"),
            "duration": 30,
            "reason": ["Routine", "Suivi", "Contrôle"][i % 3]
        }

        try:
            resp = requests.post(
                f"{BASE_URLS['appointment']}/appointments",
                json=appointment
            )
            if resp.status_code == 201:
                aid = resp.json()["appointment"]["id"]
                print_success(f"RDV créé pour patient {pid} le {appointment['appointment_date']} (ID={aid})")
                appointment_ids.append(aid)
            else:
                print_info("Le RDV existe peut-être déjà, on continue...")

        except Exception as e:
            print_error(f"Erreur RDV: {str(e)}")

    print_info(f"\nTotal RDV disponibles: {len(appointment_ids)}")
    return appointment_ids


def seed_prescriptions(patient_ids, medicine_ids):
    print_header("CRÉATION DES ORDONNANCES")

    if not patient_ids or not medicine_ids:
        print_error("Patients ou médicaments manquants")
        return []

    prescription_ids = []

    # ORD 1
    prescription_1 = {
        "patient_id": patient_ids[0],
        "doctor_name": "Dr. Smith",
        "diagnosis": "Infection respiratoire",
        "notes": "Repos",
        "medications": [
            {
                "medicine_id": medicine_ids[1],
                "dosage": "1g",
                "frequency": "3/jour",
                "duration": "7 jours",
                "quantity": 1
            },
            {
                "medicine_id": medicine_ids[0],
                "dosage": "500mg",
                "frequency": "2/jour",
                "duration": "5 jours",
                "quantity": 1
            }
        ]
    }

    try:
        resp = requests.post(
            f"{BASE_URLS['prescription']}/prescriptions",
            json=prescription_1
        )
        if resp.status_code == 201:
            pid = resp.json()["prescription"]["id"]
            print_success(f"Ordonnance créée (ID={pid})")
            prescription_ids.append(pid)
    except Exception as e:
        print_error(f"Erreur ordonnance 1: {str(e)}")

    # ORD 2
    if len(patient_ids) > 1:
        prescription_2 = {
            "patient_id": patient_ids[1],
            "doctor_name": "Dr. Jones",
            "diagnosis": "Douleurs musculaires",
            "medications": [
                {
                    "medicine_id": medicine_ids[2],
                    "dosage": "400mg",
                    "frequency": "2/jour",
                    "duration": "3 jours",
                    "quantity": 1
                }
            ]
        }

        try:
            resp = requests.post(
                f"{BASE_URLS['prescription']}/prescriptions",
                json=prescription_2
            )
            if resp.status_code == 201:
                pid = resp.json()["prescription"]["id"]
                print_success(f"Ordonnance créée (ID={pid})")
                prescription_ids.append(pid)
        except:
            pass

    print_info(f"\nTotal ordonnances: {len(prescription_ids)}")
    return prescription_ids


def seed_invoices(appointment_ids):
    print_header("CRÉATION DES FACTURES")

    if not appointment_ids:
        print_error("Aucun RDV disponible")
        return []

    invoice_ids = []

    invoice1 = {
        "consultation_id": appointment_ids[0],
        "patient_id": 1,
        "doctor_id": 1,
        "medication_cost": 20.5,
        "additional_fees": 15,
        "remboursement": 40,
        "payment_method": "card",
        "due_date": (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d")
    }

    try:
        resp = requests.post(
            f"{BASE_URLS['billing']}/invoices",
            json=invoice1
        )
        if resp.status_code == 201:
            iid = resp.json()["invoice"]["id"]
            print_success(f"Facture créée (ID={iid})")
            invoice_ids.append(iid)
    except:
        pass

    print_info(f"Total factures: {len(invoice_ids)}")
    return invoice_ids


def seed_bmi_records(patient_ids):
    print_header("CRÉATION DES ENREGISTREMENTS IMC")

    if not patient_ids:
        print_error("Aucun patient")
        return 0

    bmi_data = [
        {"patient_id": patient_ids[0], "weight": 72, "height": 170},
        {"patient_id": patient_ids[1], "weight": 85, "height": 180},
        {"patient_id": patient_ids[2], "weight": 65, "height": 165}
    ]

    success = 0

    for record in bmi_data:
        try:
            resp = requests.post(
                f"{BASE_URLS['billing']}/bmi/calculate",
                json=record
            )
            if resp.status_code == 200:
                result = resp.json()
                print_success(f"IMC patient {record['patient_id']}: {result['bmi']}")
                success += 1
        except Exception as e:
            print_error(f"Erreur IMC: {str(e)}")

    print_info(f"Total IMC créés: {success}/{len(bmi_data)}")
    return success
# ============================================================
# RÉSUMÉ FINAL
# ============================================================

def display_summary():
    print_header("RÉSUMÉ DES DONNÉES")

    # Patients
    try:
        resp = requests.get(f"{BASE_URLS['patient']}/patients/stats")
        if resp.status_code == 200:
            stats = resp.json()["stats"]
            print(f"👥 Patients: {stats['total']} (Homme: {stats['male']}, Femme: {stats['female']})")
    except:
        print_error("Erreur récupération stats patients")

    # RDV
    try:
        resp = requests.get(f"{BASE_URLS['appointment']}/appointments/stats")
        if resp.status_code == 200:
            stats = resp.json()["stats"]
            print(f"📅 RDV: {stats['total']} (Cette semaine: {stats['this_week']})")
    except:
        print_error("Erreur récupération stats RDV")

    # Ordonnances
    try:
        resp = requests.get(f"{BASE_URLS['prescription']}/prescriptions/stats")
        if resp.status_code == 200:
            stats = resp.json()["stats"]
            print(f"📋 Ordonnances: {stats['total']} (Actives: {stats['active']})")
    except:
        print_error("Erreur récupération stats ordonnances")

    # Médicaments
    try:
        resp = requests.get(f"{BASE_URLS['medicine']}/medicines/stats")
        if resp.status_code == 200:
            stats = resp.json()["stats"]
            print(f"💊 Médicaments: {stats['total_medicines']} (Stock faible: {stats['low_stock']})")
            print(f"💰 Valeur stock: {stats['total_stock_value']}€")
    except:
        print_error("Erreur récupération stats médicaments")

    # Factures
    try:
        resp = requests.get(f"{BASE_URLS['billing']}/invoices/stats")
        if resp.status_code == 200:
            stats = resp.json()["stats"]
            print(f"💰 Factures: {stats['total_invoices']} (Payées: {stats['paid']}, En attente: {stats['pending']})")
            print(f"💵 Revenus totaux: {stats['total_revenue']}€")
    except:
        print_error("Erreur récupération stats factures")


# ============================================================
# MAIN SCRIPT
# ============================================================

def main():
    print_header("🏥 PEUPLEMENT DE LA BASE DE DONNÉES - CLINIC MANAGEMENT")
    print(f"{Fore.YELLOW}Ce script va créer des données de test pour tous les services{Style.RESET_ALL}\n")

    # Vérification services
    print_info("Vérification des services...")
    all_ok = True

    for name, url in BASE_URLS.items():
        try:
            health = url.replace("/api", "/health")
            r = requests.get(health, timeout=2)
            if r.status_code == 200:
                print_success(f"{name.capitalize()} Service: OK")
            else:
                print_error(f"{name.capitalize()} Service: ERREUR")
                all_ok = False
        except:
            print_error(f"{name.capitalize()} Service: OFF")
            all_ok = False

    if not all_ok:
        print_error("⚠️ Tous les services ne sont pas disponibles !")
        return

    print_success("\nTous les services sont disponibles !\n")

    # SEEDING
    seed_users()
    patients = seed_patients()
    medicines = seed_medicines()
    appointments = seed_appointments(patients)
    prescriptions = seed_prescriptions(patients, medicines)
    invoices = seed_invoices(appointments)
    seed_bmi_records(patients)

    # RÉSUMÉ
    display_summary()

    print_header("✅ PEUPLEMENT TERMINÉ AVEC SUCCÈS")
    print(f"{Fore.GREEN}Votre base de données est maintenant prête !{Style.RESET_ALL}\n")

    print_info("Comptes de test :")
    print("  Admin:         admin / Admin@123")
    print("  Docteur:       dr.smith / Doctor@123")
    print("  Docteur:       dr.jones / Doctor@123")
    print("  Infirmière:    nurse.marie / Nurse@123")
    print("  Secrétaire:    secretary.jane / Secretary@123\n")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print(f"\n{Fore.YELLOW}Annulé par l'utilisateur{Style.RESET_ALL}")
        exit(1)
