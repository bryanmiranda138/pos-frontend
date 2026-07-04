# 🖥️ POS & Inventory System — Frontend SPA (React + Vite)

Interfaz Web Moderna (*Single Page Application*) diseñada para agilizar la operación de cajeros y administradores en puntos de venta comerciales. Construida con **React, Vite y Material-UI (MUI)**, enfocada en la velocidad de cobro, diseño ergonómico de pantalla dividida (*Split-Screen*) y seguridad por roles.

---

##  Características de la Interfaz

*  **Diseño Ergonómico de Pantalla Dividida (*Split-Screen POS*):**
  * **Catálogo con Scroll Independiente:** El panel izquierdo permite navegar ágilmente por los productos sin desplazar el resto de la página.
  * **Carrito Fijo Estático:** El panel derecho (*Ticket de Compra*) se mantiene anclado en pantalla (altura `100vh`) garantizando que el total y el botón de cobro estén siempre visibles.
*  **Renderizado Condicional por Roles:**
  * La interfaz consume el *JWT* del usuario. Si el usuario logueado tiene rol `vendedor`, oculta automáticamente la pestaña de **Inventario** en el menú lateral.
*  **Arqueo y Verificación Previa al Cierre:**
  * Modal interactivo que muestra un resumen financiero claro (Fondo Base + Ventas en Efectivo vs. Tarjeta) antes de permitir el cierre definitivo de caja.
*  **Gestión de Inventario (CRUD Completo):**
  * Tablas limpias y modales emergentes (`Dialog`) para crear, editar y eliminar productos con validación visual en tiempo real.
*  **Historial Desplegable (*Accordions*):**
  * Vista de historial que agrupa las ventas por ticket y se expande fluidamente para mostrar el detalle de artículos facturados por el cajero.

---

## 🛠️ Stack Tecnológico

* **Framework:** React 18 (Inicializado con [Vite](https://vitejs.dev/))
* **Librería UI:** [Material-UI (MUI v5)](https://mui.com/) & MUI Icons
* **Enrutamiento:** `react-router-dom` (Navegación SPA sin recargas)
* **Cliente HTTP:** `axios` (Con interceptores de autorización Bearer Token)
* **Despliegue en Nube:** [Vercel](https://vercel.com/) (Con configuración `vercel.json` para soporte de rutas SPA)

---

##  Instalación y Ejecución Local

1. **Clonar el repositorio:**
   ```bash
   git clone [https://github.com/bryanmiranda138/pos-frontend.git](https://github.com/bryanmiranda138/pos-frontend.git)
   cd pos-frontend
