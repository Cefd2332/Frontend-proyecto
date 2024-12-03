// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard';
import RegistrarAnimal from './components/RegistrarAnimal';
import HistorialAnimal from './components/HistorialAnimal';
import DeleteAnimal from './components/DeleteAnimal';
import AdoptantesList from './components/AdoptantesList';
import AgregarAdoptante from './components/AgregarAdoptante';
import AgendarCita from './components/AgendarCitas';
import CalendarioCitas from './components/CalendarioCitas';
import DetallesCita from './components/DetalleCitas';
import VacunasAnimal from './components/VacunasAnimal';
import EditAnimal from './components/EditAnimal';
import Layout from './components/Layout'; // Importamos el Layout
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Perfil from './components/Perfil';
import Logout from './components/Logout'; // Importamos el componente Logout
import NotFound from './components/404'; // Importamos el componente NotFound
import PrivateRoute from './components/PrivateRoute'; // Importa PrivateRoute
import { AuthProvider } from './components/Auth/AuthContext'; // Importa AuthProvider


function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Rutas sin NavBar */}
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Rutas con NavBar utilizando el Layout y PrivateRoute */}
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Layout />
                </PrivateRoute>
              }
            >
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="registrar-animal" element={<RegistrarAnimal />} />
              <Route path="eliminar-animal" element={<DeleteAnimal />} />
              <Route path="historial-animal/:id" element={<HistorialAnimal />} />
              <Route path="adoptantes" element={<AdoptantesList />} />
              <Route path="agregar-adoptante" element={<AgregarAdoptante />} />
              <Route path="agendar-cita" element={<AgendarCita />} />
              <Route path="agendar-cita/:id" element={<AgendarCita />} />
              <Route path="calendario-citas" element={<CalendarioCitas />} />
              <Route path="detalles-cita/:id" element={<DetallesCita />} />
              <Route path="animales/:id/vacunas" element={<VacunasAnimal />} />
              <Route path="editar-animal/:id" element={<EditAnimal />} />

              {/* Ruta de Perfil */}
              <Route path="perfil" element={<Perfil />} />

              {/* Ruta de Logout */}
              <Route path="logout" element={<Logout />} />
            </Route>

            {/* Ruta para No Autorizado */}
            

            {/* Ruta comodín para manejar 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <ToastContainer /> {/* Contenedor de notificaciones */}
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
