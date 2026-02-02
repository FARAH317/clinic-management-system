import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, User, Mail, Phone, FileText, 
  ArrowLeft, CheckCircle, AlertCircle, Stethoscope,
  Heart, MapPin
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

function AppointmentPage() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const [appointmentForm, setAppointmentForm] = useState({
    doctor_name: '',
    appointment_date: '',
    duration: 30,
    reason: '',
    notes: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: '1990-01-01',
    gender: 'Homme'
  });

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch('http://localhost:5006/api/doctors?is_active=true&per_page=10');
        const data = await response.json();
        if (data.success && data.doctors.length > 0) {
          setDoctors(data.doctors);
          setAppointmentForm(prev => ({ 
            ...prev, 
            doctor_name: `Dr. ${data.doctors[0].first_name} ${data.doctors[0].last_name}` 
          }));
        } else {
          setDoctors([
            { id: 1, first_name: 'Sarah', last_name: 'Benali', specialization: 'Cardiologue', years_of_experience: 15 },
            { id: 2, first_name: 'Ahmed', last_name: 'Mansouri', specialization: 'Médecin Généraliste', years_of_experience: 12 },
            { id: 3, first_name: 'Leila', last_name: 'Kherroubi', specialization: 'Pédiatre', years_of_experience: 10 },
            { id: 4, first_name: 'Karim', last_name: 'Bouzid', specialization: 'Chirurgien', years_of_experience: 18 }
          ]);
          setAppointmentForm(prev => ({ ...prev, doctor_name: 'Dr. Sarah Benali' }));
        }
      } catch (error) {
        console.error('Erreur chargement médecins:', error);
        setDoctors([
          { id: 1, first_name: 'Sarah', last_name: 'Benali', specialization: 'Cardiologue', years_of_experience: 15 },
          { id: 2, first_name: 'Ahmed', last_name: 'Mansouri', specialization: 'Médecin Généraliste', years_of_experience: 12 }
        ]);
        setAppointmentForm(prev => ({ ...prev, doctor_name: 'Dr. Sarah Benali' }));
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAppointmentForm({ ...appointmentForm, [name]: value });
  };

  const validateStep1 = () => {
    if (!appointmentForm.first_name?.trim()) {
      alert('❌ Le prénom est obligatoire');
      return false;
    }
    if (!appointmentForm.last_name?.trim()) {
      alert('❌ Le nom est obligatoire');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!appointmentForm.email?.trim()) {
      alert('❌ L\'email est obligatoire');
      return false;
    }
    if (!emailRegex.test(appointmentForm.email)) {
      alert('❌ Format d\'email invalide (ex: exemple@gmail.com)');
      return false;
    }
    const phoneRegex = /^[0-9]{10}$/;
    if (!appointmentForm.phone?.trim()) {
      alert('❌ Le numéro de téléphone est obligatoire');
      return false;
    }
    if (!phoneRegex.test(appointmentForm.phone.replace(/\s/g, ''))) {
      alert('❌ Le numéro de téléphone doit contenir exactement 10 chiffres');
      return false;
    }
    if (!appointmentForm.date_of_birth) {
      alert('❌ La date de naissance est obligatoire');
      return false;
    }
    const birthDate = new Date(appointmentForm.date_of_birth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    if (age < 0 || age > 150) {
      alert('❌ Date de naissance invalide');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!appointmentForm.appointment_date) {
      alert('❌ La date et l\'heure du rendez-vous sont obligatoires');
      return false;
    }
    const appointmentDate = new Date(appointmentForm.appointment_date);
    if (appointmentDate < new Date()) {
      alert('❌ La date du rendez-vous ne peut pas être dans le passé');
      return false;
    }
    if (!appointmentForm.reason?.trim()) {
      alert('❌ Le motif du rendez-vous est obligatoire');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep2()) return;
    
    setSubmitting(true);

    try {
      const patientPayload = {
        first_name: appointmentForm.first_name.trim(),
        last_name: appointmentForm.last_name.trim(),
        email: appointmentForm.email.trim().toLowerCase(),
        phone: appointmentForm.phone.replace(/\s/g, ''),
        date_of_birth: appointmentForm.date_of_birth,
        gender: appointmentForm.gender
      };

      const patientResponse = await fetch('http://localhost:5002/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patientPayload)
      });

      const patientData = await patientResponse.json();

      if (!patientData.success) {
        alert('❌ ' + (patientData.error || 'Erreur lors de la création du profil patient'));
        setSubmitting(false);
        return;
      }

      const patientId = patientData.patient.id;
      const formattedDate = appointmentForm.appointment_date.replace('T', ' ');

      const appointmentPayload = {
        patient_id: patientId,
        doctor_name: appointmentForm.doctor_name,
        appointment_date: formattedDate,
        duration: parseInt(appointmentForm.duration),
        reason: appointmentForm.reason.trim(),
        notes: appointmentForm.notes.trim(),
        first_name: appointmentForm.first_name.trim(),
        last_name: appointmentForm.last_name.trim(),
        email: appointmentForm.email.trim().toLowerCase(),
        phone: appointmentForm.phone.replace(/\s/g, '')
      };

      const response = await fetch('http://localhost:5003/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentPayload)
      });

      const data = await response.json();

      if (data.success) {
        alert('✅ Rendez-vous créé avec succès !');
        setTimeout(() => navigate('/'), 1500);
      } else {
        alert('❌ ' + (data.error || 'Erreur lors de la création du rendez-vous'));
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('❌ Erreur de connexion au serveur');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* HEADER */}
      <header className="bg-white/95 backdrop-blur-md shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-2.5 rounded-xl shadow-lg">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">HealthCare+</h1>
                <p className="text-xs text-gray-500">Clinique Médicale</p>
              </div>
            </Link>

            <Link 
              to="/"
              className="flex items-center space-x-2 text-gray-600 hover:text-indigo-600 transition font-medium"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Retour à l'accueil</span>
            </Link>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* TITLE SECTION */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-white rounded-full shadow-md mb-4">
            <Calendar className="w-5 h-5 text-indigo-600 mr-2" />
            <span className="text-sm font-semibold text-indigo-600">Prise de Rendez-vous</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Réservez Votre Consultation
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Remplissez le formulaire en deux étapes pour planifier votre rendez-vous médical
          </p>
        </div>

        {/* PROGRESS STEPS */}
        <div className="mb-12">
          <div className="flex items-center justify-center space-x-4">
            <div className={`flex items-center ${currentStep === 1 ? 'text-indigo-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                currentStep === 1 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                1
              </div>
              <span className="ml-3 font-medium hidden sm:block">Vos informations</span>
            </div>
            
            <div className="w-16 h-1 bg-gray-200 rounded">
              <div className={`h-full rounded transition-all ${currentStep === 2 ? 'bg-indigo-600 w-full' : 'bg-gray-200 w-0'}`}></div>
            </div>
            
            <div className={`flex items-center ${currentStep === 2 ? 'text-indigo-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                currentStep === 2 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                2
              </div>
              <span className="ml-3 font-medium hidden sm:block">Rendez-vous</span>
            </div>
          </div>
        </div>

        {/* FORM CARD */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
          <form onSubmit={handleSubmit}>
            {/* STEP 1: PERSONAL INFO */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-100 rounded-2xl p-6">
                  <div className="flex items-center mb-6">
                    <div className="bg-indigo-600 p-2 rounded-lg mr-3">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Informations Personnelles</h3>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Prénom <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          name="first_name"
                          value={appointmentForm.first_name}
                          onChange={handleChange}
                          className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                          placeholder="Votre prénom"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Nom <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          name="last_name"
                          value={appointmentForm.last_name}
                          onChange={handleChange}
                          className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                          placeholder="Votre nom"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          name="email"
                          value={appointmentForm.email}
                          onChange={handleChange}
                          className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                          placeholder="exemple@gmail.com"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Téléphone <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="tel"
                          name="phone"
                          value={appointmentForm.phone}
                          onChange={handleChange}
                          className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                          placeholder="0555123456"
                          pattern="[0-9]{10}"
                          maxLength="10"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Date de naissance <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="date_of_birth"
                        value={appointmentForm.date_of_birth}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Genre <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="gender"
                        value={appointmentForm.gender}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                        required
                      >
                        <option value="Homme">Homme</option>
                        <option value="Femme">Femme</option>
                      </select>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center justify-center"
                >
                  Continuer
                  <ArrowLeft className="w-5 h-5 ml-2 rotate-180" />
                </button>
              </div>
            )}

            {/* STEP 2: APPOINTMENT DETAILS */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-green-50 to-teal-50 border-2 border-green-100 rounded-2xl p-6">
                  <div className="flex items-center mb-6">
                    <div className="bg-green-600 p-2 rounded-lg mr-3">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Détails du Rendez-vous</h3>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Choisir un médecin <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Stethoscope className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <select
                          name="doctor_name"
                          value={appointmentForm.doctor_name}
                          onChange={handleChange}
                          className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition appearance-none"
                          required
                        >
                          {doctors.map((doc) => (
                            <option key={doc.id} value={`Dr. ${doc.first_name} ${doc.last_name}`}>
                              {`Dr. ${doc.first_name} ${doc.last_name}`} - {doc.specialization}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Date et Heure <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="datetime-local"
                          name="appointment_date"
                          value={appointmentForm.appointment_date}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Durée (minutes) <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="number"
                            name="duration"
                            value={appointmentForm.duration}
                            onChange={handleChange}
                            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                            required
                            min={15}
                            max={120}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Motif de consultation <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          name="reason"
                          value={appointmentForm.reason}
                          onChange={handleChange}
                          placeholder="Ex: Consultation générale, suivi, contrôle..."
                          className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Notes supplémentaires (optionnel)
                      </label>
                      <textarea
                        name="notes"
                        value={appointmentForm.notes}
                        onChange={handleChange}
                        placeholder="Informations complémentaires pour le médecin..."
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                        rows={4}
                      ></textarea>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex-1 bg-gray-200 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-300 transition-all flex items-center justify-center"
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Retour
                  </button>
                  
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`flex-1 bg-gradient-to-r from-green-600 to-teal-600 text-white py-4 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center justify-center ${
                      submitting ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Confirmer le rendez-vous
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* INFO CARDS */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
            <h4 className="font-bold text-gray-900 mb-2">Confirmation Rapide</h4>
            <p className="text-gray-600 text-sm">Réponse sous 24h</p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h4 className="font-bold text-gray-900 mb-2">Prise en Charge</h4>
            <p className="text-gray-600 text-sm">Service de qualité</p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-purple-600" />
            </div>
            <h4 className="font-bold text-gray-900 mb-2">Localisation</h4>
            <p className="text-gray-600 text-sm">Tlemcen Centre</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AppointmentPage;