import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';


 // si tu as un context pour auth

function AdminLogin() {
  const { setUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');

  try {
    const response = await fetch('http://127.0.0.1:5001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: formData.email,   // 🔥 ici le backend attend "username" !
        password: formData.password
      }),
    });

    const data = await response.json();
    console.log(data);

    if (response.ok && data.user?.role === 'admin') {
      setUser(data.user);
      navigate('/admin');
    } else {
      setError(data.error || 'Identifiants incorrects ou accès refusé');
    }
  } catch (err) {
    console.error(err);
    setError('Erreur de connexion au serveur');
  }
};



  return (
    <div className="max-w-sm mx-auto mt-20 p-6 border rounded shadow">
      <h2 className="text-xl mb-4">Connexion Admin</h2>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          className="border p-2 rounded"
        />
        <input
          type="password"
          name="password"
          placeholder="Mot de passe"
          value={formData.password}
          onChange={handleChange}
          required
          className="border p-2 rounded"
        />
        <button type="submit" className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
          Se connecter
        </button>
      </form>
    </div>
  );
}

export default AdminLogin;
