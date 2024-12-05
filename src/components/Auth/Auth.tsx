// src/components/Auth/Auth.tsx

import { useState, useContext } from 'react';
import api from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaUserAlt, FaLock, FaEnvelope, FaHome } from 'react-icons/fa';
import 'react-toastify/dist/ReactToastify.css';
import { AuthContext } from './AuthContext';
interface AutenticacionResponseDto {
  userId: number;
}

function Auth() {
  const [activeForm, setActiveForm] = useState<'login' | 'register'>('login');

  // Estados para Login
  const [loginNombre, setLoginNombre] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Estados para Register
  const [registerNombre, setRegisterNombre] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerDireccion, setRegisterDireccion] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');

  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post<AutenticacionResponseDto>('/usuarios/autenticar', {
        nombre: loginNombre,
        email: loginEmail,
        contrasena: loginPassword,
      });

      const { userId } = res.data;

      if (!userId) {
        throw new Error('ID de usuario no recibido.');
      }

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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(registerEmail)) {
      toast.error('Por favor ingresa un correo válido.', {
        position: 'top-center',
        autoClose: 4000,
      });
      return;
    }

    if (registerPassword.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres.', {
        position: 'top-center',
        autoClose: 4000,
      });
      return;
    }

    if (registerPassword !== registerConfirmPassword) {
      toast.error('Las contraseñas no coinciden.', {
        position: 'top-center',
        autoClose: 4000,
      });
      return;
    }

    try {
      const response = await api.post('/auth/register', {
        nombre: registerNombre,
        email: registerEmail,
        direccion: registerDireccion,
        password: registerPassword,
        confirmPassword: registerConfirmPassword,
      });

      if (response.status === 200 || response.status === 201) {
        toast.success('Registro exitoso. Por favor inicia sesión.', {
          position: 'top-center',
          autoClose: 3000,
        });
        setActiveForm('login');
        setRegisterNombre('');
        setRegisterEmail('');
        setRegisterDireccion('');
        setRegisterPassword('');
        setRegisterConfirmPassword('');
      } else {
        toast.error('Hubo un problema al registrar. Inténtalo nuevamente.', {
          position: 'top-center',
          autoClose: 4000,
        });
        console.error('Error al registrar:', response);
      }
    } catch (error: any) {
      console.error('Error al registrar:', error);

      if (error.response) {
        console.log('Error response data:', error.response.data);

        if (error.response.status === 500) {
          toast.success('Registro exitoso. Por favor inicia sesión.', {
            position: 'top-center',
            autoClose: 3000,
          });
          setActiveForm('login');
          setRegisterNombre('');
          setRegisterEmail('');
          setRegisterDireccion('');
          setRegisterPassword('');
          setRegisterConfirmPassword('');
        } else if (error.response.status === 400) {
          const errorMessage = error.response.data.message || 'Hubo un problema al registrar. Inténtalo nuevamente.';
          toast.error(errorMessage, {
            position: 'top-center',
            autoClose: 4000,
          });
        } else {
          toast.error('Hubo un problema al registrar. Inténtalo nuevamente.', {
            position: 'top-center',
            autoClose: 4000,
          });
        }
      } else {
        toast.error('No se pudo conectar con el servidor. Inténtalo más tarde.', {
          position: 'top-center',
          autoClose: 4000,
        });
      }
    }
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-5xl bg-white rounded-lg shadow-xl overflow-hidden flex flex-col md:flex-row">
        {/* Sección de Login */}
        <div
          onClick={() => setActiveForm('login')}
          className={`flex-1 p-8 transition-colors duration-500 cursor-pointer ${
            activeForm === 'login'
              ? 'bg-blue-300 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-blue-200'
          }`}
        >
          <h2 className="text-2xl font-semibold mb-6">Iniciar Sesión</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block mb-1 font-medium">Nombre</label>
              <div className="relative">
                <FaUserAlt className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Nombre"
                  className={`pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-200 focus:outline-none ${
                    activeForm === 'login' ? 'bg-blue-200 text-white placeholder-white' : ''
                  }`}
                  onChange={(e) => setLoginNombre(e.target.value)}
                  value={loginNombre}
                  required
                />
              </div>
            </div>
            <div>
              <label className="block mb-1 font-medium">Correo Electrónico</label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="email"
                  placeholder="Email"
                  className={`pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-200 focus:outline-none ${
                    activeForm === 'login' ? 'bg-blue-200 text-white placeholder-white' : ''
                  }`}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  value={loginEmail}
                  required
                />
              </div>
            </div>
            <div>
              <label className="block mb-1 font-medium">Contraseña</label>
              <div className="relative">
                <FaLock className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="password"
                  placeholder="Contraseña"
                  className={`pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-200 focus:outline-none ${
                    activeForm === 'login' ? 'bg-blue-200 text-white placeholder-white' : ''
                  }`}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  value={loginPassword}
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-white text-blue-300 py-2 rounded-lg font-semibold hover:bg-gray-50 transition-colors duration-300"
            >
              Iniciar Sesión
            </button>
          </form>
          <p className="mt-4 text-center">
            ¿No tienes una cuenta?{' '}
            <button
              onClick={() => setActiveForm('register')}
              className="text-blue-400 hover:text-blue-300 font-semibold"
            >
              Regístrate aquí
            </button>
          </p>
        </div>

        {/* Sección de Register */}
        <div
          onClick={() => setActiveForm('register')}
          className={`flex-1 p-8 transition-colors duration-500 cursor-pointer ${
            activeForm === 'register'
              ? 'bg-blue-300 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-blue-200'
          }`}
        >
          <h2 className="text-2xl font-semibold mb-6">Registrarse</h2>
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block mb-1 font-medium">Nombre</label>
              <div className="relative">
                <FaUserAlt className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Nombre"
                  className={`pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-200 focus:outline-none ${
                    activeForm === 'register' ? 'bg-blue-200 text-white placeholder-white' : ''
                  }`}
                  value={registerNombre}
                  onChange={(e) => setRegisterNombre(e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <label className="block mb-1 font-medium">Correo Electrónico</label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="email"
                  placeholder="Email"
                  className={`pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-200 focus:outline-none ${
                    activeForm === 'register' ? 'bg-blue-200 text-white placeholder-white' : ''
                  }`}
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <label className="block mb-1 font-medium">Dirección</label>
              <div className="relative">
                <FaHome className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Dirección"
                  className={`pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-200 focus:outline-none ${
                    activeForm === 'register' ? 'bg-blue-200 text-white placeholder-white' : ''
                  }`}
                  value={registerDireccion}
                  onChange={(e) => setRegisterDireccion(e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <label className="block mb-1 font-medium">Contraseña</label>
              <div className="relative">
                <FaLock className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="password"
                  placeholder="Contraseña"
                  className={`pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-200 focus:outline-none ${
                    activeForm === 'register' ? 'bg-blue-200 text-white placeholder-white' : ''
                  }`}
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
              <p className="text-gray-300 text-sm mt-1">La contraseña debe tener al menos 8 caracteres.</p>
            </div>
            <div>
              <label className="block mb-1 font-medium">Confirmar Contraseña</label>
              <div className="relative">
                <FaLock className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="password"
                  placeholder="Confirmar Contraseña"
                  className={`pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-200 focus:outline-none ${
                    activeForm === 'register' ? 'bg-blue-200 text-white placeholder-white' : ''
                  }`}
                  value={registerConfirmPassword}
                  onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-white text-blue-300 py-2 rounded-lg font-semibold hover:bg-gray-50 transition-colors duration-300"
            >
              Registrarse
            </button>
          </form>
          <p className="mt-4 text-center">
            ¿Ya tienes una cuenta?{' '}
            <button
              onClick={() => setActiveForm('login')}
              className="text-blue-400 hover:text-blue-300 font-semibold"
            >
              Inicia Sesión aquí
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Auth;
