import { useState } from 'react';
import { Box, Card, CardContent, TextField, Button, Typography, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// IMPORTANTE: Importamos 'api' en lugar de 'axios' para usar la URL de Render
import api from '../services/api';

export default function Login() {
    const [usuario, setUsuario] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            // Ahora usamos api.post('/auth/login') para que apunte directo a Render
            const respuesta = await api.post('/auth/login', {
                nombre: usuario,
                password: password
            });

            // Guardamos en la memoria global (Context) y redirigimos
            login(respuesta.data.token, respuesta.data.rol);
            navigate('/');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || 'Ocurrió un error al intentar iniciar sesión');
        }
    };

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#f4f6f8' }}>
            <Card sx={{ maxWidth: 400, width: '100%', p: 2, boxShadow: 3 }}>
                <CardContent>
                    <Typography variant="h5" fontWeight="bold" textAlign="center" gutterBottom>
                        Iniciar Sesión
                    </Typography>

                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                    <form onSubmit={handleSubmit}>
                        <TextField
                            label="Nombre de Usuario"
                            fullWidth
                            required
                            margin="normal"
                            value={usuario}
                            onChange={(e) => setUsuario(e.target.value)}
                        />
                        <TextField
                            label="Contraseña"
                            type="password"
                            fullWidth
                            required
                            margin="normal"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            fullWidth
                            size="large"
                            sx={{ mt: 2 }}
                        >
                            Entrar al Sistema
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </Box>
    );
}