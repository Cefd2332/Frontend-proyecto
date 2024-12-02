import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { parseISO, format } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { saveAs } from 'file-saver';
import { Box, Button, Typography, TextField, Select, MenuItem, List, ListItem, ListItemText } from '@mui/material';
import { FaFilePdf, FaFileExcel } from 'react-icons/fa';

interface Vacuna {
  id: number;
  nombre: string;
  fechaAplicacion: string;
  animalId: number;
}

function VacunasAnimal() {
  const { id } = useParams<{ id: string }>();
  const [vacunas, setVacunas] = useState<Vacuna[]>([]);
  const [nombreSeleccionado, setNombreSeleccionado] = useState('Vacuna Común');
  const [nombrePersonalizado, setNombrePersonalizado] = useState('');
  const [fechaAplicacion, setFechaAplicacion] = useState('');
  const [loading, setLoading] = useState<boolean>(false);
  const [agregando, setAgregando] = useState<boolean>(false);
  const [eliminando, setEliminando] = useState<number | null>(null);

  const API_BASE_URL = 'http://localhost:8080/api';

  useEffect(() => {
    const fetchVacunas = async () => {
      setLoading(true);
      try {
        if (!id || isNaN(Number(id))) throw new Error('ID de animal inválido.');
        const res = await axios.get<Vacuna[]>(`${API_BASE_URL}/vacunas/animal/${id}`);
        setVacunas(res.data);
      } catch (error) {
        toast.error('Error al obtener las vacunas.');
      } finally {
        setLoading(false);
      }
    };
    fetchVacunas();
  }, [id]);

  useEffect(() => {
    const hoy = new Date().toISOString().split('T')[0];
    setFechaAplicacion(hoy);
  }, []);

  const handleAgregarVacuna = async () => {
    if (
      !nombreSeleccionado ||
      (nombreSeleccionado === 'Otra' && !nombrePersonalizado.trim()) ||
      !fechaAplicacion
    ) {
      toast.error('Por favor, complete todos los campos.');
      return;
    }

    const fechaSeleccionada = new Date(fechaAplicacion);
    const ahora = new Date();
    ahora.setHours(0, 0, 0, 0);
    fechaSeleccionada.setHours(0, 0, 0, 0);

    if (fechaSeleccionada > ahora) {
      toast.error('La fecha de aplicación no puede ser una fecha futura.');
      return;
    }

    setAgregando(true);
    try {
      const nombreFinal = nombreSeleccionado === 'Otra' ? nombrePersonalizado.trim() : nombreSeleccionado;

      const nuevaVacuna = {
        nombre: nombreFinal,
        fechaAplicacion,
        animalId: parseInt(id!, 10),
      };

      const res = await axios.post<Vacuna>(`${API_BASE_URL}/vacunas`, nuevaVacuna);
      setVacunas([...vacunas, res.data]);
      setNombreSeleccionado('Vacuna Común');
      setNombrePersonalizado('');
      setFechaAplicacion(new Date().toISOString().split('T')[0]);
      toast.success('Vacuna agregada exitosamente.');
    } catch {
      toast.error('Error al agregar la vacuna.');
    } finally {
      setAgregando(false);
    }
  };

  const handleEliminarVacuna = async (idVacuna: number) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta vacuna?')) return;
    setEliminando(idVacuna);
    try {
      await axios.delete(`${API_BASE_URL}/vacunas/${idVacuna}`);
      setVacunas(vacunas.filter((vacuna) => vacuna.id !== idVacuna));
      toast.success('Vacuna eliminada exitosamente.');
    } catch {
      toast.error('Error al eliminar la vacuna.');
    } finally {
      setEliminando(null);
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Lista de Vacunas', 10, 10);
    autoTable(doc, {
      head: [['Fecha de Aplicación', 'Nombre']],
      body: vacunas.map((vacuna) => [
        format(parseISO(vacuna.fechaAplicacion), 'dd/MM/yyyy'),
        vacuna.nombre,
      ]),
    });
    doc.save('Vacunas_Animal.pdf');
  };

  const exportToExcel = () => {
    let content = 'Fecha de Aplicación,Nombre\n';
    vacunas.forEach((vacuna) => {
      content += `${format(parseISO(vacuna.fechaAplicacion), 'dd/MM/yyyy')},${vacuna.nombre}\n`;
    });
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'Vacunas_Animal.csv');
  };

  const opcionesNombre = ['Vacuna Común', 'Vacuna Triple Viral', 'Vacuna Anti-Rabia', 'Otra'];

  return (
    <Box
      sx={{
        maxWidth: '800px',
        margin: 'auto',
        padding: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        boxShadow: 3,
        borderRadius: 2,
      }}
    >
      <Typography
        variant="h5"
        fontWeight="bold"
        color="#6c757d"
        align="center"
        sx={{ mb: 3 }}
      >
        Vacunas del Animal
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<FaFilePdf />}
          sx={{
            backgroundColor: '#D32F2F',
            color: '#fff',
            '&:hover': { backgroundColor: '#B71C1C' },
          }}
          onClick={exportToPDF}
        >
          Exportar a PDF
        </Button>
        <Button
          variant="contained"
          startIcon={<FaFileExcel />}
          sx={{
            backgroundColor: '#4CAF50',
            color: '#fff',
            '&:hover': { backgroundColor: '#388E3C' },
          }}
          onClick={exportToExcel}
        >
          Exportar a Excel
        </Button>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" color="#6c757d" fontWeight="bold" sx={{ mb: 2 }}>
          Agregar Nueva Vacuna
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Select
            value={nombreSeleccionado}
            onChange={(e) => setNombreSeleccionado(e.target.value)}
            fullWidth
          >
            {opcionesNombre.map((opcion) => (
              <MenuItem key={opcion} value={opcion}>
                {opcion}
              </MenuItem>
            ))}
          </Select>
          {nombreSeleccionado === 'Otra' && (
            <TextField
              placeholder="Nombre Personalizado"
              value={nombrePersonalizado}
              onChange={(e) => setNombrePersonalizado(e.target.value)}
              fullWidth
            />
          )}
          <TextField
            type="date"
            value={fechaAplicacion}
            onChange={(e) => setFechaAplicacion(e.target.value)}
            fullWidth
          />
          <Button
            variant="contained"
            sx={{
              backgroundColor: '#0288D1',
              color: '#fff',
              '&:hover': { backgroundColor: '#0277BD' },
            }}
            onClick={handleAgregarVacuna}
            disabled={agregando}
          >
            {agregando ? 'Agregando...' : 'Agregar Vacuna'}
          </Button>
        </Box>
      </Box>

      <Box>
        <Typography variant="h6" color="#6c757d" fontWeight="bold" sx={{ mb: 2 }}>
          Lista de Vacunas
        </Typography>
        {vacunas.length === 0 ? (
          <Typography align="center" color="textSecondary">
            No hay vacunas registradas para este animal.
          </Typography>
        ) : (
          <List>
            {vacunas.map((vacuna) => (
              <ListItem
                key={vacuna.id}
                sx={{
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  marginBottom: '8px',
                  padding: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <ListItemText
                  primary={`Nombre: ${vacuna.nombre}`}
                  secondary={`Fecha de Aplicación: ${format(parseISO(vacuna.fechaAplicacion), 'dd/MM/yyyy')}`}
                />
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => handleEliminarVacuna(vacuna.id)}
                  disabled={eliminando === vacuna.id}
                >
                  {eliminando === vacuna.id ? 'Eliminando...' : 'Eliminar'}
                </Button>
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Box>
  );
}

export default VacunasAnimal;
