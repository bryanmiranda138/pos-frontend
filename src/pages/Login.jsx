import { useState } from 'react';
import { Box, Button, TextField, Typography, Container, Paper, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
export default function Login() {
    // Estados para guardar lo que el usuario escribe y posibles errores
    const [nombre, setNombre] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault(); // Evita que la página se recargue al enviar el formulario
        setError(''); // Limpiamos errores previos

        try {
            // Hacemos la petición POST a nuestra API de Node.js
            const response = await axios.post('http://localhost:3000/api/auth/login', {
                nombre,
                password
            });

            // Si es exitoso, el backend nos devuelve el token y el rol
            const { token, rol } = response.data;
            login(token, rol);
            // Redirigimos al usuario a la pantalla principal (Punto de Venta)
            navigate('/');

        } catch (error) {
            // Si las credenciales son incorrectas o el servidor falla, mostramos el error
            setError(error.response?.data?.error || 'Ocurrió un error al intentar iniciar sesión');
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Paper elevation={3} sx={{ padding: 4, width: '100%', borderRadius: 2 }}>
                    <Typography component="h1" variant="h5" align="center" gutterBottom>
                        Iniciar Sesión
                    </Typography>

                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="Nombre de Usuario"
                            autoFocus
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="Contraseña"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2, py: 1.5 }}
                        >
                            Entrar al Sistema
                        </Button>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
}