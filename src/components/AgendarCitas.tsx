import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaCalendarAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import {
  Box,
  Button,
  TextField,
  Typography,
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Paper,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import api from '../api/axios';

interface Animal {
  id: number;
  nombre: string;
}

interface Cita {
  animalId: number;
  fechaCita: string;
  motivo: string;
  veterinario: string;
}

function AgendarCita() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [animales, setAnimales] = useState<Animal[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [openSummary, setOpenSummary] = useState<boolean>(false);
  const [citaData, setCitaData] = useState<Cita | null>(null);

  useEffect(() => {
    const fetchAnimales = async () => {
      try {
        const res = await api.get<Animal[]>('/animales');
        setAnimales(res.data);
        if (id) {
          setFieldValue('animalId', parseInt(id));
        }
      } catch (error) {
        console.error('Error al obtener animales', error);
        setError('Error al obtener la lista de animales.');
      }
    };
    fetchAnimales();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Definición del esquema de validación con Yup
  const validationSchema = Yup.object({
    animalId: Yup.number()
      .required('Seleccione un animal')
      .oneOf(animales.map((animal) => animal.id), 'Seleccione un animal válido'),
    fechaCita: Yup.string()
      .required('Seleccione la fecha y hora de la cita')
      .test('is-future', 'La fecha debe ser futura', (value) => {
        return value ? new Date(value) > new Date() : false;
      }),
    motivo: Yup.string()
      .required('Ingrese el motivo de la cita')
      .min(5, 'El motivo debe tener al menos 5 caracteres'),
    veterinario: Yup.string()
      .required('Ingrese el nombre del veterinario')
      .min(3, 'El nombre del veterinario debe tener al menos 3 caracteres'),
  });

  // Uso de Formik para manejar el formulario
  const formik = useFormik({
    initialValues: {
      animalId: '',
      fechaCita: '',
      motivo: '',
      veterinario: '',
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      // Guardar los datos para mostrar en el resumen
      setCitaData({
        ...values,
        animalId: parseInt(values.animalId),
      });
      setOpenSummary(true);
    },
  });

  const { values, errors, touched, handleChange, handleSubmit, setFieldValue } = formik;

  // Función para confirmar y enviar la cita
  const confirmarCita = async () => {
    if (!citaData) return;

    try {
      // Formatear la fecha a ISO si es necesario
      let fechaCitaISO = citaData.fechaCita;
      if (citaData.fechaCita && citaData.fechaCita.length === 16) {
        fechaCitaISO = `${citaData.fechaCita}:00`;
      }

      await api.post('/citas', {
        animalId: citaData.animalId,
        fechaCita: fechaCitaISO,
        motivo: citaData.motivo,
        veterinario: citaData.veterinario,
      });

      toast.success('Cita registrada exitosamente.');
      navigate('/calendario-citas');
    } catch (error) {
      console.error('Error al registrar cita', error);
      toast.error('Error al registrar la cita. Por favor, inténtelo nuevamente.');
    }
  };

  // Filtrar los animales según la búsqueda en Autocomplete
  const [animalInput, setAnimalInput] = useState('');

  const filteredAnimales = animales.filter((animal) =>
    animal.nombre.toLowerCase().includes(animalInput.toLowerCase())
  );

  return (
    <Box
      sx={{
        padding: 3,
        background: 'linear-gradient(to bottom, #B3E5FC, #FFFFFF)', // Gradiente original
        minHeight: '100vh',
      }}
    >
      <Paper
        sx={{
          maxWidth: '600px',
          margin: 'auto',
          padding: 4,
          backgroundColor: 'rgba(255, 255, 255, 0.95)', // Fondo ligeramente translúcido
          boxShadow: 3,
          borderRadius: 2,
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="center" gap={1} mb={3}>
          <FaCalendarAlt style={{ color: '#0288D1', fontSize: '24px' }} />
          <Typography variant="h5" fontWeight="bold" color="#0288D1">
            Agendar Nueva Cita
          </Typography>
        </Box>

        {error && (
          <Typography color="error" textAlign="center" mb={2}>
            {error}
          </Typography>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Selección del animal con Autocomplete */}
            <Grid item xs={12}>
              <Autocomplete
                options={filteredAnimales}
                getOptionLabel={(option) => `${option.nombre} - ID: ${option.id}`}
                filterSelectedOptions
                value={
                  animales.find((animal) => animal.id === parseInt(values.animalId)) || null
                }
                onChange={(_event, newValue) => {
                  setFieldValue('animalId', newValue ? newValue.id : '');
                }}
                onInputChange={(_event, newInputValue) => {
                  setAnimalInput(newInputValue);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Seleccione un animal"
                    variant="outlined"
                    required
                    error={touched.animalId && Boolean(errors.animalId)}
                    helperText={touched.animalId && errors.animalId}
                  />
                )}
              />
            </Grid>

            {/* Fecha y hora de la cita */}
            <Grid item xs={12}>
              <TextField
                type="datetime-local"
                label="Fecha y hora de la cita"
                InputLabelProps={{
                  shrink: true, // Evita que el texto se superponga
                }}
                name="fechaCita"
                value={values.fechaCita}
                onChange={handleChange}
                fullWidth
                required
                error={touched.fechaCita && Boolean(errors.fechaCita)}
                helperText={touched.fechaCita && errors.fechaCita}
              />
            </Grid>

            {/* Motivo de la cita */}
            <Grid item xs={12}>
              <TextField
                type="text"
                label="Motivo"
                placeholder="Motivo de la cita"
                name="motivo"
                value={values.motivo}
                onChange={handleChange}
                fullWidth
                required
                error={touched.motivo && Boolean(errors.motivo)}
                helperText={touched.motivo && errors.motivo}
              />
            </Grid>

            {/* Veterinario */}
            <Grid item xs={12}>
              <TextField
                type="text"
                label="Veterinario"
                placeholder="Nombre del veterinario"
                name="veterinario"
                value={values.veterinario}
                onChange={handleChange}
                fullWidth
                required
                error={touched.veterinario && Boolean(errors.veterinario)}
                helperText={touched.veterinario && errors.veterinario}
              />
            </Grid>

            {/* Botones */}
            <Grid item xs={12}>
              <Button
                variant="contained"
                type="submit"
                fullWidth
                sx={{
                  backgroundColor: '#0288D1',
                  '&:hover': { backgroundColor: '#0277BD' },
                }}
                startIcon={<FaCalendarAlt />}
                disabled={
                  !values.animalId ||
                  !values.fechaCita ||
                  !values.motivo ||
                  !values.veterinario ||
                  Object.keys(errors).length > 0
                }
              >
                Agendar Cita
              </Button>
            </Grid>
          </Grid>
        </form>

        {/* Diálogo de Resumen de la Cita */}
        <Dialog open={openSummary} onClose={() => setOpenSummary(false)}>
          <DialogTitle>Confirmar Cita</DialogTitle>
          <DialogContent dividers>
            {citaData && (
              <Box>
                <Typography variant="subtitle1">
                  <strong>Animal:</strong>{' '}
                  {animales.find((animal) => animal.id === citaData.animalId)?.nombre || 'N/A'}
                </Typography>
                <Typography variant="subtitle1">
                  <strong>Fecha y Hora:</strong> {new Date(citaData.fechaCita).toLocaleString()}
                </Typography>
                <Typography variant="subtitle1">
                  <strong>Motivo:</strong> {citaData.motivo}
                </Typography>
                <Typography variant="subtitle1">
                  <strong>Veterinario:</strong> {citaData.veterinario}
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenSummary(false)} color="secondary">
              Cancelar
            </Button>
            <Button onClick={confirmarCita} variant="contained" color="primary">
              Confirmar Cita
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
}

export default AgendarCita;
