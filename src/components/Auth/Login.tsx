// src/components/Auth/Login.tsx
import { useState, useContext } from 'react';
import api from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaUserAlt, FaLock, FaEnvelope } from 'react-icons/fa';
import 'react-toastify/dist/ReactToastify.css';
import { AuthContext } from '../Auth/AuthContext';

interface AutenticacionResponseDto {
  userId: number;
}

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const navigate = useNavigate();
  const { login } = useContext(AuthContext); // Obtiene la función login del contexto

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post<AutenticacionResponseDto>('/usuarios/autenticar', {
        nombre: username,
        email,
        contrasena: password,
      });

      const { userId } = res.data;

      if (!userId) {
        throw new Error('ID de usuario no recibido.');
      }

      // Llama a la función login del contexto
      login(userId.toString());

      toast.success('Inicio de sesión exitoso', {
        position: 'top-center',
        autoClose: 3000,
      });

      navigate('/dashboard');
    } catch (error: any) {
      if (error.response) {
        toast.error(error.response.data.message || 'Error al iniciar sesión.', {
          position: 'top-center',
          autoClose: 4000,
        });
      } else {
        toast.error('Error al iniciar sesión.', {
          position: 'top-center',
          autoClose: 4000,
        });
      }
      console.error('Error al iniciar sesión:', error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg border border-gray-200">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Bienvenido</h1>

        <form onSubmit={handleLogin} className="space-y-6">
          {/* Campo de nombre de usuario */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Nombre de Usuario</label>
            <div className="relative">
              <FaUserAlt className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Nombre de usuario"
                className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                onChange={(e) => setUsername(e.target.value)}
                value={username}
                required
              />
            </div>
          </div>

          {/* Campo de correo */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Correo Electrónico</label>
            <div className="relative">
              <FaEnvelope className="absolute left-3 top-3 text-gray-400" />
              <input
                type="email"
                placeholder="Email"
                className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                required
              />
            </div>
          </div>

          {/* Campo de contraseña */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Contraseña</label>
            <div className="relative">
              <FaLock className="absolute left-3 top-3 text-gray-400" />
              <input
                type="password"
                placeholder="Contraseña"
                className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                required
              />
            </div>
          </div>

          {/* Botón para iniciar sesión */}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-3 rounded-lg font-bold hover:bg-blue-600 transition duration-300"
          >
            Iniciar Sesión
          </button>
        </form>

        <p className="text-center mt-6 text-gray-600">
          ¿No tienes una cuenta?{' '}
          <button
            className="text-blue-500 hover:text-blue-400 font-semibold"
            onClick={() => navigate('/register')}
          >
            Regístrate aquí
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;
