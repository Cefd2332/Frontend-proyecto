import { useState, useEffect, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  TableSortLabel,
  createTheme,
  ThemeProvider,
} from '@mui/material';
import { FaFilePdf, FaFileExcel } from 'react-icons/fa';
import api from '../api/axios'; // Asegúrate de que esta instancia tenga la URL base correcta

interface Adoptante {
  id: number;
  nombre: string;
  email: string;
  direccion: string;
  telefono: string;
}

type Order = 'asc' | 'desc';

// Función de comparación para ordenamiento
function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key
): (a: { [key in Key]: any }, b: { [key in Key]: any }) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort<T>(array: T[], comparator: (a: T, b: T) => number) {
  const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
  stabilizedThis.sort((a, b) => {
    const comp = comparator(a[0], b[0]);
    if (comp !== 0) return comp;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

function AdoptantesList() {
  const [adoptantes, setAdoptantes] = useState<Adoptante[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [eliminandoId, setEliminandoId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const navigate = useNavigate();

  // Estados para ordenamiento
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<keyof Adoptante>('nombre');

  // Tema fijo (modo claro) con gradiente celeste a blanco
  const theme = createTheme({
    palette: {
      primary: {
        main: '#0288D1',
      },
      background: {
        default: 'linear-gradient(to bottom, #B3E5FC, #FFFFFF)', // Restaurar el gradiente original
        paper: '#ffffff',
      },
    },
  });

  useEffect(() => {
    fetchAdoptantes();
  }, []);

  const fetchAdoptantes = async () => {
    setLoading(true);
    try {
      const res = await api.get('/adoptantes');
      const data = res.data;
      console.log('Respuesta de la API:', data);
      // Verificamos que data es un arreglo
      if (Array.isArray(data)) {
        setAdoptantes(data as Adoptante[]);
      } else {
        // Manejo de error si data no es un arreglo
        toast.error('La respuesta de la API no es válida.');
      }
    } catch (error) {
      console.error('Error al obtener los Clientes:', error);
      toast.error('Error al obtener los Clientes. Por favor, verifica la conexión con la API.');
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Lista de Clientes', 10, 10);
    autoTable(doc, {
      head: [['ID', 'Nombre', 'Email', 'Dirección', 'Teléfono']],
      body: stableSort(
        adoptantes.filter((adoptante) => isAdoptanteVisible(adoptante)),
        getComparator(order, orderBy)
      ).map((adoptante) => [
        adoptante.id,
        adoptante.nombre,
        adoptante.email,
        adoptante.direccion,
        adoptante.telefono,
      ]),
      startY: 20,
    });
    doc.save('Lista_Clientes.pdf');
    toast.success('Archivo PDF exportado exitosamente.');
  };

  const exportToExcel = () => {
    let content = 'ID,Nombre,Email,Dirección,Teléfono\n';
    stableSort(
      adoptantes.filter((adoptante) => isAdoptanteVisible(adoptante)),
      getComparator(order, orderBy)
    ).forEach((adoptante) => {
      content += `${adoptante.id},${adoptante.nombre},${adoptante.email},${adoptante.direccion},${adoptante.telefono}\n`;
    });

    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'Lista_Clientes.csv');
    toast.success('Archivo Excel exportado exitosamente.');
  };

  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  // Filtrar los adoptantes según la búsqueda
  const filteredAdoptantes = adoptantes.filter(
    (adoptante) =>
      adoptante.nombre.toLowerCase().includes(searchQuery) ||
      adoptante.email.toLowerCase().includes(searchQuery) ||
      adoptante.telefono.toLowerCase().includes(searchQuery) ||
      adoptante.id.toString().includes(searchQuery)
  );

  // Ordenamiento de los adoptantes filtrados
  const sortedAdoptantes = stableSort(filteredAdoptantes, getComparator(order, orderBy));

  // Mostrar todos los adoptantes filtrados y ordenados
  const displayedAdoptantes = sortedAdoptantes;

  const handleEliminar = async (id: number) => {
    const confirmar = window.confirm('¿Estás seguro de eliminar este Cliente?');
    if (!confirmar) return;

    setEliminandoId(id);
    try {
      await api.delete(`/adoptantes/${id}`);
      setAdoptantes(adoptantes.filter((adoptante) => adoptante.id !== id));
      toast.success('Cliente eliminado exitosamente.');
    } catch {
      toast.error('Error al eliminar el Cliente. Por favor, intenta nuevamente.');
    } finally {
      setEliminandoId(null);
    }
  };

  const isAdoptanteVisible = (_adoptante: Adoptante) => {
    // Puedes añadir más lógica de filtrado si es necesario
    return true;
  };

  // Función para manejar el ordenamiento al hacer clic en el encabezado
  const handleRequestSort = (property: keyof Adoptante) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          padding: 3,
          background: 'linear-gradient(to bottom, #B3E5FC, #FFFFFF)', // Restaurar el gradiente original
          minHeight: '100vh',
        }}
      >
        <Paper
          sx={{
            maxWidth: '1200px',
            margin: 'auto',
            padding: 4,
            backgroundColor: '#ffffff', // Fondo blanco para evitar transparencia
            boxShadow: 3,
            borderRadius: 2,
          }}
        >
          <Typography variant="h4" align="center" gutterBottom color="textSecondary">
            Lista de Clientes
          </Typography>
          <Box sx={{ marginBottom: 2 }}>
            <TextField
              fullWidth
              label="Buscar por ID, nombre, email o teléfono"
              variant="outlined"
              value={searchQuery}
              onChange={handleSearch}
            />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
            <Box>
              <Button
                variant="contained"
                startIcon={<FaFilePdf />}
                onClick={exportToPDF}
                sx={{
                  backgroundColor: '#D32F2F',
                  color: '#fff',
                  marginRight: 2,
                  '&:hover': { backgroundColor: '#B71C1C' },
                }}
              >
                Exportar a PDF
              </Button>
              <Button
                variant="contained"
                startIcon={<FaFileExcel />}
                onClick={exportToExcel}
                sx={{
                  backgroundColor: '#4CAF50',
                  color: '#fff',
                  '&:hover': { backgroundColor: '#388E3C' },
                }}
              >
                Exportar a Excel
              </Button>
            </Box>
            <Button
              variant="contained"
              onClick={() => navigate('/agregar-adoptante')}
              sx={{
                backgroundColor: '#0288D1',
                color: '#fff',
                '&:hover': { backgroundColor: '#0277BD' },
              }}
            >
              Agregar Cliente
            </Button>
          </Box>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" sx={{ height: 300 }}>
              <CircularProgress />
            </Box>
          ) : filteredAdoptantes.length > 0 ? (
            <>
              <TableContainer component={Paper} sx={{ backgroundColor: '#ffffff' }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#0288D1' }}>
                      {/* Encabezados con funcionalidad de ordenamiento */}
                      <TableCell sx={{ color: '#ffffff', fontWeight: 'bold' }}>
                        <TableSortLabel
                          active={orderBy === 'id'}
                          direction={orderBy === 'id' ? order : 'asc'}
                          onClick={() => handleRequestSort('id')}
                          style={{ color: '#ffffff' }}
                        >
                          ID
                        </TableSortLabel>
                      </TableCell>
                      <TableCell sx={{ color: '#ffffff', fontWeight: 'bold' }}>
                        <TableSortLabel
                          active={orderBy === 'nombre'}
                          direction={orderBy === 'nombre' ? order : 'asc'}
                          onClick={() => handleRequestSort('nombre')}
                          style={{ color: '#ffffff' }}
                        >
                          Nombre
                        </TableSortLabel>
                      </TableCell>
                      <TableCell sx={{ color: '#ffffff', fontWeight: 'bold' }}>
                        <TableSortLabel
                          active={orderBy === 'email'}
                          direction={orderBy === 'email' ? order : 'asc'}
                          onClick={() => handleRequestSort('email')}
                          style={{ color: '#ffffff' }}
                        >
                          Email
                        </TableSortLabel>
                      </TableCell>
                      <TableCell sx={{ color: '#ffffff', fontWeight: 'bold' }}>
                        <TableSortLabel
                          active={orderBy === 'direccion'}
                          direction={orderBy === 'direccion' ? order : 'asc'}
                          onClick={() => handleRequestSort('direccion')}
                          style={{ color: '#ffffff' }}
                        >
                          Dirección
                        </TableSortLabel>
                      </TableCell>
                      <TableCell sx={{ color: '#ffffff', fontWeight: 'bold' }}>
                        <TableSortLabel
                          active={orderBy === 'telefono'}
                          direction={orderBy === 'telefono' ? order : 'asc'}
                          onClick={() => handleRequestSort('telefono')}
                          style={{ color: '#ffffff' }}
                        >
                          Teléfono
                        </TableSortLabel>
                      </TableCell>
                      <TableCell sx={{ color: '#ffffff', fontWeight: 'bold' }}>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {displayedAdoptantes.map((adoptante) => (
                      <TableRow
                        key={adoptante.id}
                        sx={{
                          '&:hover': { backgroundColor: '#e0f7fa' }, // Color de hover celeste suave
                        }}
                      >
                        <TableCell>{adoptante.id}</TableCell>
                        <TableCell>{adoptante.nombre}</TableCell>
                        <TableCell>{adoptante.email}</TableCell>
                        <TableCell>{adoptante.direccion}</TableCell>
                        <TableCell>{adoptante.telefono}</TableCell>
                        <TableCell>
                          <Button
                            variant="outlined"
                            color="error"
                            disabled={eliminandoId === adoptante.id}
                            onClick={() => handleEliminar(adoptante.id)}
                          >
                            {eliminandoId === adoptante.id ? 'Eliminando...' : 'Eliminar'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          ) : (
            <Typography variant="body1" align="center" color="textSecondary">
              No hay Clientes registrados.
            </Typography>
          )}
        </Paper>
      </Box>
    </ThemeProvider>
  );
}

export default AdoptantesList;
