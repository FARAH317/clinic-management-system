import React, { useState, useEffect } from 'react';
import { 
  Menu, X, Phone, Mail, MapPin, Clock, Calendar, 
  Stethoscope, Heart, Activity, Users, Award, 
  ChevronRight, Star, ArrowRight, Facebook, 
  Instagram, Twitter, Linkedin 
} from 'lucide-react';
import { Link } from "react-router-dom";

function ClinicLandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('accueil');
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

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
        const response = await fetch('http://localhost:5006/api/doctors?is_active=true&per_page=4');
        const data = await response.json();
        if (data.success && data.doctors.length > 0) {
          setDoctors(data.doctors);
          setAppointmentForm(prev => ({ ...prev, doctor_name: `Dr. ${data.doctors[0].first_name} ${data.doctors[0].last_name}` }));
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

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(sectionId);
      setIsMenuOpen(false);
    }
  };

  const handleTakeAppointment = () => {
    scrollToSection('contact');
  };

  const handleAppointmentChange = (e) => {
    const { name, value } = e.target;
    setAppointmentForm({ ...appointmentForm, [name]: value });
  };

  const handleAppointmentSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!appointmentForm.first_name || !appointmentForm.last_name || 
          !appointmentForm.email || !appointmentForm.phone) {
        alert('❌ Veuillez remplir tous les champs obligatoires');
        return;
      }

      const patientPayload = {
        first_name: appointmentForm.first_name.trim(),
        last_name: appointmentForm.last_name.trim(),
        email: appointmentForm.email.trim(),
        phone: appointmentForm.phone.trim(),
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
        return;
      }

      const patientId = patientData.patient.id;

      if (!appointmentForm.appointment_date) {
        alert('❌ Veuillez sélectionner une date et heure');
        return;
      }

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
        email: appointmentForm.email.trim(),
        phone: appointmentForm.phone.trim()
      };

      const response = await fetch('http://localhost:5003/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentPayload)
      });

      const data = await response.json();

      if (data.success) {
        alert('✅ Rendez-vous créé avec succès !');
        setAppointmentForm({
          doctor_name: appointmentForm.doctor_name,
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
      } else {
        alert('❌ ' + (data.error || 'Erreur lors de la création du rendez-vous'));
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('❌ Erreur de connexion au serveur');
    }
  };

  const services = [
    {
      icon: Stethoscope,
      title: "Consultation Générale",
      description: "Examens médicaux complets et diagnostics professionnels par nos médecins qualifiés.",
      color: "bg-blue-100 text-blue-600"
    },
    {
      icon: Heart,
      title: "Cardiologie",
      description: "Soins cardiaques spécialisés avec équipements de pointe pour votre santé cardiaque.",
      color: "bg-red-100 text-red-600"
    },
    {
      icon: Activity,
      title: "Médecine d'Urgence",
      description: "Service d'urgence disponible 24h/24 et 7j/7 pour tous vos besoins médicaux urgents.",
      color: "bg-green-100 text-green-600"
    },
    {
      icon: Users,
      title: "Pédiatrie",
      description: "Soins spécialisés pour les enfants avec une équipe attentionnée et expérimentée.",
      color: "bg-purple-100 text-purple-600"
    }
  ];

  const testimonials = [
    {
      name: "Fatima Zerrouki",
      text: "Excellente clinique avec un personnel très professionnel et attentionné. Je recommande vivement !",
      rating: 5
    },
    {
      name: "Mohamed Tlemcani",
      text: "Service rapide et efficace. Les médecins sont à l'écoute et prennent le temps d'expliquer.",
      rating: 5
    },
    {
      name: "Amina Bensalah",
      text: "Très satisfaite de la qualité des soins reçus. Équipe médicale compétente et bienveillante.",
      rating: 5
    }
  ];

  const stats = [
    { number: "15000+", label: "Patients Satisfaits" },
    { number: "25+", label: "Médecins Experts" },
    { number: "10+", label: "Années d'Expérience" },
    { number: "24/7", label: "Service d'Urgence" }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-lg' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">HealthCare+</h1>
                <p className="text-xs text-gray-500">Clinique Médicale</p>
              </div>
            </div>

            <nav className="hidden md:flex space-x-8 items-center">
              {['accueil', 'services', 'medecins', 'contact'].map((item) => (
                <button
                  key={item}
                  onClick={() => scrollToSection(item)}
                  className={`capitalize font-medium transition-colors ${
                    activeSection === item 
                      ? 'text-indigo-600' 
                      : scrolled ? 'text-gray-700 hover:text-indigo-600' : 'text-white hover:text-indigo-200'
                  }`}
                >
                  {item}
                </button>
              ))}
            </nav>

            <button 
              onClick={handleTakeAppointment} 
              className="hidden md:flex items-center px-6 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Prendre RDV
            </button>

            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2"
            >
              {isMenuOpen ? (
                <X className={scrolled ? 'text-gray-900' : 'text-white'} />
              ) : (
                <Menu className={scrolled ? 'text-gray-900' : 'text-white'} />
              )}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-4 py-4 space-y-3">
              {['accueil', 'services', 'medecins', 'contact'].map((item) => (
                <button
                  key={item}
                  onClick={() => scrollToSection(item)}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg capitalize"
                >
                  {item}
                </button>
              ))}
              <button 
                onClick={handleTakeAppointment} 
                className="w-full flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Prendre RDV
              </button>
            </div>
          </div>
        )}
      </header>

      <section id="accueil" className="relative pt-20 pb-32 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-white space-y-6">
              <div className="inline-block px-4 py-2 bg-white bg-opacity-20 rounded-full backdrop-blur-sm">
                <span className="text-sm font-medium">🏥 Votre santé, notre priorité</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                Des Soins de Qualité
                <span className="block text-indigo-200">Pour Votre Bien-être</span>
              </h1>
              <p className="text-xl text-indigo-100">
                Clinique moderne à Tlemcen offrant des services médicaux complets avec une équipe de professionnels dévoués disponible 24/7.
              </p>
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={handleTakeAppointment} 
                  className="flex items-center px-8 py-4 bg-white text-indigo-600 rounded-full font-semibold hover:bg-indigo-50 transition transform hover:scale-105"
                >
                  Prendre Rendez-vous
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>
                <button 
                  onClick={() => scrollToSection('services')}
                  className="flex items-center px-8 py-4 bg-transparent border-2 border-white text-white rounded-full font-semibold hover:bg-white hover:text-indigo-600 transition"
                >
                  Nos Services
                </button>
              </div>
            </div>

            <div className="hidden md:block">
              <div className="relative">
                <div className="bg-white rounded-2xl shadow-2xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                  <img 
                    src="https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=600" 
                    alt="Clinique" 
                    className="rounded-xl w-full h-96 object-cover"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-6 text-center border border-white border-opacity-20">
                <h3 className="text-4xl font-bold text-white mb-2">{stat.number}</h3>
                <p className="text-indigo-100">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="services" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-indigo-600 font-semibold text-sm uppercase tracking-wide">Nos Services</span>
            <h2 className="text-4xl font-bold text-gray-900 mt-2">Services Médicaux Complets</h2>
            <p className="text-xl text-gray-600 mt-4 max-w-3xl mx-auto">
              Nous offrons une gamme complète de services médicaux avec des équipements modernes et une équipe expérimentée
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <div 
                key={index} 
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer group"
              >
                <div className={`${service.color} w-16 h-16 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <service.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{service.title}</h3>
                <p className="text-gray-600 mb-4">{service.description}</p>
                <button className="flex items-center text-indigo-600 font-semibold hover:gap-2 transition-all">
                  En savoir plus
                  <ChevronRight className="w-5 h-5 ml-1" />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-16 bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="grid md:grid-cols-3 gap-8 p-8">
              <div className="text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-green-600" />
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">Horaires Flexibles</h4>
                <p className="text-gray-600">Ouvert 7j/7 de 8h à 20h</p>
              </div>
              <div className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-blue-600" />
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">Équipe Certifiée</h4>
                <p className="text-gray-600">Médecins diplômés et expérimentés</p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-purple-600" />
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">Soins Personnalisés</h4>
                <p className="text-gray-600">Approche centrée sur le patient</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="medecins" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-indigo-600 font-semibold text-sm uppercase tracking-wide">Nos Médecins</span>
            <h2 className="text-4xl font-bold text-gray-900 mt-2">Experts Qualifiés</h2>
            <p className="text-xl text-gray-600 mt-4 max-w-3xl mx-auto">
              Rencontrez notre équipe médicale spécialisée et dévouée à votre santé.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {doctors.map((doc) => (
              <div key={doc.id} className="bg-gray-50 rounded-xl p-6 shadow hover:shadow-2xl transition-all">
                <div className="bg-indigo-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Stethoscope className="w-10 h-10 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">{`Dr. ${doc.first_name} ${doc.last_name}`}</h3>
                <p className="text-gray-600 mb-2 text-center">{doc.specialization}</p>
                <p className="text-gray-500 text-sm text-center">{doc.years_of_experience} ans d'expérience</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-indigo-600 font-semibold text-sm uppercase tracking-wide">Prendre Rendez-vous</span>
            <h2 className="text-4xl font-bold text-gray-900 mt-2">Réservez Votre Consultation</h2>
            <p className="text-xl text-gray-600 mt-4 max-w-3xl mx-auto">
              Remplissez le formulaire ci-dessous pour planifier un rendez-vous avec nos médecins.
            </p>
          </div>

          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8">
            <form onSubmit={handleAppointmentSubmit} className="space-y-4">
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-indigo-800 mb-4">
                  <strong>📋 Vos informations personnelles</strong>
                </p>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Prénom *</label>
                    <input
                      type="text"
                      name="first_name"
                      value={appointmentForm.first_name}
                      onChange={handleAppointmentChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
                    <input
                      type="text"
                      name="last_name"
                      value={appointmentForm.last_name}
                      onChange={handleAppointmentChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={appointmentForm.email}
                      onChange={handleAppointmentChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={appointmentForm.phone}
                      onChange={handleAppointmentChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date de naissance *</label>
                    <input
                      type="date"
                      name="date_of_birth"
                      value={appointmentForm.date_of_birth}
                      onChange={handleAppointmentChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Genre *</label>
                    <select
                      name="gender"
                      value={appointmentForm.gender}
                      onChange={handleAppointmentChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    >
                      <option value="Homme">Homme</option>
                      <option value="Femme">Femme</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-green-800 mb-4">
                  <strong>📅 Détails du rendez-vous</strong>
                </p>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Médecin *</label>
                  <select
                    name="doctor_name"
                    value={appointmentForm.doctor_name}
                    onChange={handleAppointmentChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  >
                    {doctors.map((doc) => (
                      <option key={doc.id} value={`Dr. ${doc.first_name} ${doc.last_name}`}>
                        {`Dr. ${doc.first_name} ${doc.last_name}`} - {doc.specialization}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date et Heure *</label>
                  <input
                    type="datetime-local"
                    name="appointment_date"
                    value={appointmentForm.appointment_date}
                    onChange={handleAppointmentChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Durée (minutes) *</label>
                  <input
                    type="number"
                    name="duration"
                    value={appointmentForm.duration}
                    onChange={handleAppointmentChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                    min={15}
                    max={120}
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Motif *</label>
                  <input
                    type="text"
                    name="reason"
                    value={appointmentForm.reason}
                    onChange={handleAppointmentChange}
                    placeholder="Ex: Consultation générale, suivi, etc."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes (optionnel)</label>
                  <textarea
                    name="notes"
                    value={appointmentForm.notes}
                    onChange={handleAppointmentChange}
                    placeholder="Informations complémentaires..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    rows={3}
                  ></textarea>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-4 rounded-lg font-semibold hover:bg-indigo-700 transition flex items-center justify-center"
              >
                <Calendar className="w-5 h-5 mr-2" />
                Confirmer le rendez-vous
              </button>
            </form>
          </div>
        </div>
      </section>
      {/* SECTION LOCALISATION */}
{/* SECTION LOCALISATION */}
<section id="localisation" className="py-16 bg-white">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="text-center mb-10">
      <span className="text-indigo-600 font-semibold text-sm uppercase tracking-wide">Où Nous Trouver</span>
      <h2 className="text-3xl font-bold text-gray-900 mt-2">Notre Localisation</h2>
    </div>
    
    <div className="grid md:grid-cols-5 gap-6 items-start">
      
      {/* MAP GOOGLE - Plus grand (3 colonnes) */}
      <div className="md:col-span-3">
        <div className="rounded-xl overflow-hidden shadow-lg border border-gray-200">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3237.5412785296437!2d-1.316772!3d34.878364!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd9f045e58a4e8a9%3A0x4bd64d2ba585f8e3!2sTlemcen!5e0!3m2!1sfr!2sdz!4v1700000000000"
            width="100%"
            height="450"
            allowFullScreen=""
            loading="lazy"
            className="border-0"
          ></iframe>
        </div>
      </div>
      
      {/* INFOS CLINIQUE - Plus compact (2 colonnes) */}
      <div className="md:col-span-2 space-y-4">
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <div className="flex items-start space-x-3">
            <MapPin className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Adresse</p>
              <p className="text-sm text-gray-800">Rue Abou Tachfine, Tlemcen, Algérie</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <div className="flex items-start space-x-3">
            <Phone className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Téléphone</p>
              <p className="text-sm text-gray-800">043 12 34 56</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <div className="flex items-start space-x-3">
            <Mail className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Email</p>
              <p className="text-sm text-gray-800">contact@healthcare.dz</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <div className="flex items-start space-x-3">
            <Clock className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Horaires</p>
              <p className="text-sm text-gray-800">Ouvert 7j/7 – 8h à 20h</p>
            </div>
          </div>
        </div>
        
        {/* CTA Button */}
        <div className="pt-2">
          <a 
            href="#contact"
            className="block w-full text-center bg-indigo-600 text-white font-semibold py-2.5 px-6 rounded-lg shadow-md hover:bg-indigo-700 hover:shadow-lg transition-all duration-300"
          >
            Obtenir l'itinéraire
          </a>
        </div>
      </div>
    </div>
  </div>
</section>
{/* SECTION AVIS CLIENTS */}
<section id="avis" className="py-20 bg-gray-50">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="text-center mb-16">
      <span className="text-indigo-600 font-semibold text-sm uppercase tracking-wide">Témoignages</span>
      <h2 className="text-4xl font-bold text-gray-900 mt-2">Ce que disent nos Patients</h2>
      <p className="text-xl text-gray-600 mt-4 max-w-3xl mx-auto">
        La satisfaction de nos patients est notre fierté .
      </p>
    </div>

    <div className="grid md:grid-cols-3 gap-8">
      {testimonials.map((t, index) => (
        <div 
          key={index} 
          className="bg-white shadow-lg rounded-2xl p-6 border hover:shadow-2xl transition-all"
        >
          <div className="flex items-center mb-4">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`w-5 h-5 ${
                  i < Math.floor(t.rating) 
                    ? 'text-yellow-400 fill-yellow-400' 
                    : i < t.rating 
                    ? 'text-yellow-400 fill-yellow-200' 
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <p className="text-gray-700 italic mb-4">"{t.text}"</p>
          <h4 className="font-bold text-indigo-600 text-right">— {t.name}</h4>
        </div>
      ))}
    </div>
  </div>
