import { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, momentLocalizer, Event as CalendarEvent } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useNavigate } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import { FaCalendarAlt } from 'react-icons/fa';

moment.locale('es');
const localizer = momentLocalizer(moment);

interface Adoptante {
  id: number;
  nombre: string;
}

interface Animal {
  id: number;
  nombre: string;
  adoptante: Adoptante;
}

interface Cita {
  id: number;
  animalId: number;
  fechaCita: string;
  motivo: string;
  veterinario: string;
  animal: Animal;
}

function CalendarioCitas() {
  const [eventos, setEventos] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCitas = async () => {
      try {
        const res = await axios.get('http://localhost:8080/api/citas');
        if (Array.isArray(res.data)) {
          const eventosCitas: CalendarEvent[] = res.data.map((cita: Cita) => {
            const startDate = new Date(cita.fechaCita);
            const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
            const nombreUsuario = cita.animal?.adoptante?.nombre || 'Cita';
            return {
              id: cita.id,
              title: `${nombreUsuario} - ${cita.motivo}`,
              start: startDate,
              end: endDate,
              resource: cita,
            };
          });
          setEventos(eventosCitas);
        } else {
          setError('Error al obtener citas: respuesta inválida del servidor.');
        }
      } catch (error) {
        setError('Error al obtener citas. Por favor, intenta nuevamente.');
      } finally {
        setLoading(false);
      }
    };
    fetchCitas();
  }, []);

  const handleSelectEvent = (event: CalendarEvent) => {
    const citaId = (event as any).id;
    navigate(`/detalles-cita/${citaId}`);
  };

  if (loading) {
    return <Typography color="#6c757d" align="center" mt={3}>Cargando citas...</Typography>;
  }

  if (error) {
    return <Typography color="error" align="center" mt={3}>{error}</Typography>;
  }

  return (
    <Box
      sx={{
        maxWidth: '1200px',
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
          Calendario de Citas
        </Typography>
      </Box>

      <Calendar
        localizer={localizer}
        events={eventos}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
        messages={{
          next: 'Sig.',
          previous: 'Ant.',
          today: 'Hoy',
          month: 'Mes',
          week: 'Semana',
          day: 'Día',
          agenda: 'Agenda',
          date: 'Fecha',
          time: 'Hora',
          event: 'Evento',
          showMore: (total) => `+ Ver más (${total})`,
        }}
        onSelectEvent={handleSelectEvent}
      />
    </Box>
  );
}

export default CalendarioCitas;
