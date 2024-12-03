import { useEffect, useState, ChangeEvent } from 'react';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
  Tooltip,
  TableSortLabel,
  createTheme,
  ThemeProvider,
  SelectChangeEvent,
} from '@mui/material';
import { FaFilePdf, FaFileExcel } from 'react-icons/fa';
import api from '../api/axios';

interface Animal {
  id: number;
  nombre: string;
  especie: string;
  edad: number;
  unidadEdad: string;
  estadoSalud: string;
  genero?: string;
  adoptanteId?: number; // Hacerlo opcional para manejar 'No asignado'
}

const availableColumns = [
  { id: 'nombre', label: 'Nombre' },
  { id: 'especie', label: 'Especie' },
  { id: 'edad', label: 'Edad' },
  { id: 'genero', label: 'Género' },
  { id: 'estadoSalud', label: 'Estado de Salud' },
  { id: 'adoptanteId', label: 'ID Cliente' },
];

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

type Order = 'asc' | 'desc';

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

function Dashboard() {
  const [animales, setAnimales] = useState<Animal[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);
  const [filters, setFilters] = useState({
    especie: '',
    estadoSalud: '',
    genero: '',
    edadMin: '',
    edadMax: '',
  });
  const [exportDialogOpen, setExportDialogOpen] = useState<boolean>(false);
  const [selectedColumns, setSelectedColumns] = useState<string[]>(availableColumns.map(col => col.id));
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<string>('nombre');
  const navigate = useNavigate();

  // Nuevo Estado para Selección de Animales
  const [selectedAnimalIds, setSelectedAnimalIds] = useState<number[]>([]);

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
    const fetchAnimales = async () => {
      setLoading(true);
      try {
        const res = await api.get<Animal[]>('/animales');
        // Opcional: Normalizar el género a mayúsculas para consistencia
        const normalizedData = res.data.map(animal => ({
          ...animal,
          genero: animal.genero ? animal.genero.toLowerCase() : undefined,
        }));
        setAnimales(normalizedData);
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
    if (selectedAnimalIds.length === 0) {
      toast.warn('No hay animales seleccionados para exportar.');
      return;
    }

    const doc = new jsPDF();
    doc.text('Lista de Animales en Atención', 10, 10);
    autoTable(doc, {
      head: [availableColumns.filter(col => selectedColumns.includes(col.id)).map(col => col.label)],
      body: stableSort(
        animales
          .filter(animal => selectedAnimalIds.includes(animal.id))
          .map(animal => ({
            ...animal,
            genero: animal.genero ? animal.genero.charAt(0).toUpperCase() + animal.genero.slice(1) : 'No especificado',
            adoptanteId: animal.adoptanteId ?? undefined,
          })),
        getComparator(order, orderBy as keyof Animal)
      ).map((animal) =>
        availableColumns
          .filter(col => selectedColumns.includes(col.id))
          .map(col => {
            switch (col.id) {
              case 'edad':
                return `${animal.edad} ${animal.unidadEdad}`;
              case 'genero':
                return animal.genero || 'No especificado';
              case 'adoptanteId':
                return animal.adoptanteId ? animal.adoptanteId.toString() : 'No asignado';
              default:
                return (animal as any)[col.id];
            }
          })
      ),
    });
    doc.save('Animales_Atencion.pdf');
    toast.success('Archivo PDF exportado exitosamente.');
  };

  const exportToExcel = () => {
    if (selectedAnimalIds.length === 0) {
      toast.warn('No hay animales seleccionados para exportar.');
      return;
    }

    let content = availableColumns
      .filter(col => selectedColumns.includes(col.id))
      .map(col => col.label)
      .join(',') + '\n';
    stableSort(
      animales
        .filter(animal => selectedAnimalIds.includes(animal.id))
        .map(animal => ({
          ...animal,
          genero: animal.genero ? animal.genero.charAt(0).toUpperCase() + animal.genero.slice(1) : 'No especificado',
          adoptanteId: animal.adoptanteId ?? undefined,
        })),
      getComparator(order, orderBy as keyof Animal)
    ).forEach((animal) => {
      content += availableColumns
        .filter(col => selectedColumns.includes(col.id))
        .map(col => {
          switch (col.id) {
            case 'edad':
              return `${animal.edad} ${animal.unidadEdad}`;
            case 'genero':
              return animal.genero || 'No especificado';
            case 'adoptanteId':
              return animal.adoptanteId ? animal.adoptanteId.toString() : 'No asignado';
            default:
              return (animal as any)[col.id];
          }
        })
        .join(',') + '\n';
    });
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'Animales_Atencion.csv');
    toast.success('Archivo Excel exportado exitosamente.');
  };

  const handleSearch = (_event: any, value: string | null) => {
    setSearchQuery(value ? value.toLowerCase() : '');
    setPage(0);
  };

  const handlePageChange = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleEliminarAnimal = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este animal? Esta acción no se puede deshacer.')) {
      try {
        await api.delete(`/animales/${id}`);
        setAnimales((prev) => prev.filter((animal) => animal.id !== id));
        // También eliminar de la selección si estaba seleccionado
        setSelectedAnimalIds((prev) => prev.filter(selectedId => selectedId !== id));
        toast.success('Animal eliminado correctamente.');
      } catch (error) {
        console.error('Error al eliminar el animal', error);
        toast.error('Error al eliminar el animal. Por favor, intenta nuevamente.');
      }
    }
  };

  const handleFilterChange = (event: SelectChangeEvent<string> | React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    // Si el filtro es 'genero', normalizar a minúsculas para consistencia
    setFilters((prev) => ({
      ...prev,
      [name as string]: name === 'genero' ? value.toLowerCase() : value,
    }));
    setPage(0);
  };

  const isAnimalVisible = (animal: Animal) => {
    const { especie, estadoSalud, genero, edadMin, edadMax } = filters;
    const matchesEspecie = especie ? animal.especie === especie : true;
    const matchesEstadoSalud = estadoSalud ? animal.estadoSalud === estadoSalud : true;
    const matchesGenero = genero ? (animal.genero ? animal.genero.toLowerCase() === genero : false) : true;
    const matchesEdadMin = edadMin ? animal.edad >= parseInt(edadMin, 10) : true;
    const matchesEdadMax = edadMax ? animal.edad <= parseInt(edadMax, 10) : true;
    const matchesSearch =
      animal.nombre.toLowerCase().includes(searchQuery) ||
      animal.especie.toLowerCase().includes(searchQuery) ||
      animal.estadoSalud.toLowerCase().includes(searchQuery);
    return matchesEspecie && matchesEstadoSalud && matchesGenero && matchesEdadMin && matchesEdadMax && matchesSearch;
  };

  const filteredAnimals = animales.filter(isAnimalVisible);

  // Ordenamiento de los animales filtrados
  const sortedAnimals = stableSort(
    filteredAnimals.map(animal => ({
      ...animal,
      genero: animal.genero ? animal.genero.charAt(0).toUpperCase() + animal.genero.slice(1) : 'No especificado',
      adoptanteId: animal.adoptanteId ?? undefined,
    })),
    getComparator(order, orderBy as keyof Animal)
  );

  const paginatedAnimals = sortedAnimals.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleExportClick = () => {
    if (selectedAnimalIds.length === 0) {
      toast.warn('No hay animales seleccionados para exportar.');
      return;
    }
    setExportDialogOpen(true);
  };

  const handleExportConfirm = () => {
    setExportDialogOpen(false);
    exportToPDF();
  };

  const handleExportCancel = () => {
    setExportDialogOpen(false);
  };

  function handleTextFieldChange(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    setPage(0);
  }

  // Función para manejar el ordenamiento al hacer clic en el encabezado
  const handleRequestSort = (property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Funciones para manejar la selección de animales
  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelecteds = filteredAnimals.map((animal) => animal.id);
      setSelectedAnimalIds(newSelecteds);
      return;
    }
    setSelectedAnimalIds([]);
  };

  const handleSelectClick = (id: number) => {
    const selectedIndex = selectedAnimalIds.indexOf(id);
    let newSelected: number[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedAnimalIds, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedAnimalIds.slice(1));
    } else if (selectedIndex === selectedAnimalIds.length - 1) {
      newSelected = newSelected.concat(selectedAnimalIds.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selectedAnimalIds.slice(0, selectedIndex),
        selectedAnimalIds.slice(selectedIndex + 1)
      );
    }

    setSelectedAnimalIds(newSelected);
  };

  const isSelected = (id: number) => selectedAnimalIds.indexOf(id) !== -1;

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
            backgroundColor: '#ffffff', // Asegurar que el fondo de Paper sea blanco
            boxShadow: 3,
            borderRadius: 2,
          }}
        >
          <Typography variant="h4" align="center" gutterBottom color="textSecondary">
            Animales en Atención
          </Typography>
          {/* Filtros Avanzados */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', marginBottom: 2 }}>
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Especie</InputLabel>
              <Select
                name="especie"
                value={filters.especie}
                label="Especie"
                onChange={handleFilterChange}
              >
                <MenuItem value="">
                  <em>Todas</em>
                </MenuItem>
                {/* Opciones dinámicas basadas en los datos */}
                {[...new Set(animales.map(animal => animal.especie))].map(especie => (
                  <MenuItem key={especie} value={especie}>
                    {especie}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Estado de Salud</InputLabel>
              <Select
                name="estadoSalud"
                value={filters.estadoSalud}
                label="Estado de Salud"
                onChange={handleFilterChange}
              >
                <MenuItem value="">
                  <em>Todas</em>
                </MenuItem>
                {[...new Set(animales.map(animal => animal.estadoSalud))].map(estado => (
                  <MenuItem key={estado} value={estado}>
                    {estado}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Género</InputLabel>
              <Select
                name="genero"
                value={filters.genero}
                label="Género"
                onChange={handleFilterChange}
              >
                <MenuItem value="">
                  <em>Todos</em>
                </MenuItem>
                <MenuItem value="macho">Macho</MenuItem>
                <MenuItem value="hembra">Hembra</MenuItem>
                {/* Otros géneros si es aplicable */}
              </Select>
            </FormControl>
            <TextField
              label="Edad Mínima"
              name="edadMin"
              type="number"
              value={filters.edadMin}
              onChange={handleTextFieldChange}
              sx={{ minWidth: 120 }}
            />
            <TextField
              label="Edad Máxima"
              name="edadMax"
              type="number"
              value={filters.edadMax}
              onChange={handleTextFieldChange}
              sx={{ minWidth: 120 }}
            />
            <Button
              variant="outlined"
              onClick={() =>
                setFilters({
                  especie: '',
                  estadoSalud: '',
                  genero: '',
                  edadMin: '',
                  edadMax: '',
                })
              }
            >
              Limpiar Filtros
            </Button>
          </Box>
          {/* Búsqueda Predictiva */}
          <Box sx={{ marginBottom: 2 }}>
            <Autocomplete
              freeSolo
              options={animales.map(animal => animal.nombre)}
              onInputChange={handleSearch}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Buscar por nombre"
                  variant="outlined"
                />
              )}
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
                    onClick={handleExportClick}
                    sx={{
                      backgroundColor: '#D32F2F',
                      color: '#fff',
                      marginRight: 2,
                      '&:hover': { backgroundColor: '#B71C1C' },
                    }}
                    disabled={selectedAnimalIds.length === 0}
                  >
                    Exportar Seleccionados a PDF
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
                    disabled={selectedAnimalIds.length === 0}
                  >
                    Exportar Seleccionados a Excel
                  </Button>
                </Box>
                <Typography variant="subtitle1" color="textSecondary">
                  {selectedAnimalIds.length} {selectedAnimalIds.length === 1 ? 'animal seleccionado' : 'animales seleccionados'}
                </Typography>
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
              <TableContainer component={Paper} sx={{ backgroundColor: '#ffffff' }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#0288D1' }}>
                      {/* Columna de Selección */}
                      <TableCell padding="checkbox">
                        <Checkbox
                          color="primary"
                          indeterminate={selectedAnimalIds.length > 0 && selectedAnimalIds.length < filteredAnimals.length}
                          checked={filteredAnimals.length > 0 && selectedAnimalIds.length === filteredAnimals.length}
                          onChange={handleSelectAllClick}
                          inputProps={{
                            'aria-label': 'seleccionar todos los animales',
                          }}
                        />
                      </TableCell>
                      {availableColumns.map(col => (
                        <TableCell
                          key={col.id}
                          sx={{ color: '#ffffff', fontWeight: 'bold' }}
                          sortDirection={orderBy === col.id ? order : false}
                        >
                          <TableSortLabel
                            active={orderBy === col.id}
                            direction={orderBy === col.id ? order : 'asc'}
                            onClick={() => handleRequestSort(col.id)}
                            style={{ color: '#ffffff' }}
                          >
                            {col.label}
                          </TableSortLabel>
                        </TableCell>
                      ))}
                      <TableCell sx={{ color: '#ffffff', fontWeight: 'bold' }}>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedAnimals.map((animal) => {
                      const isItemSelected = isSelected(animal.id);
                      return (
                        <TableRow
                          key={animal.id}
                          hover
                          role="checkbox"
                          aria-checked={isItemSelected}
                          selected={isItemSelected}
                          sx={{
                            '&:hover': { backgroundColor: '#e0e0e0' }, // Solo color al pasar el cursor
                          }}
                        >
                          {/* Checkbox de Selección */}
                          <TableCell padding="checkbox">
                            <Checkbox
                              color="primary"
                              checked={isItemSelected}
                              onChange={() => handleSelectClick(animal.id)}
                              inputProps={{
                                'aria-labelledby': `enhanced-table-checkbox-${animal.id}`,
                              }}
                            />
                          </TableCell>
                          {availableColumns.map(col => (
                            <TableCell key={col.id}>
                              {(() => {
                                switch (col.id) {
                                  case 'edad':
                                    return `${animal.edad} ${animal.unidadEdad}`;
                                  case 'genero':
                                    return animal.genero ? animal.genero.charAt(0).toUpperCase() + animal.genero.slice(1) : 'No especificado';
                                  case 'adoptanteId':
                                    return animal.adoptanteId ? animal.adoptanteId.toString() : 'No asignado';
                                  default:
                                    return (animal as any)[col.id];
                                }
                              })()}
                            </TableCell>
                          ))}
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Tooltip title="Ver Vacunas">
                                <Button
                                  variant="outlined"
                                  color="primary"
                                  size="small"
                                  onClick={() => navigate(`/animales/${animal.id}/vacunas`)}
                                >
                                  Vacunas
                                </Button>
                              </Tooltip>
                              <Tooltip title="Agendar Cita">
                                <Button
                                  variant="outlined"
                                  color="success"
                                  size="small"
                                  onClick={() => navigate(`/agendar-cita/${animal.id}`)}
                                >
                                  Cita
                                </Button>
                              </Tooltip>
                              <Tooltip title="Editar Animal">
                                <Button
                                  variant="outlined"
                                  color="warning"
                                  size="small"
                                  onClick={() => navigate(`/editar-animal/${animal.id}`)}
                                >
                                  Editar
                                </Button>
                              </Tooltip>
                              <Tooltip title="Eliminar Animal">
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
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })}
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
          {/* Diálogo para seleccionar columnas de exportación */}
          <Dialog open={exportDialogOpen} onClose={handleExportCancel}>
            <DialogTitle>Seleccionar Columnas para Exportar PDF</DialogTitle>
            <DialogContent>
              <FormControl component="fieldset">
                <FormGroup>
                  {availableColumns.map(col => (
                    <FormControlLabel
                      key={col.id}
                      control={
                        <Checkbox
                          checked={selectedColumns.includes(col.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedColumns(prev => [...prev, col.id]);
                            } else {
                              setSelectedColumns(prev => prev.filter(id => id !== col.id));
                            }
                          }}
                          name={col.id}
                        />
                      }
                      label={col.label}
                    />
                  ))}
                </FormGroup>
              </FormControl>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleExportCancel}>Cancelar</Button>
              <Button onClick={handleExportConfirm} variant="contained" color="primary">
                Exportar
              </Button>
            </DialogActions>
          </Dialog>
        </Paper>
      </Box>
    </ThemeProvider>
  );
}

export default Dashboard;
