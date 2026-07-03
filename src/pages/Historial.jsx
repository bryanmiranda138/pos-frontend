import { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Accordion, AccordionSummary, AccordionDetails,
    Table, TableBody, TableCell, TableHead, TableRow, Chip
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import api from '../services/api';

export default function Historial() {
    const [ventas, setVentas] = useState([]);

    useEffect(() => {
        cargarHistorial();
    }, []);

    const cargarHistorial = async () => {
        try {
            const respuesta = await api.get('/historial/ventas');
            setVentas(respuesta.data);
        } catch (error) {
            console.error("Error al cargar historial", error);
        }
    };

    return (
        <Box sx={{ flex: 1, overflowY: 'auto', pb: 2, pr: 1 }}>
            <Typography variant="h4" fontWeight="bold" mb={3}>Historial de Ventas</Typography>

            {ventas.length === 0 ? (
                <Typography>No hay ventas registradas aún.</Typography>
            ) : (
                ventas.map((venta) => {
                    // Formatear la fecha
                    const fechaFormateada = new Date(venta.fecha).toLocaleString('es-ES', {
                        dateStyle: 'medium', timeStyle: 'short'
                    });

                    return (
                        <Accordion key={venta.id} sx={{ mb: 1 }}>
                            {/* CABECERA DEL ACORDEÓN (Resumen de la Venta) */}
                            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ backgroundColor: '#f5f5f5' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', pr: 2 }}>
                                    <Typography fontWeight="bold">Ticket #{venta.id}</Typography>
                                    <Typography>{fechaFormateada}</Typography>
                                    <Chip
                                        label={venta.metodo_pago.toUpperCase()}
                                        color={venta.metodo_pago === 'efectivo' ? 'success' : 'info'}
                                        size="small"
                                    />
                                    <Typography fontWeight="bold" color="primary">Total: ${parseFloat(venta.total).toFixed(2)}</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Cajero: {venta.caja_sesiones?.usuarios?.nombre || 'Desconocido'}
                                    </Typography>
                                </Box>
                            </AccordionSummary>

                            {/* DETALLE DESPLEGABLE (Qué compraron) */}
                            <AccordionDetails>
                                <Typography variant="subtitle2" gutterBottom>Productos vendidos en esta transacción:</Typography>
                                <Table size="small" component={Paper} elevation={0} variant="outlined">
                                    <TableHead sx={{ backgroundColor: '#eeeeee' }}>
                                        <TableRow>
                                            <TableCell>Producto</TableCell>
                                            <TableCell align="center">Cantidad</TableCell>
                                            <TableCell align="right">Precio Unitario (Histórico)</TableCell>
                                            <TableCell align="right">Subtotal</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {venta.detalle_ventas.map((detalle) => (
                                            <TableRow key={detalle.id}>
                                                <TableCell>{detalle.productos?.nombre || 'Producto Borrado'}</TableCell>
                                                <TableCell align="center">{detalle.cantidad}</TableCell>
                                                <TableCell align="right">${parseFloat(detalle.precio_unitario).toFixed(2)}</TableCell>
                                                <TableCell align="right">
                                                    ${(detalle.cantidad * detalle.precio_unitario).toFixed(2)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </AccordionDetails>
                        </Accordion>
                    );
                })
            )}
        </Box>
    );
}