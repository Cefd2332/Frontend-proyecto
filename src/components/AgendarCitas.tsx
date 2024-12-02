import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { FaCalendarAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';

interface Animal {
  id: number;
  nombre: string;
}

function AgendarCita() {
  const { id } = useParams<{ id: string }>();
  const [animalId, setAnimalId] = useState('');
  const [fechaCita, setFechaCita] = useState('');
  const [motivo, setMotivo] = useState('');
  const [veterinario, setVeterinario] = useState('');
  const [animales, setAnimales] = useState<Animal[]>([]);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnimales = async () => {
      try {
        const res = await axios.get<Animal[]>('http://localhost:8080/api/animales');
        setAnimales(res.data);
        if (id) {
          setAnimalId(id);
        }
      } catch (error) {
        console.error('Error al obtener animales', error);
        setError('Error al obtener la lista de animales.');
      }
    };
    fetchAnimales();
  }, [id]);

  const handleRegistrar = async () => {
    try {
      let fechaCitaISO = fechaCita;
      if (fechaCita && fechaCita.length === 16) {
        fechaCitaISO = `${fechaCita}:00`;
      }

      if (!animalId || !fechaCitaISO || !motivo || !veterinario) {
        toast.error('Por favor, complete todos los campos.');
        return;
      }

      await axios.post('http://localhost:8080/api/citas', {
        animalId: parseInt(animalId),
        fechaCita: fechaCitaISO,
        motivo,
        veterinario,
      });

      toast.success('Cita registrada exitosamente.');
      navigate('/calendario-citas');
    } catch (error) {
      console.error('Error al registrar cita', error);
      toast.error('Error al registrar la cita. Por favor, inténtelo nuevamente.');
    }
  };

  return (
    <Box
      sx={{
        maxWidth: '600px',
        margin: 'auto',
        padding: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.8)', // Fondo translúcido
        boxShadow: 3,
        borderRadius: 2,
      }}
    >
      <Box display="flex" alignItems="center" justifyContent="center" gap={1} mb={3}>
        <FaCalendarAlt style={{ color: '#6c757d', fontSize: '24px' }} />
        <Typography variant="h5" fontWeight="bold" color="#6c757d">
          Agendar Nueva Cita
        </Typography>
      </Box>

      {error && <Typography color="error" textAlign="center" mb={2}>{error}</Typography>}

      <Box display="flex" flexDirection="column" gap={3}>
        {/* Selección del animal */}
        <FormControl fullWidth>
          <InputLabel>Seleccione un animal</InputLabel>
          <Select
            value={animalId}
            onChange={(e) => setAnimalId(e.target.value)}
            required
          >
            <MenuItem value="">Seleccione un animal</MenuItem>
            {animales.map((animal) => (
              <MenuItem key={animal.id} value={animal.id}>
                {animal.nombre} - ID: {animal.id}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Fecha y hora de la cita */}
        <TextField
          type="datetime-local"
          label="Fecha y hora de la cita"
          InputLabelProps={{
            shrink: true, // Evita que el texto se superponga
          }}
          value={fechaCita}
          onChange={(e) => setFechaCita(e.target.value)}
          fullWidth
          required
        />

        {/* Motivo de la cita */}
        <TextField
          type="text"
          label="Motivo"
          placeholder="Motivo de la cita"
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          fullWidth
          required
        />

        {/* Veterinario */}
        <TextField
          type="text"
          label="Veterinario"
          placeholder="Nombre del veterinario"
          value={veterinario}
          onChange={(e) => setVeterinario(e.target.value)}
          fullWidth
          required
        />

        {/* Botón para agendar la cita */}
        <Button
          variant="contained"
          onClick={handleRegistrar}
          disabled={!animalId || !fechaCita || !motivo || !veterinario}
          fullWidth
          sx={{
            backgroundColor: '#0288D1',
            '&:hover': { backgroundColor: '#0277BD' },
          }}
        >
          Agendar Cita
        </Button>
      </Box>
    </Box>
  );
}

export default AgendarCita;
