import React, { useState, useEffect } from 'react';
import { 
  Menu, X, Phone, Mail, MapPin, Clock, Calendar, 
  Stethoscope, Heart, Activity, Users, Award, 
  ChevronRight, Star, ArrowRight, Facebook, 
  Instagram, Twitter, Linkedin, CheckCircle
} from 'lucide-react';
import { Link, useNavigate } from "react-router-dom";

function ClinicLandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('accueil');
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch('http://localhost:5006/api/doctors?is_active=true&per_page=4');
        const data = await response.json();
        if (data.success && data.doctors.length > 0) {
          setDoctors(data.doctors);
        } else {
          setDoctors([
            { id: 1, first_name: 'Sarah', last_name: 'Benali', specialization: 'Cardiologue', years_of_experience: 15 },
            { id: 2, first_name: 'Ahmed', last_name: 'Mansouri', specialization: 'Médecin Généraliste', years_of_experience: 12 },
            { id: 3, first_name: 'Leila', last_name: 'Kherroubi', specialization: 'Pédiatre', years_of_experience: 10 },
            { id: 4, first_name: 'Karim', last_name: 'Bouzid', specialization: 'Chirurgien', years_of_experience: 18 }
          ]);
        }
      } catch (error) {
        console.error('Erreur chargement médecins:', error);
        setDoctors([
          { id: 1, first_name: 'Sarah', last_name: 'Benali', specialization: 'Cardiologue', years_of_experience: 15 },
          { id: 2, first_name: 'Ahmed', last_name: 'Mansouri', specialization: 'Médecin Généraliste', years_of_experience: 12 }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      
      // Détection de la section active
      const sections = ['accueil', 'services', 'medecins', 'localisation', 'avis'];
      const current = sections.find(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });
      if (current) setActiveSection(current);
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
    navigate('/client/rendez-vous');
  };

  const services = [
    {
      icon: Stethoscope,
      title: "Consultation Générale",
      description: "Examens médicaux complets et diagnostics professionnels par nos médecins qualifiés.",
      color: "bg-gradient-to-br from-blue-500 to-blue-600",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600"
    },
    {
      icon: Heart,
      title: "Cardiologie",
      description: "Soins cardiaques spécialisés avec équipements de pointe pour votre santé cardiaque.",
      color: "bg-gradient-to-br from-red-500 to-red-600",
      iconBg: "bg-red-100",
      iconColor: "text-red-600"
    },
    {
      icon: Activity,
      title: "Médecine d'Urgence",
      description: "Service d'urgence disponible 24h/24 et 7j/7 pour tous vos besoins médicaux urgents.",
      color: "bg-gradient-to-br from-green-500 to-green-600",
      iconBg: "bg-green-100",
      iconColor: "text-green-600"
    },
    {
      icon: Users,
      title: "Pédiatrie",
      description: "Soins spécialisés pour les enfants avec une équipe attentionnée et expérimentée.",
      color: "bg-gradient-to-br from-purple-500 to-purple-600",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600"
    }
  ];

  const testimonials = [
    {
      name: "Fatima Zerrouki",
      text: "Excellente clinique avec un personnel très professionnel et attentionné. Je recommande vivement !",
      rating: 5,
      avatar: "FZ"
    },
    {
      name: "Mohamed Tlemcani",
      text: "Service rapide et efficace. Les médecins sont à l'écoute et prennent le temps d'expliquer.",
      rating: 5,
      avatar: "MT"
    },
    {
      name: "Amina Bensalah",
      text: "Très satisfaite de la qualité des soins reçus. Équipe médicale compétente et bienveillante.",
      rating: 5,
      avatar: "AB"
    }
  ];

  const stats = [
    { number: "15000+", label: "Patients Satisfaits", icon: Users },
    { number: "25+", label: "Médecins Experts", icon: Stethoscope },
    { number: "10+", label: "Années d'Expérience", icon: Award },
    { number: "24/7", label: "Service d'Urgence", icon: Clock }
  ];

  const features = [
    { icon: CheckCircle, text: "Équipements médicaux de pointe" },
    { icon: CheckCircle, text: "Personnel médical certifié" },
    { icon: CheckCircle, text: "Prise en charge rapide" },
    { icon: CheckCircle, text: "Suivi personnalisé" }
  ];

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
    <div className="min-h-screen bg-white">
      {/* HEADER */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => scrollToSection('accueil')}>
              <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-2.5 rounded-xl shadow-lg">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-xl font-bold ${scrolled ? 'text-gray-900' : 'text-white'}`}>
                  HealthCare+
                </h1>
                <p className={`text-xs ${scrolled ? 'text-gray-500' : 'text-indigo-200'}`}>
                  Clinique Médicale
                </p>
              </div>
            </div>

            <nav className="hidden md:flex space-x-8 items-center">
              {['accueil', 'services', 'medecins', 'localisation', 'avis'].map((item) => (
                <button
                  key={item}
                  onClick={() => scrollToSection(item)}
                  className={`capitalize font-medium transition-all relative group ${
                    activeSection === item 
                      ? 'text-indigo-600' 
                      : scrolled ? 'text-gray-700 hover:text-indigo-600' : 'text-white hover:text-indigo-200'
                  }`}
                >
                  {item === 'medecins' ? 'Médecins' : item}
                  <span className={`absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-600 transition-all group-hover:w-full ${
                    activeSection === item ? 'w-full' : ''
                  }`}></span>
                </button>
              ))}
            </nav>

            <button 
              onClick={handleTakeAppointment} 
              className="hidden md:flex items-center px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full hover:shadow-lg hover:scale-105 transition-all duration-300 font-medium"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Prendre RDV
            </button>

            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
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
          <div className="md:hidden bg-white border-t shadow-lg">
            <div className="px-4 py-4 space-y-2">
              {['accueil', 'services', 'medecins', 'localisation', 'avis'].map((item) => (
                <button
                  key={item}
                  onClick={() => scrollToSection(item)}
                  className={`block w-full text-left px-4 py-3 rounded-lg capitalize font-medium transition ${
                    activeSection === item
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {item === 'medecins' ? 'Médecins' : item}
                </button>
              ))}
              <button 
                onClick={handleTakeAppointment} 
                className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full hover:shadow-lg font-medium"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Prendre RDV
              </button>
            </div>
          </div>
        )}
      </header>

      {/* HERO SECTION */}
      <section id="accueil" className="relative pt-20 pb-32 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-purple-600/20"></div>
          <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-white space-y-8">
              <div className="inline-flex items-center px-4 py-2 bg-white/20 rounded-full backdrop-blur-sm">
                <span className="text-sm font-medium">🏥 Votre santé, notre priorité</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                Des Soins de Qualité
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-purple-200">
                  Pour Votre Bien-être
                </span>
              </h1>
              
              <p className="text-xl text-indigo-100 leading-relaxed">
                Clinique moderne à Tlemcen offrant des services médicaux complets avec une équipe de professionnels dévoués disponible 24/7.
              </p>

              <div className="space-y-3">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <feature.icon className="w-5 h-5 text-green-400" />
                    <span className="text-indigo-100">{feature.text}</span>
                  </div>
                ))}
              </div>
              
              <div className="flex flex-wrap gap-4 pt-4">
                <button 
                  onClick={handleTakeAppointment} 
                  className="flex items-center px-8 py-4 bg-white text-indigo-600 rounded-full font-semibold hover:bg-indigo-50 transition-all transform hover:scale-105 shadow-xl"
                >
                  Prendre Rendez-vous
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>
                <button 
                  onClick={() => scrollToSection('services')}
                  className="flex items-center px-8 py-4 bg-transparent border-2 border-white text-white rounded-full font-semibold hover:bg-white hover:text-indigo-600 transition-all"
                >
                  Nos Services
                </button>
              </div>
            </div>

            <div className="hidden md:block">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-3xl blur-2xl"></div>
                <div className="relative bg-white rounded-3xl shadow-2xl p-2 transform hover:rotate-0 rotate-3 transition-transform duration-300">
                  <img 
                    src="https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=600" 
                    alt="Clinique" 
                    className="rounded-2xl w-full h-96 object-cover"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-center border border-white/20 hover:bg-white/20 transition-all group">
                <stat.icon className="w-8 h-8 text-indigo-200 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="text-4xl font-bold text-white mb-2">{stat.number}</h3>
                <p className="text-indigo-100 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES SECTION */}
      <section id="services" className="py-20 bg-gradient-to-br from-gray-50 to-indigo-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-indigo-600 font-semibold text-sm uppercase tracking-wide">Nos Services</span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-2">Services Médicaux Complets</h2>
            <p className="text-xl text-gray-600 mt-4 max-w-3xl mx-auto">
              Nous offrons une gamme complète de services médicaux avec des équipements modernes et une équipe expérimentée
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <div 
                key={index} 
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer group border border-gray-100"
              >
                <div className={`${service.iconBg} w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <service.icon className={`w-8 h-8 ${service.iconColor}`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h3>
                <p className="text-gray-600 mb-4 leading-relaxed">{service.description}</p>
                <button className="flex items-center text-indigo-600 font-semibold group-hover:gap-2 transition-all">
                  En savoir plus
                  <ChevronRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            ))}
          </div>

          {/* ADDITIONAL FEATURES */}
          <div className="mt-16 bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className="grid md:grid-cols-3 gap-8 p-10">
              <div className="text-center group">
                <div className="bg-gradient-to-br from-green-400 to-green-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg">
                  <Clock className="w-10 h-10 text-white" />
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">Horaires Flexibles</h4>
                <p className="text-gray-600">Ouvert 7j/7 de 8h à 20h</p>
              </div>
              <div className="text-center group">
                <div className="bg-gradient-to-br from-blue-400 to-blue-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg">
                  <Award className="w-10 h-10 text-white" />
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">Équipe Certifiée</h4>
                <p className="text-gray-600">Médecins diplômés et expérimentés</p>
              </div>
              <div className="text-center group">
                <div className="bg-gradient-to-br from-purple-400 to-purple-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg">
                  <Heart className="w-10 h-10 text-white" />
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">Soins Personnalisés</h4>
                <p className="text-gray-600">Approche centrée sur le patient</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DOCTORS SECTION */}
      <section id="medecins" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-indigo-600 font-semibold text-sm uppercase tracking-wide">Nos Médecins</span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-2">Experts Qualifiés</h2>
            <p className="text-xl text-gray-600 mt-4 max-w-3xl mx-auto">
              Rencontrez notre équipe médicale spécialisée et dévouée à votre santé
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {doctors.map((doc) => (
              <div key={doc.id} className="group">
                <div className="bg-gradient-to-br from-gray-50 to-indigo-50/50 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                  <div className="bg-gradient-to-br from-indigo-500 to-purple-600 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                    <Stethoscope className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">
                    {`Dr. ${doc.first_name} ${doc.last_name}`}
                  </h3>
                  <p className="text-indigo-600 font-medium mb-2 text-center">{doc.specialization}</p>
                  <p className="text-gray-500 text-sm text-center">{doc.years_of_experience} ans d'expérience</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LOCATION SECTION */}
      <section id="localisation" className="py-20 bg-gradient-to-br from-gray-50 to-indigo-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-indigo-600 font-semibold text-sm uppercase tracking-wide">Où Nous Trouver</span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-2">Notre Localisation</h2>
          </div>
          
          <div className="grid md:grid-cols-5 gap-8 items-start">
            {/* MAP */}
            <div className="md:col-span-3">
              <div className="rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3237.5412785296437!2d-1.316772!3d34.878364!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd9f045e58a4e8a9%3A0x4bd64d2ba585f8e3!2sTlemcen!5e0!3m2!1sfr!2sdz!4v1700000000000"
                  width="100%"
                  height="500"
                  allowFullScreen=""
                  loading="lazy"
                  className="border-0"
                ></iframe>
              </div>
            </div>
            
            {/* CONTACT INFO */}
            <div className="md:col-span-2 space-y-4">
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-gray-100">
                <div className="flex items-start space-x-4">
                  <div className="bg-indigo-100 p-3 rounded-xl">
                    <MapPin className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Adresse</p>
                    <p className="text-gray-800 font-medium">Rue Abou Tachfine, Tlemcen, Algérie</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-gray-100">
                <div className="flex items-start space-x-4">
                  <div className="bg-green-100 p-3 rounded-xl">
                    <Phone className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Téléphone</p>
                    <p className="text-gray-800 font-medium">043 12 34 56</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-gray-100">
                <div className="flex items-start space-x-4">
                  <div className="bg-red-100 p-3 rounded-xl">
                    <Mail className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Email</p>
                    <p className="text-gray-800 font-medium">contact@healthcare.dz</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-gray-100">
                <div className="flex items-start space-x-4">
                  <div className="bg-purple-100 p-3 rounded-xl">
                    <Clock className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Horaires</p>
                    <p className="text-gray-800 font-medium">Ouvert 7j/7 – 8h à 20h</p>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => scrollToSection('accueil')}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                Obtenir l'itinéraire
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section id="avis" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-indigo-600 font-semibold text-sm uppercase tracking-wide">Témoignages</span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-2">Ce que disent nos Patients</h2>
            <p className="text-xl text-gray-600 mt-4 max-w-3xl mx-auto">
              La satisfaction de nos patients est notre fierté
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, index) => (
              <div 
                key={index} 
                className="bg-gradient-to-br from-gray-50 to-indigo-50/50 shadow-lg rounded-2xl p-8 border border-gray-100 hover:shadow-2xl transition-all hover:-translate-y-2"
              >
                <div className="flex items-center mb-6">
                  <div className="bg-gradient-to-br from-indigo-500 to-purple-600 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold mr-4">
                    {t.avatar}
                  </div>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className="w-5 h-5 text-yellow-400 fill-yellow-400"
                      />
                    ))}
                  </div>
                </div>
                <p className="text-gray-700 italic mb-6 leading-relaxed">"{t.text}"</p>
                <h4 className="font-bold text-indigo-600">— {t.name}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-300 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-4 gap-12">
          {/* Logo */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-2.5 rounded-xl">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-white text-xl font-bold">HealthCare+</h3>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Clinique moderne à Tlemcen dédiée à votre santé et votre bien-être.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-lg">Liens Utiles</h4>
            <ul className="space-y-3">
              {['accueil', 'services', 'medecins', 'localisation', 'avis'].map((item) => (
                <li key={item}>
                  <button
                    onClick={() => scrollToSection(item)}
                    className="hover:text-white transition capitalize text-gray-400 hover:translate-x-1 inline-block"
                  >
                    {item === 'medecins' ? 'Médecins' : item}
                  </button>
                </li>
              ))}
              <li className="pt-4 border-t border-gray-700">
                <Link 
                  to="/admin/login" 
                  className="text-gray-500 hover:text-gray-400 text-sm transition"
                >
                  Espace Administration
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-lg">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center text-gray-400 hover:text-white transition">
                <Phone className="w-4 h-4 mr-3" /> +213 555 12 34 56
              </li>
              <li className="flex items-center text-gray-400 hover:text-white transition">
                <Mail className="w-4 h-4 mr-3" /> contact@healthcare.dz
              </li>
              <li className="flex items-center text-gray-400 hover:text-white transition">
                <MapPin className="w-4 h-4 mr-3" /> Tlemcen, Algérie
              </li>
              <li className="flex items-center text-gray-400 hover:text-white transition">
                <Clock className="w-4 h-4 mr-3" /> 8h00 - 20h00
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-lg">Suivez-nous</h4>
            <div className="flex space-x-4">
              {[Facebook, Instagram, Twitter, Linkedin].map((Icon, index) => (
                <a 
                  key={index}
                  href="#" 
                  className="bg-gray-800 p-3 rounded-xl hover:bg-gradient-to-br hover:from-indigo-600 hover:to-purple-600 transition-all hover:scale-110"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm max-w-7xl mx-auto px-4">
          © 2025 HealthCare+. Tous droits réservés.
        </div>
      </footer>
    </div>
  );
}

export default ClinicLandingPage;