import { Outlet, Link, useNavigate } from 'react-router-dom';
import {
  FaPaw,
  FaCalendarAlt,
  FaUsers,
  FaEnvelope,
  FaSignOutAlt,
  FaUserCircle,
} from 'react-icons/fa';
import { Box, Typography } from '@mui/material';

function Layout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/logout');
  };

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        background: 'linear-gradient(to bottom, #B3E5FC, #FFFFFF)', // Fondo principal degradado
      }}
    >
      {/* Menú lateral */}
      <Box
        sx={{
          width: '70px', // Ancho inicial del menú
          transition: 'width 0.3s ease-in-out', // Transición suave
          backgroundColor: 'rgba(255, 255, 255, 0.8)', // Fondo blanco translúcido
          borderRadius: '16px', // Bordes redondeados
          boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)', // Sombra para efecto flotante
          color: 'gray', // Color gris para iconos y textos
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          padding: 2,
          overflow: 'hidden', // Ocultar contenido excedente
          '&:hover': {
            width: '180px', // Ancho expandido al pasar el cursor
            // Mostrar todos los títulos cuando el menú se expande
            '& .menu-title': {
              opacity: 1,
            },
          },
          // Cursor de pointer para indicar interactividad
          cursor: 'pointer',
        }}
      >
        {/* Botón: Animales */}
        <Box
          component={Link}
          to="/dashboard"
          sx={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            paddingY: 1,
            textDecoration: 'none', // Sin subrayado
            color: 'inherit', // Heredar el color gris
            // Ya no es necesario cambiar la opacidad aquí
          }}
        >
          <FaPaw size={24} style={{ flexShrink: 0 }} /> {/* Icono siempre visible */}
          <Typography
            className="menu-title"
            sx={{
              marginLeft: 2,
              opacity: 0, // Oculto inicialmente
              transition: 'opacity 0.3s ease-in-out', // Transición suave
              whiteSpace: 'nowrap', // Prevenir corte de texto
              color: 'gray', // Color gris para el título
            }}
          >
            Animales
          </Typography>
        </Box>

        {/* Botón: Clientes */}
        <Box
          component={Link}
          to="/adoptantes"
          sx={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            paddingY: 1,
            textDecoration: 'none',
            color: 'inherit',
            // Ya no es necesario cambiar la opacidad aquí
          }}
        >
          <FaUsers size={24} style={{ flexShrink: 0 }} /> {/* Icono siempre visible */}
          <Typography
            className="menu-title"
            sx={{
              marginLeft: 2,
              opacity: 0, // Oculto inicialmente
              transition: 'opacity 0.3s ease-in-out', // Transición suave
              whiteSpace: 'nowrap', // Prevenir corte de texto
              color: 'gray', // Color gris para el título
            }}
          >
            Clientes
          </Typography>
        </Box>

        {/* Botón: Agendar Cita */}
        <Box
          component={Link}
          to="/agendar-cita"
          sx={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            paddingY: 1,
            textDecoration: 'none',
            color: 'inherit',
            // Ya no es necesario cambiar la opacidad aquí
          }}
        >
          <FaEnvelope size={24} style={{ flexShrink: 0 }} /> {/* Icono siempre visible */}
          <Typography
            className="menu-title"
            sx={{
              marginLeft: 2,
              opacity: 0, // Oculto inicialmente
              transition: 'opacity 0.3s ease-in-out', // Transición suave
              whiteSpace: 'nowrap', // Prevenir corte de texto
              color: 'gray', // Color gris para el título
            }}
          >
            Agendar Cita
          </Typography>
        </Box>

        {/* Botón: Calendario */}
        <Box
          component={Link}
          to="/calendario-citas"
          sx={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            paddingY: 1,
            textDecoration: 'none',
            color: 'inherit',
            // Ya no es necesario cambiar la opacidad aquí
          }}
        >
          <FaCalendarAlt size={24} style={{ flexShrink: 0 }} /> {/* Icono siempre visible */}
          <Typography
            className="menu-title"
            sx={{
              marginLeft: 2,
              opacity: 0, // Oculto inicialmente
              transition: 'opacity 0.3s ease-in-out', // Transición suave
              whiteSpace: 'nowrap', // Prevenir corte de texto
              color: 'gray', // Color gris para el título
            }}
          >
            Calendario
          </Typography>
        </Box>

        {/* Espaciador para empujar los siguientes botones hacia abajo */}
        <Box sx={{ flexGrow: 1 }} />

        {/* Botón: Perfil */}
        <Box
          component={Link}
          to="/perfil"
          sx={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            paddingY: 1,
            textDecoration: 'none',
            color: 'inherit',
            // Ya no es necesario cambiar la opacidad aquí
          }}
        >
          <FaUserCircle size={24} style={{ flexShrink: 0 }} /> {/* Icono siempre visible */}
          <Typography
            className="menu-title"
            sx={{
              marginLeft: 2,
              opacity: 0, // Oculto inicialmente
              transition: 'opacity 0.3s ease-in-out', // Transición suave
              whiteSpace: 'nowrap', // Prevenir corte de texto
              color: 'gray', // Color gris para el título
            }}
          >
            Perfil
          </Typography>
        </Box>

        {/* Botón: Cerrar Sesión */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            paddingY: 1,
            cursor: 'pointer',
            // Ya no es necesario cambiar la opacidad aquí
          }}
          onClick={handleLogout}
        >
          <FaSignOutAlt size={24} style={{ flexShrink: 0 }} /> {/* Icono siempre visible */}
          <Typography
            className="menu-title"
            sx={{
              marginLeft: 2,
              opacity: 0, // Oculto inicialmente
              transition: 'opacity 0.3s ease-in-out', // Transición suave
              whiteSpace: 'nowrap', // Prevenir corte de texto
              color: 'gray', // Color gris para el título
            }}
          >
            Cerrar Sesión
          </Typography>
        </Box>
      </Box>

      {/* Contenido principal */}
      <Box
        component="main"
        sx={{
          flex: 1,
          padding: 3,
          transition: 'margin-left 0.3s ease-in-out', // Transición suave al expandirse el menú
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}

export default Layout;
