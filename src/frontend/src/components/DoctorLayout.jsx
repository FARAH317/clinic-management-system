import React, { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { MENU_ITEMS, hasPermission } from '../utils/rolePermissions';
import {
  Users, Calendar, FileText, Pill, Activity,
  UserCheck, History, Menu, X,
  LogOut, Settings, Bell, ChevronDown, User
} from 'lucide-react';

export default function DoctorLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  // Filter menu items: EXCLURE "Médecins" et AJOUTER "Mon Profil"
  const baseMenuItems = MENU_ITEMS.filter(item =>
    item.roles.includes('doctor') && 
    hasPermission(user?.role, item.module, 'view') &&
    item.module !== 'doctors' // ❌ PAS D'ACCÈS à la liste des médecins
  ).map(item => ({
    ...item,
    path: item.path.replace('/admin', '/doctor')
  }));

  // Construire le menu avec "Mon Profil" en 2ème position
  const menuItems = [
    baseMenuItems[0], // Dashboard
    {
      name: 'Mon Profil',
      icon: User,
      path: '/doctor/profile',
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
      hoverBg: 'hover:bg-cyan-500/20'
    },
    ...baseMenuItems.slice(1) // Reste des items
  ];

  // Fonction de déconnexion avec confirmation
  const handleLogout = () => {
    if (window.confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      logout();
      navigate('/admin/login');
    }
  };

  return (
    <div className="flex h-screen bg-gray-900">
      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-gray-800 text-white transition-transform duration-300 flex flex-col shadow-2xl lg:relative lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Logo */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            {sidebarOpen ? (
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">CliniqueApp</h1>
                  <p className="text-xs text-gray-400">Espace Médecin</p>
                </div>
              </div>
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mx-auto">
                <UserCheck className="w-6 h-6" />
              </div>
            )}
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.name}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                location.pathname === item.path
                  ? `${item.bgColor} ${item.color}`
                  : `text-gray-400 ${item.hoverBg} hover:text-white`
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="font-medium">{item.name}</span>}
            </button>
          ))}
        </nav>

        {/* Footer avec Déconnexion */}
        <div className="p-4 border-t border-gray-700 space-y-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-red-500/20 hover:text-red-400 transition-all"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span>Déconnexion</span>}
          </button>
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-3 top-20 bg-gray-900 border-2 border-gray-700 rounded-full p-1.5 hover:bg-gray-800 transition-all z-10"
        >
          {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-gray-800 shadow-sm border-b border-gray-700 sticky top-0 z-10">
          <div className="px-4 sm:px-8 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">
                {menuItems.find(item => item.path === location.pathname)?.name || 'Dashboard'}
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                Bienvenue Dr. {user?.first_name || user?.username}
              </p>
            </div>

            <div className="flex items-center space-x-4">
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-700 transition"
              >
                <Menu className="w-6 h-6 text-white" />
              </button>

              {/* Menu Utilisateur avec Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center space-x-3 hover:bg-gray-700 rounded-lg px-3 py-2 transition"
                >
                  <div className="text-right">
                    <p className="text-sm font-medium text-white">
                      Dr. {user?.first_name || user?.username}
                    </p>
                    <p className="text-xs text-gray-400">Médecin</p>
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                    {user?.username?.[0]?.toUpperCase() || 'M'}
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>

                {/* Dropdown Menu */}
                {profileMenuOpen && (
                  <>
                    <div className="absolute right-0 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl z-50">
                      {/* User Info */}
                      <div className="p-4 border-b border-gray-700">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {user?.username?.[0]?.toUpperCase() || 'M'}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white">
                              Dr. {user?.first_name || user?.username}
                            </p>
                            <p className="text-xs text-gray-400">
                              {user?.email || 'medecin@clinique.com'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        <button
                          onClick={() => {
                            setProfileMenuOpen(false);
                            navigate('/doctor/profile');
                          }}
                          className="w-full flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition"
                        >
                          <User className="w-4 h-4" />
                          <span className="text-sm">Mon profil</span>
                        </button>
                        
                        <button
                          onClick={() => {
                            setProfileMenuOpen(false);
                            navigate('/doctor/settings');
                          }}
                          className="w-full flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition"
                        >
                          <Settings className="w-4 h-4" />
                          <span className="text-sm">Paramètres</span>
                        </button>
                      </div>

                      {/* Logout */}
                      <div className="border-t border-gray-700 py-2">
                        <button
                          onClick={() => {
                            setProfileMenuOpen(false);
                            handleLogout();
                          }}
                          className="w-full flex items-center space-x-3 px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition"
                        >
                          <LogOut className="w-4 h-4" />
                          <span className="text-sm font-medium">Déconnexion</span>
                        </button>
                      </div>
                    </div>

                    {/* Backdrop pour fermer le menu */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setProfileMenuOpen(false)}
                    ></div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 sm:p-8 bg-gray-900 min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
}