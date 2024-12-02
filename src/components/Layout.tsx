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
      {/* Menú lateral flotante */}
      <Box
        sx={{
          position: 'fixed', // Fijo en la pantalla
          top: 16, // Separación desde la parte superior
          left: 16, // Separación desde la izquierda
          height: 'calc(100vh - 32px)', // Ajustar al alto de la pantalla con margen
          width: '70px', // Ancho inicial del menú
          maxWidth: '180px', // Límite del ancho expandido
          transition: 'width 0.3s ease-in-out', // Transición suave
          overflow: 'hidden', // Ocultar contenido excedente
          whiteSpace: 'nowrap', // Prevenir corte de texto
          '&:hover': {
            width: '180px', // Ancho expandido al pasar el cursor
          },
          backgroundColor: 'rgba(255, 255, 255, 0.8)', // Fondo blanco translúcido
          borderRadius: '16px', // Bordes redondeados
          boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)', // Sombra para efecto flotante
          color: 'gray', // Color gris para iconos y textos
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          padding: 2,
          '&:hover .menu-title': {
            opacity: 1, // Mostrar títulos al expandirse
          },
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
          }}
        >
          <FaPaw size={24} style={{ flexShrink: 0 }} /> {/* Icono siempre visible */}
          <Typography
            className="menu-title"
            sx={{
              marginLeft: 2,
              opacity: 0, // Oculto inicialmente
              transition: 'opacity 0.3s ease-in-out', // Transición suave
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
          }}
        >
          <FaUsers size={24} style={{ flexShrink: 0 }} /> {/* Icono siempre visible */}
          <Typography
            className="menu-title"
            sx={{
              marginLeft: 2,
              opacity: 0,
              transition: 'opacity 0.3s ease-in-out',
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
          }}
        >
          <FaEnvelope size={24} style={{ flexShrink: 0 }} /> {/* Icono siempre visible */}
          <Typography
            className="menu-title"
            sx={{
              marginLeft: 2,
              opacity: 0,
              transition: 'opacity 0.3s ease-in-out',
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
          }}
        >
          <FaCalendarAlt size={24} style={{ flexShrink: 0 }} /> {/* Icono siempre visible */}
          <Typography
            className="menu-title"
            sx={{
              marginLeft: 2,
              opacity: 0,
              transition: 'opacity 0.3s ease-in-out',
              color: 'gray', // Color gris para el título
            }}
          >
            Calendario
          </Typography>
        </Box>

        {/* Espaciador */}
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
          }}
        >
          <FaUserCircle size={24} style={{ flexShrink: 0 }} /> {/* Icono siempre visible */}
          <Typography
            className="menu-title"
            sx={{
              marginLeft: 2,
              opacity: 0,
              transition: 'opacity 0.3s ease-in-out',
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
          }}
          onClick={handleLogout}
        >
          <FaSignOutAlt size={24} style={{ flexShrink: 0 }} /> {/* Icono siempre visible */}
          <Typography
            className="menu-title"
            sx={{
              marginLeft: 2,
              opacity: 0,
              transition: 'opacity 0.3s ease-in-out',
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
          marginLeft: '80px', // Ajustar margen del contenido principal
          padding: 3,
          overflowY: 'auto', // Habilitar scroll solo en el contenido principal
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}

export default Layout;
