import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaEdit } from 'react-icons/fa';
import {
  Box,
  Button,
  Select,
  MenuItem,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
} from '@mui/material';

function EditAnimal() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [nombre, setNombre] = useState('');
  const [especie, setEspecie] = useState('');
  const [edad, setEdad] = useState<number | ''>('');
  const [unidadEdad, setUnidadEdad] = useState<'meses' | 'años'>('años');
  const [estadoSalud, setEstadoSalud] = useState('');
  const [genero, setGenero] = useState<'MACHO' | 'HEMBRA' | ''>(''); // Nuevo campo de género
  const [adoptanteId, setAdoptanteId] = useState('');
  const [adoptantes, setAdoptantes] = useState<{ id: string; nombre: string }[]>([]);

  const API_BASE_URL = 'http://localhost:8080/api';

  useEffect(() => {
    const fetchAnimalData = async () => {
      try {
        const res = await axios.get<{
          nombre: string;
          especie: string;
          edad: number;
          unidadEdad: 'meses' | 'años';
          estadoSalud: string;
          genero?: 'MACHO' | 'HEMBRA';
          adoptanteId?: string;
        }>(`${API_BASE_URL}/animales/${id}`);
        const animal = res.data;

        setNombre(animal.nombre);
        setEspecie(animal.especie);
        setEdad(animal.edad);
        setUnidadEdad(animal.unidadEdad);
        setEstadoSalud(animal.estadoSalud);
        setGenero(animal.genero || '');
        setAdoptanteId(animal.adoptanteId || '');
      } catch (error) {
        console.error('Error al cargar datos del animal:', error);
        toast.error('Error al cargar datos del animal.');
      }
    };

    const fetchAdoptantes = async () => {
      try {
        const res = await axios.get<{ id: string; nombre: string }[]>(`${API_BASE_URL}/adoptantes`);
        setAdoptantes(res.data);
      } catch (error) {
        console.error('Error al cargar Clientes:', error);
        toast.error('Error al cargar Clientes.');
      }
    };

    if (id) {
      fetchAnimalData();
      fetchAdoptantes();
    }
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const updatedAnimal = {
        nombre,
        especie,
        edad,
        unidadEdad,
        estadoSalud,
        genero,
        adoptanteId,
      };

      await axios.put(`${API_BASE_URL}/animales/${id}`, updatedAnimal);
      toast.success('Animal actualizado exitosamente.');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error al actualizar el animal:', error);
      toast.error('Error al actualizar el animal. Por favor, intente nuevamente.');
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleUpdate}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        maxWidth: '600px',
        margin: 'auto',
        padding: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        boxShadow: 3,
        borderRadius: 2,
      }}
    >
      <Box display="flex" alignItems="center" justifyContent="center" gap={1} mb={2}>
        <FaEdit style={{ color: '#6c757d', fontSize: '24px' }} />
        <Typography variant="h5" fontWeight="bold" color="#6c757d">
          Editar Animal
        </Typography>
      </Box>

      {/* Nombre del animal */}
      <TextField
        label="Nombre del Animal"
        variant="outlined"
        fullWidth
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        required
      />

      {/* Especie del animal */}
      <TextField
        label="Especie"
        variant="outlined"
        fullWidth
        value={especie}
        onChange={(e) => setEspecie(e.target.value)}
        required
      />

      {/* Edad del animal */}
      <Box>
        <Typography variant="subtitle1" color="#6c757d">
          Edad
        </Typography>
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

      {/* Género del animal */}
      <Box>
        <Typography variant="subtitle1" color="#6c757d">
          Género
        </Typography>
        <RadioGroup
          row
          value={genero}
          onChange={(e) => setGenero(e.target.value as 'MACHO' | 'HEMBRA')}
        >
          <FormControlLabel value="MACHO" control={<Radio />} label="Macho" />
          <FormControlLabel value="HEMBRA" control={<Radio />} label="Hembra" />
        </RadioGroup>
      </Box>

      {/* Estado de salud */}
      <Select
        value={estadoSalud}
        onChange={(e) => setEstadoSalud(e.target.value)}
        fullWidth
        required
      >
        <MenuItem value="">Seleccione un estado de salud</MenuItem>
        <MenuItem value="SANO">Sano</MenuItem>
        <MenuItem value="EN_TRATAMIENTO">En Tratamiento</MenuItem>
        <MenuItem value="PERDIDO">Perdido</MenuItem>
        <MenuItem value="RECUPERANDOSE">Recuperándose</MenuItem>
      </Select>

      {/* Adoptante */}
      <Select
        value={adoptanteId}
        onChange={(e) => setAdoptanteId(e.target.value)}
        fullWidth
      >
        <MenuItem value="">Seleccione un adoptante</MenuItem>
        {adoptantes.map((adoptante) => (
          <MenuItem key={adoptante.id} value={adoptante.id}>
            {adoptante.nombre} - {adoptante.id}
          </MenuItem>
        ))}
      </Select>

      {/* Botones */}
      <Box display="flex" justifyContent="space-between">
        <Button
          type="submit"
          variant="contained"
          sx={{
            backgroundColor: '#0288D1',
            color: '#fff',
            '&:hover': { backgroundColor: '#0277BD' },
          }}
        >
          Actualizar
        </Button>
        <Button
          type="button"
          variant="outlined"
          color="secondary"
          onClick={() => navigate('/dashboard')}
        >
          Cancelar
        </Button>
      </Box>
    </Box>
  );
}

export default EditAnimal;
