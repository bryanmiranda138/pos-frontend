import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Inventario from './pages/Inventario';
import PuntoVenta from './pages/PuntoVenta';
import Historial from './pages/Historial';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} /> 

          <Route element={<Layout />}>
            <Route path="/" element={<PuntoVenta />} />
            <Route path="/inventario" element={<Inventario />} /> 
            <Route path="/historial" element={<Historial />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;