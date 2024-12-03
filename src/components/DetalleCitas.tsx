import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import EditarCita from './EditarCitas';
import { FaEdit, FaTrash, FaEnvelope } from 'react-icons/fa';
import { toast } from 'react-toastify';
import {
  Box,
  Button,
  Typography,
  Paper,
  Grid,
  Chip,
  Fade,
  Grow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import api from '../api/axios';

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
  const [openConfirmDialog, setOpenConfirmDialog] = useState<boolean>(false);

  useEffect(() => {
    const fetchCita = async () => {
      try {
        const resCita = await api.get(`/citas/${id}`);
        const citaData: Cita = resCita.data as Cita;
        setCita(citaData);

        const resAnimal = await api.get(`/animales/${citaData.animalId}`);
        const animalData: Animal = resAnimal.data as Animal;
        setAnimal(animalData);

        if (animalData.adoptanteId) {
          const resAdoptante = await api.get(`/adoptantes/${animalData.adoptanteId}`);
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
      await api.delete(`/citas/${id}`);
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
    setOpenConfirmDialog(true);
  };

  const handleCloseConfirmDialog = () => {
    setOpenConfirmDialog(false);
  };

  const handleConfirmarEliminarCita = () => {
    setOpenConfirmDialog(false);
    handleEliminarCita();
  };

  // Función para obtener color del estado
  const getEstadoColor = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'pendiente':
        return 'warning';
      case 'realizado':
        return 'success';
      case 'cancelada':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Fade in={true}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
          <Typography variant="h6" color="textSecondary">
            Cargando detalles de la cita...
          </Typography>
        </Box>
      </Fade>
    );
  }

  if (error) {
    return (
      <Fade in={true}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
          <Typography variant="h6" color="error">
            {error}
          </Typography>
        </Box>
      </Fade>
    );
  }

  if (!cita) {
    return (
      <Fade in={true}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
          <Typography variant="h6" color="textSecondary">
            No se encontró la cita.
          </Typography>
        </Box>
      </Fade>
    );
  }

  return (
    <Fade in={true}>
      <Box
        sx={{
          maxWidth: '900px',
          margin: 'auto',
          padding: 4,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: 2,
          boxShadow: 3,
          transition: 'all 0.3s ease-in-out',
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="center" mb={3}>
          <FaEnvelope style={{ color: '#0288D1', fontSize: '30px', marginRight: '8px' }} />
          <Typography variant="h5" color="#0288D1" fontWeight="bold" align="center">
            Detalles de la Cita
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper elevation={1} sx={{ padding: 2, animation: 'fadeIn 1s' }}>
              <Typography variant="h6" color="#6c757d" gutterBottom>
                Información de la Cita
              </Typography>
              <Typography>
                <strong>ID:</strong> {cita.id}
              </Typography>
              <Typography>
                <strong>Fecha y Hora:</strong> {new Date(cita.fechaCita).toLocaleString()}
              </Typography>
              <Typography>
                <strong>Motivo:</strong> {cita.motivo}
              </Typography>
              <Typography>
                <strong>Veterinario:</strong> {cita.veterinario}
              </Typography>
              <Typography>
                <strong>Estado:</strong>{' '}
                <Chip
                  label={cita.estado}
                  color={getEstadoColor(cita.estado)}
                  variant="outlined"
                />
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper elevation={1} sx={{ padding: 2, animation: 'fadeIn 1s' }}>
              <Typography variant="h6" color="#6c757d" gutterBottom>
                Información del Animal
              </Typography>
              <Typography>
                <strong>Nombre:</strong> {animal?.nombre || 'Sin nombre'}
              </Typography>
              <Typography>
                <strong>Especie:</strong> {animal?.especie || 'Desconocida'}
              </Typography>
              <Typography>
                <strong>Edad:</strong> {animal?.edad || 'Desconocida'} {animal?.unidadEdad || ''}
              </Typography>
              <Typography>
                <strong>Género:</strong> {animal?.genero || 'Desconocido'}
              </Typography>
              <Typography>
                <strong>Estado de Salud:</strong> {animal?.estadoSalud || 'Desconocido'}
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper elevation={1} sx={{ padding: 2, animation: 'fadeIn 1s' }}>
              <Typography variant="h6" color="#6c757d" gutterBottom>
                Información del Cliente
              </Typography>
              {adoptante ? (
                <Typography>
                  <strong>Nombre:</strong>{' '}
                  <RouterLink
                    to={`/perfil-adoptante/${adoptante.id}`}
                    style={{ textDecoration: 'none', color: '#0288D1' }}
                  >
                    {adoptante.nombre}
                  </RouterLink>
                </Typography>
              ) : (
                <Typography color="textSecondary">
                  Este animal aún no ha sido adoptado.
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>

        <Box mt={4} display="flex" justifyContent="space-between" flexWrap="wrap" gap={2}>
          <Grow in={true} timeout={1000}>
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
          </Grow>
          <Grow in={true} timeout={1500}>
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
          </Grow>
        </Box>

        {/* Diálogo de Confirmación para Eliminar */}
        <Dialog open={openConfirmDialog} onClose={handleCloseConfirmDialog}>
          <DialogTitle>Confirmar Eliminación</DialogTitle>
          <DialogContent>
            <Typography>
              ¿Estás seguro de que deseas eliminar esta cita? Esta acción no se puede deshacer.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseConfirmDialog} color="secondary">
              Cancelar
            </Button>
            <Button onClick={handleConfirmarEliminarCita} variant="contained" color="error">
              Eliminar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Componente para Editar Cita */}
        {isEditing && (
          <EditarCita
            cita={cita}
            onActualizar={handleActualizarCita}
            onCancelar={handleCancelarEdicion}
          />
        )}
      </Box>
    </Fade>
  );
};

export default DetallesCita;