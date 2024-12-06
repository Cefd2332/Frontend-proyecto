// src/components/Perfil.tsx

import { useState, useEffect } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { FaUser } from 'react-icons/fa';
import { UsuarioResponseDto } from '../types/UsuarioResponseDto';

function Perfil() {
  const [activeTab, setActiveTab] = useState<'perfil' | null>('perfil');
  const [profile, setProfile] = useState<UsuarioResponseDto | null>(null);
  const [formValues, setFormValues] = useState({
    nombre: '',
    email: '',
    direccion: '',
  });

  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        if (!userId) {
          toast.error('No se pudo encontrar el ID del usuario.');
          return;
        }

        const res = await api.get<UsuarioResponseDto>(`/usuarios/${userId}`);
        const data = res.data;

        setProfile(data);
        setFormValues({
          nombre: data.nombre,
          email: data.email,
          direccion: data.direccion,
        });
      } catch (error: any) {
        toast.error(
          error.response?.data?.message || 'Error al cargar los datos del perfil.'
        );
      }
    };

    fetchPerfil();
  }, [userId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  };

  const handleActualizarPerfil = async () => {
    try {
      if (!formValues.nombre || !formValues.email || !formValues.direccion) {
        toast.error('Por favor, completa todos los campos.');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formValues.email)) {
        toast.error('Por favor, ingresa un email válido.');
        return;
      }

      if (!userId) {
        toast.error('No se pudo encontrar el ID del usuario.');
        return;
      }

      const formData = new FormData();
      formData.append('nombre', formValues.nombre);
      formData.append('email', formValues.email);
      formData.append('direccion', formValues.direccion);

      const res = await api.put(`/usuarios/perfil?userId=${userId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = res.data as UsuarioResponseDto;
      setProfile(data);
      setFormValues({
        nombre: data.nombre,
        email: data.email,
        direccion: data.direccion,
      });
      toast.success('Perfil actualizado correctamente.');
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Error al actualizar el perfil.'
      );
    }
  };

  if (!profile)
    return <p className="text-gray-600 text-center mt-6">Cargando perfil...</p>;

  return (
    <div className="p-8 bg-white shadow-lg rounded-lg max-w-4xl mx-auto mt-6">
      <h1 className="text-3xl font-bold text-gray-600 mb-6 flex items-center space-x-2">
        <FaUser className="text-gray-600" />
        <span>Perfil</span>
      </h1>

      <div className="flex space-x-4 border-b mb-6">
        <button
          className={`py-2 px-4 ${
            activeTab === 'perfil'
              ? 'bg-[#0288D1] text-white'
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          } rounded flex items-center space-x-2 transition-colors duration-300`}
          onClick={() => setActiveTab('perfil')}
        >
          <FaUser />
          <span>Información del Perfil</span>
        </button>
      </div>

      {activeTab === 'perfil' && (
        <div>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Editar Información Actual
          </h2>
          <div className="flex flex-col space-y-4">
            <input
              type="text"
              name="nombre"
              value={formValues.nombre}
              placeholder="Nombre"
              onChange={handleInputChange}
              className="p-3 border rounded w-full focus:ring-2 focus:ring-[#0288D1] focus:outline-none"
            />
            <input
              type="email"
              name="email"
              value={formValues.email}
              placeholder="Email"
              onChange={handleInputChange}
              className="p-3 border rounded w-full focus:ring-2 focus:ring-[#0288D1] focus:outline-none"
            />
            <input
              type="text"
              name="direccion"
              value={formValues.direccion}
              placeholder="Dirección"
              onChange={handleInputChange}
              className="p-3 border rounded w-full focus:ring-2 focus:ring-[#0288D1] focus:outline-none"
            />
            <button
              onClick={handleActualizarPerfil}
              className="w-full py-3 px-4 bg-[#0288D1] text-white rounded hover:bg-[#0277BD] transition-colors duration-300"
            >
              Actualizar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Perfil;
