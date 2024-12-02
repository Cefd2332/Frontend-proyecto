// src/components/HistorialAnimal.tsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import api from '../api/axios';

interface Animal {
  id: number;
  nombre: string;
}

interface Cita {
  id: number;
  fechaCita: string;
  motivo: string;
  veterinario: string;
  estado: string;
}

interface Vacuna {
  id: number;
  nombre: string;
  fechaAplicacion: string;
}

function HistorialAnimal() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [citas, setCitas] = useState<Cita[]>([]);
  const [vacunas, setVacunas] = useState<Vacuna[]>([]);
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const API_BASE_URL = api ;

  useEffect(() => {
    const fetchHistorial = async () => {
      setLoading(true);
      try {
        if (!id) return;

        const [resCitas, resVacunas, resAnimal] = await Promise.all([
          axios.get<Cita[]>(`${API_BASE_URL}/citas/animal/${id}`),
          axios.get<Vacuna[]>(`${API_BASE_URL}/vacunas/animal/${id}`),
          axios.get<Animal>(`${API_BASE_URL}/animales/${id}`),
        ]);

        setCitas(resCitas.data);
        setVacunas(resVacunas.data);
        setAnimal(resAnimal.data);
      } catch (error) {
        console.error('Error al obtener el historial:', error);
        toast.error('Error al obtener el historial.');
      } finally {
        setLoading(false);
      }
    };

    fetchHistorial();
  }, [id]);

  const exportToPDF = () => {
    const doc = new jsPDF();

    doc.text(`Historial de ${animal?.nombre}`, 10, 10);

    // Agregar citas
    if (citas.length > 0) {
      doc.text('Citas Veterinarias:', 10, 20);
      autoTable(doc, {
        head: [['Fecha', 'Motivo', 'Veterinario', 'Estado']],
        body: citas.map((cita) => [
          new Date(cita.fechaCita).toLocaleDateString(),
          cita.motivo,
          cita.veterinario,
          cita.estado,
        ]),
        startY: 25,
      });
    }

    // Agregar vacunas
    if (vacunas.length > 0) {
      const startY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 10 : 30;
      doc.text('Vacunas:', 10, startY);
      autoTable(doc, {
        head: [['Fecha de Aplicación', 'Nombre']],
        body: vacunas.map((vacuna) => [
          new Date(vacuna.fechaAplicacion).toLocaleDateString(),
          vacuna.nombre,
        ]),
        startY: startY + 5,
      });
    }

    doc.save(`Historial_${animal?.nombre}.pdf`);
  };

  const exportToExcel = () => {
    let content = 'Fecha,Tipo,Descripción\n';

    // Agregar citas
    citas.forEach((cita) => {
      content += `${new Date(cita.fechaCita).toLocaleDateString()},Cita,${
        cita.motivo
      } - ${cita.veterinario} (${cita.estado})\n`;
    });

    // Agregar vacunas
    vacunas.forEach((vacuna) => {
      content += `${new Date(vacuna.fechaAplicacion).toLocaleDateString()},Vacuna,${
        vacuna.nombre
      }\n`;
    });

    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `Historial_${animal?.nombre}.csv`);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-gray-100 rounded-lg shadow-md">
      {loading ? (
        <p>Cargando historial...</p>
      ) : (
        <>
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              Historial de {animal?.nombre || 'Animal'}
            </h1>
            <button
              className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded mr-4"
              onClick={() => navigate(`/agendar-cita/${animal?.id}`)}
            >
              Agendar Cita
            </button>
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded mr-4"
              onClick={exportToPDF}
            >
              Exportar a PDF
            </button>
            <button
              className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded"
              onClick={exportToExcel}
            >
              Exportar a Excel
            </button>
          </div>

          {/* Listado de citas */}
          {citas.length > 0 && (
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">Citas Veterinarias</h2>
              <ul className="space-y-4">
                {citas.map((cita) => (
                  <li
                    key={cita.id}
                    className="border border-gray-300 p-4 rounded bg-white shadow-sm"
                  >
                    <p>
                      <strong>Fecha:</strong>{' '}
                      {new Date(cita.fechaCita).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>Motivo:</strong> {cita.motivo}
                    </p>
                    <p>
                      <strong>Veterinario:</strong> {cita.veterinario}
                    </p>
                    <p>
                      <strong>Estado:</strong> {cita.estado}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Listado de vacunas */}
          {vacunas.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">Vacunas</h2>
              <ul className="space-y-4">
                {vacunas.map((vacuna) => (
                  <li
                    key={vacuna.id}
                    className="border border-gray-300 p-4 rounded bg-white shadow-sm"
                  >
                    <p>
                      <strong>Fecha de Aplicación:</strong>{' '}
                      {new Date(vacuna.fechaAplicacion).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>Nombre:</strong> {vacuna.nombre}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default HistorialAnimal;
