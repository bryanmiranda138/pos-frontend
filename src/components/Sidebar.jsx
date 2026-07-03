import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, Box, Divider } from '@mui/material';
import { ShoppingCart, Inventory, Logout, ReceiptLong } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const drawerWidth = 240;

export default function Sidebar() {
    const navigate = useNavigate();
    const { rol, logout } = useAuth();

    // TODO: Por ahora simularemos que el usuario es admin. 
    // Más adelante, leeremos esto del JWT de tu backend.
    const rolUsuario = 'admin';

    const cerrarSesion = () => {
        // Aquí luego borraremos el token
        logout();
        navigate('/login');
    };

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box', backgroundColor: '#f8f9fa' },
            }}
        >
            <Toolbar>
                <strong>Punto de Venta</strong>
            </Toolbar>
            <Divider />

            <Box sx={{ overflow: 'auto', display: 'flex', flexDirection: 'column', height: '100%' }}>
                <List>
                    {/* Botón para el Punto de Venta (Visible para todos) */}
                    <ListItem disablePadding>
                        <ListItemButton onClick={() => navigate('/')}>
                            <ListItemIcon><ShoppingCart color="primary" /></ListItemIcon>
                            <ListItemText primary="Punto de Venta" />
                        </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding>
                        <ListItemButton onClick={() => navigate('/historial')}>
                            <ListItemIcon><ReceiptLong color="success" /></ListItemIcon>
                            <ListItemText primary="Historial de Ventas" />
                        </ListItemButton>
                    </ListItem>

                    {rol === 'admin' && (
                        <>
                            <ListItem disablePadding>
                                <ListItemButton onClick={() => navigate('/inventario')}>
                                    <ListItemIcon><Inventory color="secondary" /></ListItemIcon>
                                    <ListItemText primary="Inventario" />
                                </ListItemButton>
                            </ListItem>
                        </>
                    )}
                </List>

                <Box sx={{ flexGrow: 1 }} /> {/* Espaciador para empujar el botón de salir abajo */}

                <List>
                    <Divider />
                    <ListItem disablePadding>
                        <ListItemButton onClick={cerrarSesion}>
                            <ListItemIcon><Logout color="error" /></ListItemIcon>
                            <ListItemText primary="Cerrar Sesión" />
                        </ListItemButton>
                    </ListItem>
                </List>
            </Box>
        </Drawer>
    );
}