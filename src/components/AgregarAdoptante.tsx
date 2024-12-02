import { useState } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Box,
  Button,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add'; // Ícono de agregar

function AgregarAdoptante() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [direccion, setDireccion] = useState('');
  const [telefono, setTelefono] = useState('');
  const navigate = useNavigate();

  const handleAgregar = async () => {
    // Validar formato del email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Por favor, ingresa un correo electrónico válido.');
      return;
    }

    try {
      await api.post('/adoptantes', {
        nombre,
        email,
        direccion,
        telefono,
      });
      toast.success('Cliente agregado exitosamente.');
      navigate('/adoptantes');
    } catch (error) {
      console.error('Error al agregar Cliente', error);
      toast.error('Error al agregar cliente. Por favor, intenta nuevamente.');
    }
  };

  return (
    <Box
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
      {/* Título del formulario */}
      <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
        <Typography variant="h5" fontWeight="bold" sx={{ color: '#6C757D' }}>
          Agregar Cliente
        </Typography>
        <AddIcon sx={{ color: '#6C757D', fontSize: '32px' }} />
      </Box>

      {/* Campo: Nombre */}
      <TextField
        label="Nombre"
        variant="outlined"
        fullWidth
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        required
      />

      {/* Campo: Email */}
      <TextField
        label="Email"
        type="email"
        variant="outlined"
        fullWidth
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      {/* Campo: Dirección */}
      <TextField
        label="Dirección"
        variant="outlined"
        fullWidth
        value={direccion}
        onChange={(e) => setDireccion(e.target.value)}
        required
      />

      {/* Campo: Teléfono */}
      <TextField
        label="Teléfono"
        type="text"
        variant="outlined"
        fullWidth
        value={telefono}
        onChange={(e) => setTelefono(e.target.value)}
        required
      />

      {/* Botón para agregar */}
      <Button
        variant="contained"
        fullWidth
        sx={{
          backgroundColor: '#0288D1', // Azul consistente con el diseño
          color: '#fff',
          '&:hover': {
            backgroundColor: '#0277BD',
          },
        }}
        onClick={handleAgregar}
      >
        Agregar Cliente
      </Button>
    </Box>
  );
}

export default AgregarAdoptante;
