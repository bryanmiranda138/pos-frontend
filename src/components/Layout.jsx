import { Box, CssBaseline } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
    return (
        // 1. Congelamos toda la app exactamente al alto de la ventana, sin scroll global
        <Box sx={{ display: 'flex', bgcolor: '#f4f6f8', height: '100vh', overflow: 'hidden' }}>
            <CssBaseline />

            <Sidebar />

            {/* 2. El "main" ahora es una columna elástica (Flex) que estirará su contenido */}
            <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', pt: 2, px: 2, pb: 0 }}>
                <Outlet />
            </Box>
        </Box>
    );
}