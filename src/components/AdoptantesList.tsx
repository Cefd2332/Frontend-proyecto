import { useState, useEffect } from 'react';
import axios from 'axios';
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
  TablePagination,
  TextField,
} from '@mui/material';
import { FaFilePdf, FaFileExcel } from 'react-icons/fa';

interface Adoptante {
  id: number;
  nombre: string;
  email: string;
  direccion: string;
  telefono: string;
}

function AdoptantesList() {
  const [adoptantes, setAdoptantes] = useState<Adoptante[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [eliminandoId, setEliminandoId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);
  const navigate = useNavigate();

  const API_BASE_URL = 'http://localhost:8080/api';

  useEffect(() => {
    fetchAdoptantes();
  }, []);

  const fetchAdoptantes = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/adoptantes`);
      setAdoptantes(res.data as Adoptante[]);
    } catch (error) {
      toast.error('Error al obtener los Clientes. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async (id: number) => {
    const confirmar = window.confirm('¿Estás seguro de eliminar este Cliente?');
    if (!confirmar) return;

    setEliminandoId(id);
    try {
      await axios.delete(`${API_BASE_URL}/adoptantes/${id}`);
      setAdoptantes(adoptantes.filter((adoptante) => adoptante.id !== id));
      toast.success('Cliente eliminado exitosamente.');
    } catch {
      toast.error('Error al eliminar el Cliente. Por favor, intenta nuevamente.');
    } finally {
      setEliminandoId(null);
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Lista de Clientes', 10, 10);
    autoTable(doc, {
      head: [['ID', 'Nombre', 'Email', 'Dirección', 'Teléfono']],
      body: adoptantes.map((adoptante) => [
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
    adoptantes.forEach((adoptante) => {
      content += `${adoptante.id},${adoptante.nombre},${adoptante.email},${adoptante.direccion},${adoptante.telefono}\n`;
    });

    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'Lista_Clientes.csv');
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

  const filteredAdoptantes = adoptantes.filter(
    (adoptante) =>
      adoptante.nombre.toLowerCase().includes(searchQuery) ||
      adoptante.email.toLowerCase().includes(searchQuery) ||
      adoptante.telefono.toLowerCase().includes(searchQuery) ||
      adoptante.id.toString().includes(searchQuery)
  );

  const paginatedAdoptantes = filteredAdoptantes.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

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
            <TableContainer component={Paper} sx={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#0288D1' }}>
                    <TableCell sx={{ color: '#ffffff', fontWeight: 'bold' }}>ID</TableCell>
                    <TableCell sx={{ color: '#ffffff', fontWeight: 'bold' }}>Nombre</TableCell>
                    <TableCell sx={{ color: '#ffffff', fontWeight: 'bold' }}>Email</TableCell>
                    <TableCell sx={{ color: '#ffffff', fontWeight: 'bold' }}>Dirección</TableCell>
                    <TableCell sx={{ color: '#ffffff', fontWeight: 'bold' }}>Teléfono</TableCell>
                    <TableCell sx={{ color: '#ffffff', fontWeight: 'bold' }}>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedAdoptantes.map((adoptante) => (
                    <TableRow
                      key={adoptante.id}
                      sx={{
                        '&:nth-of-type(odd)': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
                        '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.08)' },
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
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredAdoptantes.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
            />
          </>
        ) : (
          <Typography variant="body1" align="center" color="textSecondary">
            No hay Clientes registrados.
          </Typography>
        )}
      </Paper>
    </Box>
  );
}

export default AdoptantesList;
