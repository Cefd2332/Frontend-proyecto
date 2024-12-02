import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaPaw } from 'react-icons/fa'; // Ícono de patita
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  FormControlLabel,
  Select,
  MenuItem,
  TextField,
  Typography,
  InputLabel,
} from '@mui/material';

function RegisterAnimal() {
  const [nombre, setNombre] = useState('');
  const [especie, setEspecie] = useState('');
  const [edad, setEdad] = useState<number | ''>('');
  const [unidadEdad, setUnidadEdad] = useState<'meses' | 'años'>('años');
  const [estadoSalud, setEstadoSalud] = useState('');
  const [genero, setGenero] = useState<'MACHO' | 'HEMBRA' | ''>('');
  const [adoptanteId, setAdoptanteId] = useState('');
  const [adoptantes, setAdoptantes] = useState<{ id: string; nombre: string }[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdoptantes = async () => {
      try {
        const res = await api.get<{ id: string; nombre: string }[]>('/adoptantes');
        setAdoptantes(res.data);
      } catch (error) {
        console.error('Error al obtener Clientes', error);
        toast.error('Error al obtener la lista de Clientes. Intente nuevamente.');
      }
    };

    fetchAdoptantes();
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const animalData = {
        nombre,
        especie,
        edad,
        unidadEdad,
        estadoSalud,
        genero,
        adoptanteId,
      };

      await api.post('/animales', animalData);
      toast.success('Animal registrado exitosamente.');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error al registrar animal', error.response?.data || error.message);
      toast.error('Error al registrar el animal. Intente nuevamente.');
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleRegister}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        maxWidth: '600px',
        margin: 'auto',
        padding: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.8)', // Fondo blanco translúcido
        boxShadow: 3,
        borderRadius: 2,
      }}
    >
      <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
        <FaPaw style={{ color: '#6C757D', fontSize: '24px' }} /> {/* Color gris del ícono */}
        <Typography variant="h5" fontWeight="bold" sx={{ color: '#6C757D' }}>
          Registrar Nuevo Animal
        </Typography>
      </Box>

      <TextField
        label="Nombre del Animal"
        variant="outlined"
        fullWidth
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        required
      />

      <TextField
        label="Especie"
        variant="outlined"
        fullWidth
        value={especie}
        onChange={(e) => setEspecie(e.target.value)}
        required
      />

      <Box>
        <FormLabel>Edad</FormLabel>
        <Box display="flex" gap={2} alignItems="center">
          <TextField
            type="number"
            placeholder="Edad"
            variant="outlined"
            value={edad}
            onChange={(e) => setEdad(Number(e.target.value))}
            fullWidth
            required
          />
          <RadioGroup
            row
            value={unidadEdad}
            onChange={(e) => setUnidadEdad(e.target.value as 'meses' | 'años')}
          >
            <FormControlLabel value="años" control={<Radio />} label="Años" />
            <FormControlLabel value="meses" control={<Radio />} label="Meses" />
          </RadioGroup>
        </Box>
      </Box>

      <FormControl component="fieldset">
        <FormLabel component="legend">Género</FormLabel>
        <RadioGroup
          row
          value={genero}
          onChange={(e) => setGenero(e.target.value as 'MACHO' | 'HEMBRA')}
        >
          <FormControlLabel value="MACHO" control={<Radio />} label="Macho" />
          <FormControlLabel value="HEMBRA" control={<Radio />} label="Hembra" />
        </RadioGroup>
      </FormControl>

      <FormControl fullWidth>
        <InputLabel>Estado de Salud</InputLabel>
        <Select
          value={estadoSalud}
          onChange={(e) => setEstadoSalud(e.target.value)}
          required
        >
          <MenuItem value="">Seleccione un estado de salud</MenuItem>
          <MenuItem value="SANO">Sano</MenuItem>
          <MenuItem value="EN_TRATAMIENTO">En Tratamiento</MenuItem>
          <MenuItem value="PERDIDO">Perdido</MenuItem>
          <MenuItem value="RECUPERANDOSE">Recuperándose</MenuItem>
        </Select>
      </FormControl>

      <FormControl fullWidth>
        <InputLabel>Cliente</InputLabel>
        <Select
          value={adoptanteId}
          onChange={(e) => setAdoptanteId(e.target.value)}
          required
        >
          <MenuItem value="">Seleccione un Cliente</MenuItem>
          {adoptantes.map((adoptante) => (
            <MenuItem key={adoptante.id} value={adoptante.id}>
              {adoptante.nombre} - {adoptante.id}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Button
        type="submit"
        variant="contained"
        fullWidth
        sx={{
          backgroundColor: '#0288D1',
          color: '#fff',
          '&:hover': {
            backgroundColor: '#0277BD',
          },
        }}
      >
        Registrar Animal
      </Button>
    </Box>
  );
}

export default RegisterAnimal;
