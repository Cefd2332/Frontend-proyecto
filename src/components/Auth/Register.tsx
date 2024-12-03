import { useState } from 'react';
import api from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css';
import { FaUserAlt, FaEnvelope, FaHome, FaLock } from 'react-icons/fa';

function Register() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [direccion, setDireccion] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!validateEmail(email)) {
      toast.error('Por favor ingresa un correo válido.', {
        position: 'top-center',
        autoClose: 4000,
      });
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Las contraseñas no coinciden.', {
        position: 'top-center',
        autoClose: 4000,
      });
      return;
    }

    try {
      const response = await api.post('/auth/register', {
        nombre,
        email,
        direccion,
        password,
        confirmPassword,
      });

      // Verifica si la respuesta indica éxito
      if (response.status === 200 || response.status === 201) {
        toast.success('Registro exitoso. Por favor inicia sesión.', {
          position: 'top-center',
          autoClose: 3000,
        });

        navigate('/'); // Redirige al inicio de sesión
      } else {
        toast.error('Hubo un problema al registrar. Inténtalo nuevamente.', {
          position: 'top-center',
          autoClose: 4000,
        });
        console.error('Error al registrar:', response);
      }
    } catch (error) {
      console.error('Error al registrar:', error);

      // Muestra un mensaje de error genérico
      toast.error('Hubo un problema al registrar. Inténtalo nuevamente.', {
        position: 'top-center',
        autoClose: 4000,
      });
    }
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg border border-gray-200">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          <FaUserAlt className="inline-block text-blue-500 mr-2" /> Registrarse
        </h1>

        <div className="space-y-6">
          {/* Campo de nombre */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Nombre</label>
            <div className="relative">
              <FaUserAlt className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Nombre"
                className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Campo de dirección */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Dirección</label>
            <div className="relative">
              <FaHome className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Dirección"
                className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Campo de confirmación de contraseña */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Confirmar Contraseña</label>
            <div className="relative">
              <FaLock className="absolute left-3 top-3 text-gray-400" />
              <input
                type="password"
                placeholder="Confirmar Contraseña"
                className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Botón para registrarse */}
          <button
            className="w-full bg-blue-500 text-white py-3 rounded-lg font-bold hover:bg-blue-600 transition duration-300"
            onClick={handleRegister}
          >
            Registrarse
          </button>
        </div>
      </div>
    </div>
  );
}

export default Register;