</section>


      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-4 gap-8">

          {/* Logo */}
          <div>
            <h3 className="text-white text-xl font-bold mb-4 flex items-center">
              <Heart className="w-6 h-6 text-red-500 mr-2" />
              HealthCare+
            </h3>
            <p className="text-gray-400">
              Clinique moderne à Tlemcen dédiée à votre santé et votre bien-être.
            </p>
          </div>

          {/* Liens rapides */}
          <div>
            <h4 className="text-white font-semibold mb-4">Liens Utiles</h4>
            <ul className="space-y-2">
              {['accueil', 'services', 'medecins', 'contact'].map((item) => (
                <li key={item}>
                  <button
                    onClick={() => scrollToSection(item)}
                    className="hover:text-white transition capitalize"
                  >
                    {item}
                  </button>
                </li>
              ))}
              <li className="pt-4 border-t border-gray-800">
      <Link 
        to="/admin/login" 
        className="text-gray-500 hover:text-gray-400 text-xs transition"
      >
        Espace Administration
      </Link>
    </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <ul className="space-y-2">
              <li className="flex items-center"><Phone className="w-4 h-4 mr-2" /> +213 555 12 34 56</li>
              <li className="flex items-center"><Mail className="w-4 h-4 mr-2" /> contact@healthcare.dz</li>
              <li className="flex items-center"><MapPin className="w-4 h-4 mr-2" /> Tlemcen, Algérie</li>
              <li className="flex items-center"><Clock className="w-4 h-4 mr-2" /> 8h00 - 20h00</li>
              
            </ul>
          </div>
          

          {/* Réseaux sociaux */}
          <div>
            <h4 className="text-white font-semibold mb-4">Suivez-nous</h4>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-white"><Facebook /></a>
              <a href="#" className="hover:text-white"><Instagram /></a>
              <a href="#" className="hover:text-white"><Twitter /></a>
              <a href="#" className="hover:text-white"><Linkedin /></a>
            </div>
          </div>
        </div>

        <div className="mt-10 text-center text-gray-500 text-sm">
          © 2025 HealthCare+. Tous droits réservés.
        </div>
      </footer>
    </div>
  );
}

export default ClinicLandingPage;