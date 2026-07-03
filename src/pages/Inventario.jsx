import { useState, useEffect } from 'react';
import {
    Box, Button, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, IconButton, Dialog,
    DialogTitle, DialogContent, DialogActions, TextField
} from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';
import api from '../services/api'; // Importamos nuestra conexión segura

export default function Inventario() {
    const [productos, setProductos] = useState([]);
    const [modalAbierto, setModalAbierto] = useState(false);

    // Estado para manejar los datos del formulario
    const [productoActual, setProductoActual] = useState({
        id: null, nombre: '', descripcion: '', precio: '', stock: ''
    });

    // Cargar productos al abrir la pantalla
    useEffect(() => {
        cargarProductos();
    }, []);

    const cargarProductos = async () => {
        try {
            const respuesta = await api.get('/productos');
            setProductos(respuesta.data);
        } catch (error) {
            console.error("Error al cargar productos:", error);
        }
    };

    const abrirModal = (producto = null) => {
        if (producto) {
            setProductoActual(producto); // Si recibe un producto, es modo Editar
        } else {
            // Si no recibe nada, es modo Crear (limpiamos el formulario)
            setProductoActual({ id: null, nombre: '', descripcion: '', precio: '', stock: '' });
        }
        setModalAbierto(true);
    };

    const cerrarModal = () => setModalAbierto(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProductoActual({ ...productoActual, [name]: value });
    };

    const guardarProducto = async () => {
        try {
            // Aseguramos que precio y stock sean números para la base de datos
            const datosAEnviar = {
                ...productoActual,
                precio: parseFloat(productoActual.precio),
                stock: parseInt(productoActual.stock)
            };

            if (productoActual.id) {
                // ACTUALIZAR (PUT)
                await api.put(`/productos/${productoActual.id}`, datosAEnviar);
            } else {
                // CREAR NUEVO (POST)
                await api.post('/productos', datosAEnviar);
            }

            cerrarModal();
            cargarProductos(); // Refrescamos la tabla
        } catch (error) {
            alert("Hubo un error al guardar el producto");
            console.error(error);
        }
    };

    const eliminarProducto = async (id) => {
        if (window.confirm("¿Estás seguro de eliminar este producto?")) {
            try {
                await api.delete(`/productos/${id}`);
                cargarProductos(); // Refrescamos la tabla
            } catch (error) {
                alert("Error al eliminar");
            }
        }
    };

    return (
        <Box sx={{ flex: 1, overflowY: 'auto', pb: 2, pr: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4" fontWeight="bold">Inventario de Productos</Typography>
                <Button variant="contained" startIcon={<Add />} onClick={() => abrirModal()}>
                    Nuevo Producto
                </Button>
            </Box>

            {/* TABLA DE PRODUCTOS */}
            <TableContainer component={Paper} elevation={3}>
                <Table>
                    <TableHead sx={{ backgroundColor: '#1976d2' }}>
                        <TableRow>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ID</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Nombre</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Descripción</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Precio ($)</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Stock</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {productos.map((prod) => (
                            <TableRow key={prod.id}>
                                <TableCell>{prod.id}</TableCell>
                                <TableCell>{prod.nombre}</TableCell>
                                <TableCell>{prod.descripcion}</TableCell>
                                <TableCell>${parseFloat(prod.precio).toFixed(2)}</TableCell>
                                <TableCell>{prod.stock}</TableCell>
                                <TableCell sx={{ textAlign: 'center' }}>
                                    <IconButton color="primary" onClick={() => abrirModal(prod)}>
                                        <Edit />
                                    </IconButton>
                                    <IconButton color="error" onClick={() => eliminarProducto(prod.id)}>
                                        <Delete />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {productos.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} align="center">No hay productos en el inventario.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* VENTANA EMERGENTE (MODAL) PARA CREAR/EDITAR */}
            <Dialog open={modalAbierto} onClose={cerrarModal} maxWidth="sm" fullWidth>
                <DialogTitle>{productoActual.id ? 'Editar Producto' : 'Crear Nuevo Producto'}</DialogTitle>
                <DialogContent>
                    <TextField fullWidth margin="dense" label="Nombre" name="nombre" value={productoActual.nombre} onChange={handleChange} />
                    <TextField fullWidth margin="dense" label="Descripción" name="descripcion" value={productoActual.descripcion} onChange={handleChange} multiline rows={2} />
                    <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                        <TextField fullWidth label="Precio" name="precio" type="number" value={productoActual.precio} onChange={handleChange} />
                        <TextField fullWidth label="Stock" name="stock" type="number" value={productoActual.stock} onChange={handleChange} />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={cerrarModal} color="inherit">Cancelar</Button>
                    <Button onClick={guardarProducto} variant="contained" color="primary">Guardar</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}