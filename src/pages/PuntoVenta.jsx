import { useState, useEffect } from 'react';
import {
    Box, Grid, Card, CardContent, Typography, Button,
    Table, TableBody, TableCell, TableHead, TableRow,
    Paper, Divider, FormControl, InputLabel, Select, MenuItem, Alert,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField
} from '@mui/material';
import { Delete, AttachMoney, LockOpen, Lock } from '@mui/icons-material';
import api from '../services/api';

export default function PuntoVenta() {
    const [productos, setProductos] = useState([]);
    const [carrito, setCarrito] = useState([]);
    const [metodoPago, setMetodoPago] = useState('efectivo');
    const [cajaAbierta, setCajaAbierta] = useState(false);
    const [modalCaja, setModalCaja] = useState(false);
    const [saldoInicial, setSaldoInicial] = useState('');
    const [mensaje, setMensaje] = useState(null);

    // Estados para los modales
    const [modalAlerta, setModalAlerta] = useState({
        abierto: false,
        titulo: '',
        mensaje: ''
    });
    const [modalConfirmarVenta, setModalConfirmarVenta] = useState(false);

    const [modalPreCierre, setModalPreCierre] = useState({
        abierto: false,
        saldoInicial: 0,
        totalVendido: 0,
        totalEfectivo: 0, // <-- NUEVO
        totalTarjeta: 0,  // <-- NUEVO
        saldoEsperado: 0
    });

    useEffect(() => {
        verificarCaja();
        cargarProductos();
    }, []);

    // Lógica de Caja
    const verificarCaja = async () => {
        try {
            const respuesta = await api.get('/caja/estado');
            setCajaAbierta(respuesta.data.activa);
        } catch (error) {
            console.error("Error al verificar la caja");
        }
    };

    const abrirCaja = async () => {
        if (!saldoInicial) {
            setModalAlerta({ abierto: true, titulo: '⚠️ Atención', mensaje: 'Ingresa el saldo inicial para abrir la caja.' });
            return;
        }
        try {
            await api.post('/caja/abrir', { saldo_inicial: saldoInicial });
            setCajaAbierta(true);
            setModalCaja(false);
            setSaldoInicial('');
            setMensaje({ tipo: 'success', texto: 'Turno iniciado. Caja abierta exitosamente.' });
            setTimeout(() => setMensaje(null), 3000);
        } catch (error) {
            setModalAlerta({ abierto: true, titulo: '❌ Error', mensaje: 'Error al abrir caja' });
        }
    };

    // Función para abrir el arqueo previo
    const iniciarPreCierre = async () => {
        try {
            const res = await api.get('/caja/resumen');
            setModalPreCierre({
                abierto: true,
                saldoInicial: res.data.saldoInicial,
                totalVendido: res.data.totalVendido,
                totalEfectivo: res.data.totalEfectivo, // <-- NUEVO
                totalTarjeta: res.data.totalTarjeta,   // <-- NUEVO
                saldoEsperado: res.data.saldoEsperado
            });
        } catch (error) {
            console.error("Error al obtener resumen:", error);
            setModalAlerta({
                abierto: true,
                titulo: '❌ Error',
                mensaje: 'No se pudieron calcular los totales de la caja.'
            });
        }
    };

    const cerrarCaja = async () => {
        try {
            const res = await api.put('/caja/cerrar');
            setCajaAbierta(false);
            setCarrito([]);
            setModalPreCierre({ ...modalPreCierre, abierto: false });

            setModalAlerta({
                abierto: true,
                titulo: '🔒 Turno Finalizado Exitosamente',
                mensaje: `Caja cerrada con éxito.\n\n💵 Total vendido hoy: $${parseFloat(res.data.totalVendido).toFixed(2)}\n💰 Dinero final en caja (Base + Ventas): $${parseFloat(res.data.saldoFinal).toFixed(2)}`
            });
        } catch (error) {
            console.error(error);
            setModalAlerta({
                abierto: true,
                titulo: '❌ Error',
                mensaje: error.response?.data?.error || 'No se pudo cerrar la caja.'
            });
        }
    };

    // Lógica de Productos y Carrito
    const cargarProductos = async () => {
        try {
            const respuesta = await api.get('/productos');
            setProductos(respuesta.data.filter(p => p.stock > 0));
        } catch (error) {
            console.error("Error al cargar productos", error);
        }
    };

    const agregarAlCarrito = (producto) => {
        if (!cajaAbierta) {
            setModalAlerta({ abierto: true, titulo: '⚠️ Caja Cerrada', mensaje: 'Debes abrir la caja antes de poder vender.' });
            return;
        }

        const itemExistente = carrito.find(item => item.id === producto.id);
        if (itemExistente) {
            if (itemExistente.cantidad >= producto.stock) {
                setModalAlerta({ abierto: true, titulo: '⚠️ Stock Insuficiente', mensaje: '¡No hay suficiente stock disponible de este producto!' });
                return;
            }
            setCarrito(carrito.map(item => item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item));
        } else {
            setCarrito([...carrito, { ...producto, cantidad: 1 }]);
        }
    };

    const eliminarDelCarrito = (id) => setCarrito(carrito.filter(item => item.id !== id));

    const calcularTotal = () => carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);

    const procesarVenta = async () => {
        if (carrito.length === 0) {
            setModalAlerta({ abierto: true, titulo: '⚠️ Carrito Vacío', mensaje: 'El carrito está vacío, agrega productos antes de cobrar.' });
            return;
        }
        try {
            await api.post('/ventas', {
                total: calcularTotal(),
                metodo_pago: metodoPago,
                carrito: carrito
            });

            setModalConfirmarVenta(false);
            setMensaje({ tipo: 'success', texto: '¡Venta procesada correctamente!' });
            setCarrito([]);
            cargarProductos();
            setTimeout(() => setMensaje(null), 3000);
        } catch (error) {
            setModalConfirmarVenta(false);
            setModalAlerta({ abierto: true, titulo: '❌ Error en Venta', mensaje: error.response?.data?.error || 'Error al procesar la venta' });
        }
    };

    return (
        <>
            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, flex: 1, overflow: 'hidden' }}>

                {/* --- LADO IZQUIERDO: CONTENEDOR DE PRODUCTOS --- */}
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

                    {/* ENCABEZADO Y BOTONES */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, flexShrink: 0 }}>
                        <Typography variant="h4" fontWeight="bold">Punto de Venta</Typography>
                        {cajaAbierta ? (
                            <Button variant="outlined" color="error" startIcon={<Lock />} onClick={iniciarPreCierre}>
                                Cerrar Caja
                            </Button>
                        ) : (
                            <Button variant="contained" color="secondary" startIcon={<LockOpen />} onClick={() => setModalCaja(true)}>
                                Abrir Caja para Vender
                            </Button>
                        )}
                    </Box>

                    {/* ALERTAS */}
                    {!cajaAbierta && (
                        <Alert severity="warning" sx={{ mb: 2, flexShrink: 0 }}>
                            La caja está cerrada actualmente. Haz clic en "Abrir Caja" e ingresa tu base de dinero para comenzar a cobrar.
                        </Alert>
                    )}
                    {mensaje && <Alert severity={mensaje.tipo} sx={{ mb: 2, flexShrink: 0 }}>{mensaje.texto}</Alert>}

                    {/* ÁREA DE SCROLL DE PRODUCTOS */}
                    <Box sx={{ flex: 1, overflowY: 'auto', pr: 1, pb: 0 }}>
                        <Grid container spacing={2}>
                            {productos.map((prod) => (
                                <Grid item xs={12} sm={6} md={4} lg={3} key={prod.id}>
                                    <Card
                                        elevation={2}
                                        sx={{
                                            cursor: cajaAbierta ? 'pointer' : 'not-allowed',
                                            opacity: cajaAbierta ? 1 : 0.6,
                                            '&:hover': cajaAbierta ? { transform: 'scale(1.02)', transition: '0.2s' } : {}
                                        }}
                                        onClick={() => agregarAlCarrito(prod)}
                                    >
                                        <CardContent>
                                            <Typography variant="h6" fontWeight="bold" noWrap>{prod.nombre}</Typography>
                                            <Typography color="text.secondary" variant="body2" noWrap>{prod.descripcion}</Typography>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                                                <Typography variant="h6" color="primary">${parseFloat(prod.precio).toFixed(2)}</Typography>
                                                <Typography variant="caption" sx={{ mt: 1 }}>Stock: {prod.stock}</Typography>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                </Box>

                {/* --- LADO DERECHO: CARRITO ESTÁTICO --- */}
                <Box sx={{ width: '380px', flexShrink: 0 }}>
                    <Paper elevation={3} sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="h6" fontWeight="bold" mb={2}>Carrito de Compras</Typography>

                        <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Producto</TableCell>
                                        <TableCell align="center">Cant.</TableCell>
                                        <TableCell align="right">Subt.</TableCell>
                                        <TableCell align="center">🗑️</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {carrito.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>{item.nombre}</TableCell>
                                            <TableCell align="center">{item.cantidad}</TableCell>
                                            <TableCell align="right">${(item.precio * item.cantidad).toFixed(2)}</TableCell>
                                            <TableCell align="center">
                                                <Button color="error" size="small" onClick={() => eliminarDelCarrito(item.id)}>
                                                    <Delete fontSize="small" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        <Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="h5">Total:</Typography>
                                <Typography variant="h5" fontWeight="bold" color="primary">
                                    ${calcularTotal().toFixed(2)}
                                </Typography>
                            </Box>

                            <FormControl fullWidth sx={{ mb: 2 }}>
                                <InputLabel>Método de Pago</InputLabel>
                                <Select value={metodoPago} label="Método de Pago" onChange={(e) => setMetodoPago(e.target.value)}>
                                    <MenuItem value="efectivo">Efectivo 💵</MenuItem>
                                    <MenuItem value="tarjeta">Tarjeta 💳</MenuItem>
                                </Select>
                            </FormControl>

                            <Button
                                variant="contained"
                                color="success"
                                fullWidth
                                size="large"
                                startIcon={<AttachMoney />}
                                onClick={() => setModalConfirmarVenta(true)}
                                disabled={!cajaAbierta || carrito.length === 0}
                            >
                                Cobrar Venta
                            </Button>
                        </Box>
                    </Paper>
                </Box>
            </Box>

            {/* MODAL DE APERTURA DE CAJA */}
            <Dialog open={modalCaja} onClose={() => setModalCaja(false)}>
                <DialogTitle>Apertura de Caja</DialogTitle>
                <DialogContent>
                    <Typography mb={2}>Ingresa el dinero base (efectivo) con el que iniciarás el turno:</Typography>
                    <TextField
                        autoFocus
                        fullWidth
                        label="Saldo Inicial ($)"
                        type="number"
                        value={saldoInicial}
                        onChange={(e) => setSaldoInicial(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setModalCaja(false)} color="inherit">Cancelar</Button>
                    <Button onClick={abrirCaja} variant="contained" color="primary">Iniciar Turno</Button>
                </DialogActions>
            </Dialog>

            {/* MODAL DE ALERTAS */}
            <Dialog
                open={modalAlerta.abierto}
                onClose={() => setModalAlerta({ ...modalAlerta, abierto: false })}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.3rem' }}>
                    {modalAlerta.titulo}
                </DialogTitle>

                <DialogContent dividers>
                    <Typography sx={{ whiteSpace: 'pre-line', fontSize: '1.05rem', lineHeight: 1.6 }}>
                        {modalAlerta.mensaje}
                    </Typography>
                </DialogContent>

                <DialogActions sx={{ p: 2 }}>
                    <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        onClick={() => setModalAlerta({ ...modalAlerta, abierto: false })}
                    >
                        Aceptar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* MODAL DE ARQUEO / PRE-CIERRE */}
            <Dialog
                open={modalPreCierre.abierto}
                onClose={() => setModalPreCierre({ ...modalPreCierre, abierto: false })}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.4rem', bgcolor: '#fff3e0', color: '#e65100' }}>
                    ⚖️ Arqueo y Verificación de Caja
                </DialogTitle>

                <DialogContent dividers sx={{ p: 3 }}>
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                        Verifica el desglose de ventas antes de proceder con el cierre del turno:
                    </Typography>

                    <Paper variant="outlined" sx={{ p: 2, my: 2, bgcolor: '#fafafa' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body1">💵 Fondo Base Inicial:</Typography>
                            <Typography variant="body1" fontWeight="bold">
                                ${parseFloat(modalPreCierre.saldoInicial || 0).toFixed(2)}
                            </Typography>
                        </Box>

                        <Divider sx={{ my: 1 }} />

                        {/* DESGLOSE POR MÉTODO DE PAGO */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
                            <Typography variant="body2" sx={{ pl: 2, color: 'text.secondary' }}>• Ventas en Efectivo 💵:</Typography>
                            <Typography variant="body2" fontWeight="bold" color="success.main">
                                + ${parseFloat(modalPreCierre.totalEfectivo || 0).toFixed(2)}
                            </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" sx={{ pl: 2, color: 'text.secondary' }}>• Ventas con Tarjeta 💳:</Typography>
                            <Typography variant="body2" fontWeight="bold" color="info.main">
                                + ${parseFloat(modalPreCierre.totalTarjeta || 0).toFixed(2)}
                            </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, bgcolor: '#eeeeee', p: 0.8, borderRadius: 1 }}>
                            <Typography variant="body2" fontWeight="bold">🛒 Total Facturado en Turno:</Typography>
                            <Typography variant="body2" fontWeight="bold">
                                ${parseFloat(modalPreCierre.totalVendido || 0).toFixed(2)}
                            </Typography>
                        </Box>

                        <Divider sx={{ my: 1.5 }} />

                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="h6" fontWeight="bold">💰 Total Esperado en Caja:</Typography>
                            <Typography variant="h6" fontWeight="bold" color="primary">
                                ${parseFloat(modalPreCierre.saldoEsperado || 0).toFixed(2)}
                            </Typography>
                        </Box>
                    </Paper>

                    <Alert severity="info" sx={{ mt: 2 }}>
                        Nota: El dinero físico en gaveta debe cuadrar con el <b>Fondo Base + Ventas en Efectivo (${(parseFloat(modalPreCierre.saldoInicial || 0) + parseFloat(modalPreCierre.totalEfectivo || 0)).toFixed(2)})</b>.
                    </Alert>
                </DialogContent>

                <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
                    <Button
                        onClick={() => setModalPreCierre({ ...modalPreCierre, abierto: false })}
                        color="inherit"
                        size="large"
                    >
                        Aún no, seguir vendiendo
                    </Button>
                    <Button
                        onClick={cerrarCaja}
                        variant="contained"
                        color="error"
                        size="large"
                        startIcon={<Lock />}
                    >
                        Confirmar Cierre de Caja
                    </Button>
                </DialogActions>
            </Dialog>
            
            {/* MODAL DE CONFIRMACIÓN DE VENTA */}
            <Dialog
                open={modalConfirmarVenta}
                onClose={() => setModalConfirmarVenta(false)}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.3rem', bgcolor: '#e8f5e9', color: '#1b5e20' }}>
                    🛒 Confirmar Cobro
                </DialogTitle>

                <DialogContent dividers sx={{ p: 3 }}>
                    <Typography variant="body1" gutterBottom>
                        ¿Deseas procesar el cobro por los productos seleccionados?
                    </Typography>

                    <Paper variant="outlined" sx={{ p: 2, mt: 2, bgcolor: '#fafafa' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">Total de artículos:</Typography>
                            <Typography variant="body2" fontWeight="bold">
                                {carrito.reduce((acc, item) => acc + item.cantidad, 0)} unidades
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">Método de pago:</Typography>
                            <Typography variant="body2" fontWeight="bold" sx={{ textTransform: 'capitalize' }}>
                                {metodoPago} {metodoPago === 'efectivo' ? '💵' : '💳'}
                            </Typography>
                        </Box>
                        <Divider sx={{ my: 1 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="h6" fontWeight="bold">Total a cobrar:</Typography>
                            <Typography variant="h6" fontWeight="bold" color="success.main">
                                ${calcularTotal().toFixed(2)}
                            </Typography>
                        </Box>
                    </Paper>
                </DialogContent>

                <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
                    <Button
                        onClick={() => setModalConfirmarVenta(false)}
                        color="inherit"
                        size="large"
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={procesarVenta}
                        variant="contained"
                        color="success"
                        size="large"
                        startIcon={<AttachMoney />}
                    >
                        Confirmar y Cobrar
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}