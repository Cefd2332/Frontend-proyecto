import { useState } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';

interface Cita {
  id: number;
  fechaCita: string;
  motivo: string;
  veterinario: string;
  estado: string;
  animalId: number;
}

interface EditarCitaProps {
  cita: Cita;
  onActualizar: (citaActualizada: Cita) => void;
  onCancelar: () => void;
}

function EditarCita({ cita, onActualizar, onCancelar }: EditarCitaProps) {
  const formatFechaCita = (fecha: string | null | undefined) => {
    if (!fecha) return '';
    const date = new Date(fecha);
    const tzOffset = date.getTimezoneOffset() * 60000;
    const localISOTime = new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
    return localISOTime;
  };

  const [fechaCita, setFechaCita] = useState<string>(formatFechaCita(cita.fechaCita));
  const [motivo, setMotivo] = useState<string>(cita.motivo || '');
  const [veterinario, setVeterinario] = useState<string>(cita.veterinario || '');
  const [estado, setEstado] = useState<string>(cita.estado || '');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleActualizar = async () => {
    if (!fechaCita || !motivo || !veterinario || !estado) {
      setError('Por favor, completa todos los campos.');
      return;
    }

    const selectedDate = new Date(fechaCita);
    const now = new Date();
    if (selectedDate < now) {
      setError('La fecha y hora de la cita no pueden ser en el pasado.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const updatedCita = {
        fechaCita: new Date(fechaCita).toISOString(),
        motivo,
        veterinario,
        estado,
      };

      const res = await api.put<Cita>(`/citas/${cita.id}`, updatedCita);
      onActualizar(res.data);
      toast.success('Cita actualizada exitosamente.');
    } catch (err: any) {
      console.error('Error al actualizar la cita:', err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
        toast.error(err.response.data.message);
      } else {
        setError('Error al actualizar la cita. Por favor, intenta nuevamente.');
        toast.error('Error al actualizar la cita. Por favor, intenta nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="mt-6 p-6 max-w-lg mx-auto bg-white shadow-lg rounded-lg"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: '8px',
      }}
    >
      <h3 className="text-2xl font-bold mb-6 text-gray-600 text-center">Editar Cita</h3>
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleActualizar();
        }}
      >
        {/* Fecha y hora */}
        <div className="mb-4">
          <label htmlFor="fechaCita" className="block text-gray-600 font-medium mb-1">
            Fecha y Hora:
          </label>
          <input
            id="fechaCita"
            type="datetime-local"
            value={fechaCita || ''}
            onChange={(e) => setFechaCita(e.target.value)}
            className="w-full p-3 border rounded focus:outline-none focus:ring focus:ring-blue-300"
            required
          />
        </div>

        {/* Motivo */}
        <div className="mb-4">
          <label htmlFor="motivo" className="block text-gray-600 font-medium mb-1">
            Motivo:
          </label>
          <input
            id="motivo"
            type="text"
            value={motivo || ''}
            onChange={(e) => setMotivo(e.target.value)}
            className="w-full p-3 border rounded focus:outline-none focus:ring focus:ring-blue-300"
            required
          />
        </div>

        {/* Veterinario */}
        <div className="mb-4">
          <label htmlFor="veterinario" className="block text-gray-600 font-medium mb-1">
            Veterinario:
          </label>
          <input
            id="veterinario"
            type="text"
            value={veterinario || ''}
            onChange={(e) => setVeterinario(e.target.value)}
            className="w-full p-3 border rounded focus:outline-none focus:ring focus:ring-blue-300"
            required
          />
        </div>

        {/* Estado */}
        <div className="mb-4">
          <label htmlFor="estado" className="block text-gray-600 font-medium mb-1">
            Estado:
          </label>
          <select
            id="estado"
            value={estado || ''}
            onChange={(e) => setEstado(e.target.value)}
            className="w-full p-3 border rounded focus:outline-none focus:ring focus:ring-blue-300"
            required
          >
            <option value="">-- Selecciona un estado --</option>
            <option value="PENDIENTE">PENDIENTE</option>
            <option value="REALIZADA">REALIZADA</option>
            <option value="CANCELADA">CANCELADA</option>
          </select>
        </div>

        {/* Botones */}
        <div className="flex space-x-4 justify-between">
          <button
            type="submit"
            className={`bg-[#0288D1] hover:bg-[#0277BD] text-white py-2 px-4 rounded ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={loading}
          >
            {loading ? 'Actualizando...' : 'Actualizar'}
          </button>
          <button
            type="button"
            onClick={onCancelar}
            className="bg-[#D32F2F] hover:bg-[#B71C1C] text-white py-2 px-4 rounded"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditarCita;
