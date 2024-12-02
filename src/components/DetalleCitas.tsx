import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import EditarCita from './EditarCitas';
import { FaEdit, FaTrash, FaEnvelope } from 'react-icons/fa';
import { toast } from 'react-toastify';
import {
  Box,
  Button,
  Typography,
  Paper,
  Grid,
} from '@mui/material';

interface Adoptante {
  id: number;
  nombre: string;
}

interface Animal {
  id: number;
  nombre: string;
  especie: string;
  edad: number;
  unidadEdad: 'años' | 'meses';
  genero: 'MACHO' | 'HEMBRA' | null;
  estadoSalud: string;
  adoptanteId?: number;
}

interface Cita {
  id: number;
  fechaCita: string;
  motivo: string;
  veterinario: string;
  estado: string;
  animalId: number;
}

const DetallesCita = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [cita, setCita] = useState<Cita | null>(null);
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [adoptante, setAdoptante] = useState<Adoptante | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  useEffect(() => {
    const fetchCita = async () => {
      try {
        const resCita = await axios.get(`http://localhost:8080/api/citas/${id}`);
        const citaData: Cita = resCita.data as Cita;
        setCita(citaData);

        const resAnimal = await axios.get(`http://localhost:8080/api/animales/${citaData.animalId}`);
        const animalData: Animal = resAnimal.data as Animal;
        setAnimal(animalData);

        if (animalData.adoptanteId) {
          const resAdoptante = await axios.get(`http://localhost:8080/api/adoptantes/${animalData.adoptanteId}`);
          const adoptanteData: Adoptante = resAdoptante.data as Adoptante;
          setAdoptante(adoptanteData);
        }
      } catch (error) {
        console.error('Error al obtener los detalles:', error);
        setError('Error al obtener los detalles. Por favor, intenta nuevamente.');
        toast.error('Error al obtener los detalles. Por favor, intenta nuevamente.');
      } finally {
        setLoading(false);
      }
    };
    fetchCita();
  }, [id]);

  const handleEliminarCita = async () => {
    try {
      await axios.delete(`http://localhost:8080/api/citas/${id}`);
      toast.success('Cita eliminada exitosamente.');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error al eliminar la cita:', error);
      setError('Error al eliminar la cita. Por favor, intenta nuevamente.');
      toast.error('Error al eliminar la cita. Por favor, intenta nuevamente.');
    }
  };

  const handleEditarCita = () => {
    setIsEditing(true);
  };

  const handleActualizarCita = (citaActualizada: Cita) => {
    setCita(citaActualizada);
    setIsEditing(false);
    toast.success('Cita actualizada correctamente.');
  };

  const handleCancelarEdicion = () => {
    setIsEditing(false);
  };

  const handleConfirmarEliminar = () => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta cita? Esta acción no se puede deshacer.')) {
      handleEliminarCita();
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography variant="h6" color="textSecondary">
          Cargando detalles de la cita...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  if (!cita) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography variant="h6" color="textSecondary">
          No se encontró la cita.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        maxWidth: '900px',
        margin: 'auto',
        padding: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 2,
        boxShadow: 3,
      }}
    >
      <Box display="flex" alignItems="center" justifyContent="center" mb={3}>
        <FaEnvelope style={{ color: '#6c757d', fontSize: '30px', marginRight: '8px' }} />
        <Typography variant="h5" color="#6c757d" fontWeight="bold" align="center">
          Detalles de la Cita
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={1} sx={{ padding: 2 }}>
            <Typography variant="h6" color="#6c757d" gutterBottom>
              Información de la Cita
            </Typography>
            <Typography><strong>ID:</strong> {cita.id}</Typography>
            <Typography><strong>Fecha y Hora:</strong> {new Date(cita.fechaCita).toLocaleString()}</Typography>
            <Typography><strong>Motivo:</strong> {cita.motivo}</Typography>
            <Typography><strong>Veterinario:</strong> {cita.veterinario}</Typography>
            <Typography><strong>Estado:</strong> {cita.estado}</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={1} sx={{ padding: 2 }}>
            <Typography variant="h6" color="#6c757d" gutterBottom>
              Información del Animal
            </Typography>
            <Typography><strong>Nombre:</strong> {animal?.nombre || 'Sin nombre'}</Typography>
            <Typography><strong>Especie:</strong> {animal?.especie || 'Desconocida'}</Typography>
            <Typography>
              <strong>Edad:</strong> {animal?.edad || 'Desconocida'} {animal?.unidadEdad || ''}
            </Typography>
            <Typography><strong>Género:</strong> {animal?.genero || 'Desconocido'}</Typography>
            <Typography><strong>Estado de Salud:</strong> {animal?.estadoSalud || 'Desconocido'}</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper elevation={1} sx={{ padding: 2 }}>
            <Typography variant="h6" color="#6c757d" gutterBottom>
              Información del Cliente
            </Typography>
            {adoptante ? (
              <Typography><strong>Nombre:</strong> {adoptante.nombre}</Typography>
            ) : (
              <Typography color="textSecondary">Este animal aún no ha sido adoptado.</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Box mt={4} display="flex" justifyContent="space-between">
        <Button
          variant="contained"
          sx={{
            backgroundColor: '#0288D1',
            color: '#fff',
            '&:hover': { backgroundColor: '#0277BD' },
          }}
          onClick={handleEditarCita}
          startIcon={<FaEdit />}
        >
          Editar Cita
        </Button>
        <Button
          variant="contained"
          sx={{
            backgroundColor: '#D32F2F',
            color: '#fff',
            '&:hover': { backgroundColor: '#B71C1C' },
          }}
          onClick={handleConfirmarEliminar}
          startIcon={<FaTrash />}
        >
          Eliminar Cita
        </Button>
      </Box>

      {isEditing && (
        <EditarCita
          cita={cita}
          onActualizar={handleActualizarCita}
          onCancelar={handleCancelarEdicion}
        />
      )}
    </Box>
  );
};

export default DetallesCita;
