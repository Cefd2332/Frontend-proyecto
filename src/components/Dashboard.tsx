import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { saveAs } from 'file-saver';
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
  TablePagination,
  TextField,
} from '@mui/material';
import { FaFilePdf, FaFileExcel } from 'react-icons/fa';

interface Animal {
  id: number;
  nombre: string;
  especie: string;
  edad: number;
  unidadEdad: string;
  estadoSalud: string;
  genero?: string;
  adoptanteId: number;
}

function Dashboard() {
  const [animales, setAnimales] = useState<Animal[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnimales = async () => {
      setLoading(true);
      try {
        const res = await axios.get<Animal[]>('http://localhost:8080/api/animales');
        setAnimales(res.data);
      } catch (error) {
        console.error('Error al obtener animales', error);
        toast.error('Error al obtener animales.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnimales();
  }, []);

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Lista de Animales en Atención', 10, 10);
    autoTable(doc, {
      head: [['Nombre', 'Especie', 'Edad', 'Género', 'Estado de Salud', 'ID Cliente']],
      body: animales.map((animal) => [
        animal.nombre,
        animal.especie,
        `${animal.edad} ${animal.unidadEdad}`,
        animal.genero || 'No especificado',
        animal.estadoSalud,
        animal.adoptanteId || 'No asignado',
      ]),
    });
    doc.save('Animales_Atencion.pdf');
    toast.success('Archivo PDF exportado exitosamente.');
  };

  const exportToExcel = () => {
    let content = 'Nombre,Especie,Edad,Género,Estado de Salud,ID Cliente\n';
    animales.forEach((animal) => {
      content += `${animal.nombre},${animal.especie},${animal.edad} ${animal.unidadEdad},${animal.genero || 'No especificado'},${animal.estadoSalud},${animal.adoptanteId || 'No asignado'}\n`;
    });
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'Animales_Atencion.csv');
    toast.success('Archivo Excel exportado exitosamente.');
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleEliminarAnimal = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este animal? Esta acción no se puede deshacer.')) {
      try {
        await axios.delete(`http://localhost:8080/api/animales/${id}`);
        setAnimales((prev) => prev.filter((animal) => animal.id !== id));
        toast.success('Animal eliminado correctamente.');
      } catch (error) {
        console.error('Error al eliminar el animal', error);
        toast.error('Error al eliminar el animal. Por favor, intenta nuevamente.');
      }
    }
  };

  const filteredAnimals = animales.filter(
    (animal) =>
      animal.nombre.toLowerCase().includes(searchQuery) ||
      animal.especie.toLowerCase().includes(searchQuery) ||
      animal.estadoSalud.toLowerCase().includes(searchQuery)
  );

  const paginatedAnimals = filteredAnimals.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box
      sx={{
        padding: 3,
        background: 'linear-gradient(to bottom, #B3E5FC, #FFFFFF)',
        minHeight: '100vh',
      }}
    >
      <Paper
        sx={{
          maxWidth: '1200px',
          margin: 'auto',
          padding: 4,
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          boxShadow: 3,
          borderRadius: 2,
        }}
      >
        <Typography variant="h4" align="center" gutterBottom color="textSecondary">
          Animales en Atención
        </Typography>
        <Box sx={{ marginBottom: 2 }}>
          <TextField
            fullWidth
            label="Buscar por nombre, especie o estado de salud"
            variant="outlined"
            value={searchQuery}
            onChange={handleSearch}
          />
        </Box>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" sx={{ height: 300 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
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
                onClick={() => navigate('/registrar-animal')}
                sx={{
                  backgroundColor: '#0288D1',
                  color: '#fff',
                  '&:hover': { backgroundColor: '#0277BD' },
                }}
              >
                Registrar Nuevo Animal
              </Button>
            </Box>
            <TableContainer component={Paper} sx={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#0288D1' }}>
                    <TableCell sx={{ color: '#ffffff', fontWeight: 'bold' }}>Nombre</TableCell>
                    <TableCell sx={{ color: '#ffffff', fontWeight: 'bold' }}>Especie</TableCell>
                    <TableCell sx={{ color: '#ffffff', fontWeight: 'bold' }}>Edad</TableCell>
                    <TableCell sx={{ color: '#ffffff', fontWeight: 'bold' }}>Género</TableCell>
                    <TableCell sx={{ color: '#ffffff', fontWeight: 'bold' }}>Estado de Salud</TableCell>
                    <TableCell sx={{ color: '#ffffff', fontWeight: 'bold' }}>ID Cliente</TableCell>
                    <TableCell sx={{ color: '#ffffff', fontWeight: 'bold' }}>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedAnimals.map((animal) => (
                    <TableRow
                      key={animal.id}
                      sx={{
                        '&:nth-of-type(odd)': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
                        '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.08)' },
                      }}
                    >
                      <TableCell>{animal.nombre}</TableCell>
                      <TableCell>{animal.especie}</TableCell>
                      <TableCell>{`${animal.edad} ${animal.unidadEdad}`}</TableCell>
                      <TableCell>{animal.genero || 'No especificado'}</TableCell>
                      <TableCell>{animal.estadoSalud}</TableCell>
                      <TableCell>{animal.adoptanteId || 'No asignado'}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            variant="outlined"
                            color="primary"
                            size="small"
                            onClick={() => navigate(`/animales/${animal.id}/vacunas`)}
                          >
                            Vacunas
                          </Button>
                          <Button
                            variant="outlined"
                            color="success"
                            size="small"
                            onClick={() => navigate(`/agendar-cita/${animal.id}`)}
                          >
                            Cita
                          </Button>
                          <Button
                            variant="outlined"
                            color="warning"
                            size="small"
                            onClick={() => navigate(`/editar-animal/${animal.id}`)}
                          >
                            Editar
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={() => handleEliminarAnimal(animal.id)}
                            sx={{
                              color: '#D32F2F',
                              borderColor: '#D32F2F',
                              '&:hover': {
                                backgroundColor: 'rgba(211, 47, 47, 0.1)',
                                borderColor: '#B71C1C',
                              },
                            }}
                          >
                            Eliminar
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredAnimals.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
            />
          </>
        )}
      </Paper>
    </Box>
  );
}

export default Dashboard;
