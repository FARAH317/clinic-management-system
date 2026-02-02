/**
 * Configuration des permissions par rôle
 * Définit quelles routes et fonctionnalités sont accessibles pour chaque rôle
 */

export const ROLES = {
  ADMIN: 'admin',
  DOCTOR: 'doctor',
  SECRETARY: 'secretary'
};

export const PERMISSIONS = {
  // Admin a accès à tout
  admin: {
    dashboard: true,
    patients: { view: true, create: true, edit: true, delete: true },
    doctors: { view: true, create: true, edit: true, delete: true },
    appointments: { view: true, create: true, edit: true, delete: true },
    prescriptions: { view: true, create: true, edit: true, delete: true },
    medicines: { view: true, create: true, edit: true, delete: true },
    billing: { view: true, create: true, edit: true, delete: true },
    activity: { view: true },
    settings: { view: true, edit: true }
  },

  // Médecin : accès limité
  doctor: {
    dashboard: true,
    patients: { view: true, create: true, edit: true, delete: false }, // Peut gérer ses patients
    doctors: { view: true, create: false, edit: false, delete: false }, // Voir seulement
    appointments: { view: true, create: true, edit: true, delete: false }, // Ses rendez-vous
    prescriptions: { view: true, create: true, edit: true, delete: false }, // Ses ordonnances
    medicines: { view: true, create: false, edit: false, delete: false }, // Consultation seulement
    billing: { view: false, create: false, edit: false, delete: false }, // Pas d'accès
    activity: { view: true }, // Son historique seulement
    settings: { view: true, edit: false } // Peut voir mais pas modifier
  },

  // Secrétaire : gestion administrative
  secretary: {
    dashboard: true,
    patients: { view: true, create: true, edit: true, delete: false },
    doctors: { view: true, create: false, edit: false, delete: false },
    appointments: { view: true, create: true, edit: true, delete: true }, // Gestion complète
    prescriptions: { view: true, create: false, edit: false, delete: false }, // Lecture seule
    medicines: { view: true, create: false, edit: false, delete: false },
    billing: { view: true, create: true, edit: true, delete: false }, // Gestion facturation
    activity: { view: true },
    settings: { view: false, edit: false } // Pas d'accès
  }
};

/**
 * Vérifie si un utilisateur a une permission spécifique
 */
export const hasPermission = (userRole, module, action = 'view') => {
  if (!userRole || !PERMISSIONS[userRole]) return false;
  
  const rolePermissions = PERMISSIONS[userRole];
  
  if (typeof rolePermissions[module] === 'boolean') {
    return rolePermissions[module];
  }
  
  if (typeof rolePermissions[module] === 'object') {
    return rolePermissions[module][action] || false;
  }
  
  return false;
};

/**
 * Obtient les routes accessibles pour un rôle
 */
export const getAccessibleRoutes = (userRole) => {
  if (!userRole || !PERMISSIONS[userRole]) return [];
  
  const permissions = PERMISSIONS[userRole];
  const routes = [];
  
  Object.keys(permissions).forEach(module => {
    if (typeof permissions[module] === 'boolean' && permissions[module]) {
      routes.push(module);
    } else if (typeof permissions[module] === 'object' && permissions[module].view) {
      routes.push(module);
    }
  });
  
  return routes;
};

/**
 * Items de menu avec leurs permissions requises
 */
export const MENU_ITEMS = [
  {
    name: 'Dashboard',
    path: '/admin/dashboard',
    module: 'dashboard',
    icon: 'Activity',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    hoverBg: 'hover:bg-blue-500/20',
    roles: [ROLES.ADMIN, ROLES.DOCTOR, ROLES.SECRETARY]
  },
  {
    name: 'Patients',
    path: '/admin/patients',
    module: 'patients',
    icon: 'Users',
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-500/10',
    hoverBg: 'hover:bg-indigo-500/20',
    roles: [ROLES.ADMIN, ROLES.DOCTOR, ROLES.SECRETARY]
  },
  {
    name: 'Médecins',
    path: '/admin/doctors',
    module: 'doctors',
    icon: 'UserCheck',
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    hoverBg: 'hover:bg-green-500/20',
    roles: [ROLES.ADMIN, ROLES.DOCTOR, ROLES.SECRETARY]
  },
  {
    name: 'Rendez-vous',
    path: '/admin/appointments',
    module: 'appointments',
    icon: 'Calendar',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    hoverBg: 'hover:bg-purple-500/20',
    roles: [ROLES.ADMIN, ROLES.DOCTOR, ROLES.SECRETARY]
  },
  {
    name: 'Ordonnances',
    path: '/admin/prescriptions',
    module: 'prescriptions',
    icon: 'FileText',
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/10',
    hoverBg: 'hover:bg-pink-500/20',
    roles: [ROLES.ADMIN, ROLES.DOCTOR, ROLES.SECRETARY]
  },
  {
    name: 'Médicaments',
    path: '/admin/medicines',
    module: 'medicines',
    icon: 'Pill',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    hoverBg: 'hover:bg-orange-500/20',
    roles: [ROLES.ADMIN, ROLES.DOCTOR, ROLES.SECRETARY]
  },
  {
    name: 'Facturation & IMC',
    path: '/admin/billing',
    module: 'billing',
    icon: 'DollarSign',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    hoverBg: 'hover:bg-emerald-500/20',
    roles: [ROLES.ADMIN, ROLES.SECRETARY]
  },
  {
    name: 'Historique',
    path: '/admin/activity',
    module: 'activity',
    icon: 'History',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    hoverBg: 'hover:bg-cyan-500/20',
    roles: [ROLES.ADMIN, ROLES.DOCTOR, ROLES.SECRETARY]
  }
];