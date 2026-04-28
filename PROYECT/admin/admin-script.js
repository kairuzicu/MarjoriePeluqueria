// ===== VERIFICACIÓN DE AUTENTICACIÓN =====
(function verificarAutenticacion() {
    const sesion = sessionStorage.getItem('marjorieAdminSesion');
    const recordar = localStorage.getItem('marjorieAdminRecordar');
    
    if (!sesion && !recordar) {
        // No hay sesión activa, redirigir al login
        alert('⛔ Acceso denegado. Debes iniciar sesión primero.');
        window.location.href = '../index.html';
        return;
    }
    
    // Si hay sesión por recordar, crear sesión temporal
    if (!sesion && recordar) {
        sessionStorage.setItem('marjorieAdminSesion', 'activa');
    }
    
    console.log('✅ Sesión verificada - Acceso permitido');
})();

// ===== DATOS SIMULADOS (en producción usarías una base de datos) =====
let datos = JSON.parse(localStorage.getItem('marjorieData')) || {
    clientes: [],
    reservas: [],
    tarjetasFidelidad: [],
    historial: [],
    contadorTarjetas: 0
};

// Función para guardar datos
function guardarDatos() {
    localStorage.setItem('marjorieData', JSON.stringify(datos));
}

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', function() {
    // Configurar fecha actual
    const fechaActual = new Date().toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const dateDisplay = document.getElementById('currentDate');
    if (dateDisplay) dateDisplay.textContent = fechaActual;

    // Cargar dashboard
    cargarDashboard();
    
    // Configurar navegación por tabs
    configurarNavegacion();
    
    // Configurar búsqueda y filtros
    configurarBusquedas();
    
    // Configurar menú móvil
    configurarMenuMovil();
    
    // Si estamos en la página de registro
    if (document.getElementById('formCliente')) {
        configurarFormularioCliente();
    }
});

// ===== NAVEGACIÓN POR TABS =====
function configurarNavegacion() {
    const navItems = document.querySelectorAll('.nav-item[data-tab]');
    const tabContents = document.querySelectorAll('.tab-content');
    
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remover active de todos
            navItems.forEach(nav => nav.classList.remove('active'));
            tabContents.forEach(tab => tab.classList.remove('active'));
            
            // Activar el seleccionado
            this.classList.add('active');
            const tabId = this.getAttribute('data-tab');
            const tabContent = document.getElementById(tabId);
            if (tabContent) {
                tabContent.classList.add('active');
                cargarContenidoTab(tabId);
            }
        });
    });
}

// ===== CARGAR CONTENIDO DE TABS =====
function cargarContenidoTab(tabId) {
    switch(tabId) {
        case 'dashboard':
            cargarDashboard();
            break;
        case 'reservas':
            cargarReservas();
            break;
        case 'clientes':
            cargarClientes();
            break;
        case 'fidelidad':
            cargarTarjetasFidelidad();
            break;
        case 'historial':
            cargarHistorial();
            break;
    }
}

// ===== DASHBOARD =====
function cargarDashboard() {
    // Estadísticas
    const hoy = new Date().toISOString().split('T')[0];
    const reservasHoy = datos.reservas.filter(r => r.fecha === hoy).length;
    const clientesTotales = datos.clientes.length;
    const tarjetasActivas = datos.tarjetasFidelidad.filter(t => t.sellos < 10).length;
    const premiosPendientes = datos.tarjetasFidelidad.filter(t => t.sellos >= 10 && !t.premioReclamado).length;
    
    document.getElementById('reservasHoy').textContent = reservasHoy;
    document.getElementById('clientesTotales').textContent = clientesTotales;
    document.getElementById('tarjetasActivas').textContent = tarjetasActivas;
    document.getElementById('premiosPendientes').textContent = premiosPendientes;
    document.getElementById('reservasCount').textContent = datos.reservas.filter(r => r.estado === 'pendiente').length;
    
    // Últimas reservas
    const ultimasReservasDiv = document.getElementById('ultimasReservas');
    const ultimasReservas = datos.reservas.slice(-5).reverse();
    
    if (ultimasReservas.length > 0) {
        ultimasReservasDiv.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Cliente</th>
                        <th>Servicio</th>
                        <th>Fecha</th>
                        <th>Estado</th>
                    </tr>
                </thead>
                <tbody>
                    ${ultimasReservas.map(r => `
                        <tr>
                            <td>${r.nombre}</td>
                            <td>${r.servicio}</td>
                            <td>${r.fecha}</td>
                            <td><span class="estado-${r.estado}">${r.estado}</span></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } else {
        ultimasReservasDiv.innerHTML = '<p class="no-data">No hay reservas recientes</p>';
    }
    
    // Próximos premios
    const proximosPremiosDiv = document.getElementById('proximosPremios');
    const tarjetasCasiCompletas = datos.tarjetasFidelidad
        .filter(t => t.sellos >= 8 && t.sellos < 10)
        .slice(0, 5);
    
    if (tarjetasCasiCompletas.length > 0) {
        proximosPremiosDiv.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Cliente</th>
                        <th>Tarjeta</th>
                        <th>Progreso</th>
                        <th>Faltan</th>
                    </tr>
                </thead>
                <tbody>
                    ${tarjetasCasiCompletas.map(t => {
                        const cliente = datos.clientes.find(c => c.tarjetaId === t.id);
                        return `
                            <tr>
                                <td>${cliente ? cliente.nombre : 'N/A'}</td>
                                <td>${t.numero}</td>
                                <td>${t.sellos}/10</td>
                                <td>${10 - t.sellos} visitas</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;
    } else {
        proximosPremiosDiv.innerHTML = '<p class="no-data">No hay premios pendientes</p>';
    }
}

// ===== RESERVAS =====
function cargarReservas(filtro = 'todas', busqueda = '') {
    const tablaReservas = document.getElementById('tablaReservas');
    let reservasFiltradas = datos.reservas;
    
    if (filtro !== 'todas') {
        reservasFiltradas = reservasFiltradas.filter(r => r.estado === filtro);
    }
    
    if (busqueda) {
        reservasFiltradas = reservasFiltradas.filter(r => 
            r.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
            r.telefono.includes(busqueda)
        );
    }
    
    if (reservasFiltradas.length > 0) {
        tablaReservas.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Cliente</th>
                        <th>Teléfono</th>
                        <th>Servicio</th>
                        <th>Fecha</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${reservasFiltradas.map((r, index) => `
                        <tr>
                            <td>${r.nombre}</td>
                            <td>${r.telefono}</td>
                            <td>${r.servicio}</td>
                            <td>${r.fecha}</td>
                            <td>
                                <select class="estado-select" onchange="cambiarEstadoReserva(${index}, this.value)">
                                    <option value="pendiente" ${r.estado === 'pendiente' ? 'selected' : ''}>Pendiente</option>
                                    <option value="confirmada" ${r.estado === 'confirmada' ? 'selected' : ''}>Confirmada</option>
                                    <option value="completada" ${r.estado === 'completada' ? 'selected' : ''}>Completada</option>
                                    <option value="cancelada" ${r.estado === 'cancelada' ? 'selected' : ''}>Cancelada</option>
                                </select>
                            </td>
                            <td>
                                <button class="btn btn-small btn-success" onclick="completarVisita(${index})" title="Completar y sumar sello">
                                    <i class="fas fa-check"></i>
                                </button>
                                <button class="btn btn-small btn-danger" onclick="eliminarReserva(${index})" title="Eliminar">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } else {
        tablaReservas.innerHTML = '<p class="no-data">No hay reservas registradas</p>';
    }
}

// ===== CLIENTES =====
function cargarClientes(busqueda = '') {
    const tablaClientes = document.getElementById('tablaClientes');
    let clientesFiltrados = datos.clientes;
    
    if (busqueda) {
        clientesFiltrados = clientesFiltrados.filter(c => 
            c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
            c.email.toLowerCase().includes(busqueda.toLowerCase()) ||
            c.telefono.includes(busqueda)
        );
    }
    
    if (clientesFiltrados.length > 0) {
        tablaClientes.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Email</th>
                        <th>Teléfono</th>
                        <th>Tarjeta FID</th>
                        <th>Visitas</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${clientesFiltrados.map((c, index) => {
                        const tarjeta = datos.tarjetasFidelidad.find(t => t.id === c.tarjetaId);
                        return `
                            <tr>
                                <td>${c.nombre}</td>
                                <td>${c.email}</td>
                                <td>${c.telefono}</td>
                                <td>${tarjeta ? tarjeta.numero : 'N/A'}</td>
                                <td>${tarjeta ? tarjeta.sellos + '/10' : 'N/A'}</td>
                                <td>
                                    <button class="btn btn-small btn-warning" onclick="verTarjeta('${c.tarjetaId}')">
                                        <i class="fas fa-id-card"></i>
                                    </button>
                                    <button class="btn btn-small btn-danger" onclick="eliminarCliente(${index})">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;
    } else {
        tablaClientes.innerHTML = '<p class="no-data">No hay clientes registrados</p>';
    }
}

// ===== TARJETAS DE FIDELIDAD =====
function cargarTarjetasFidelidad() {
    const tarjetasGrid = document.getElementById('tarjetasGrid');
    
    if (datos.tarjetasFidelidad.length > 0) {
        tarjetasGrid.innerHTML = datos.tarjetasFidelidad.map(t => {
            const cliente = datos.clientes.find(c => c.tarjetaId === t.id);
            const esCompleta = t.sellos >= 10;
            
            return `
                <div class="fidelidad-card ${esCompleta ? 'completa' : ''}">
                    <div class="fidelidad-card-header">
                        <span class="fidelidad-card-numero">${t.numero}</span>
                        <span>${cliente ? cliente.nombre : 'Sin asignar'}</span>
                        ${esCompleta && !t.premioReclamado ? '<span class="badge" style="background: #4caf50;">¡Premio!</span>' : ''}
                    </div>
                    
                    <div class="sellos-container">
                        ${Array.from({length: 10}, (_, i) => `
                            <div class="sello ${i < t.sellos ? 'completado' : 'pendiente'}">
                                ${i < t.sellos ? '★' : i + 1}
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${(t.sellos / 10) * 100}%"></div>
                    </div>
                    <p class="progress-text">${t.sellos}/10 visitas</p>
                    
                    <div style="margin-top: 1rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
                        ${!esCompleta ? `
                            <button class="btn btn-small btn-primary" onclick="agregarSello('${t.id}')">
                                <i class="fas fa-plus"></i> Agregar Visita
                            </button>
                        ` : ''}
                        ${esCompleta && !t.premioReclamado ? `
                            <button class="btn btn-small btn-success" onclick="reclamarPremio('${t.id}')">
                                <i class="fas fa-gift"></i> Reclamar Premio
                            </button>
                        ` : ''}
                        ${t.premioReclamado ? `
                            <span style="color: #4caf50; font-weight: 600;">
                                <i class="fas fa-check-circle"></i> Premio Reclamado
                            </span>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');
    } else {
        tarjetasGrid.innerHTML = '<p class="no-data">No hay tarjetas de fidelidad activas</p>';
    }
}

// ===== HISTORIAL =====
function cargarHistorial() {
    const historialTimeline = document.getElementById('historialTimeline');
    
    if (datos.historial.length > 0) {
        historialTimeline.innerHTML = datos.historial.slice().reverse().slice(0, 20).map(h => `
            <div class="timeline-item">
                <h4>${h.accion}</h4>
                <p>${h.descripcion}</p>
                <span class="fecha">${new Date(h.fecha).toLocaleString('es-ES')}</span>
            </div>
        `).join('');
    } else {
        historialTimeline.innerHTML = '<p class="no-data">No hay actividad registrada</p>';
    }
}

// ===== FUNCIONES DE ACCIÓN =====
function cambiarEstadoReserva(index, nuevoEstado) {
    datos.reservas[index].estado = nuevoEstado;
    agregarHistorial('Reserva actualizada', `Reserva de ${datos.reservas[index].nombre} cambiada a ${nuevoEstado}`);
    guardarDatos();
    cargarDashboard();
}

function completarVisita(index) {
    const reserva = datos.reservas[index];
    reserva.estado = 'completada';
    
    // Buscar si el cliente tiene tarjeta de fidelidad
    const cliente = datos.clientes.find(c => 
        c.nombre.toLowerCase() === reserva.nombre.toLowerCase() && 
        c.telefono === reserva.telefono
    );
    
    if (cliente) {
        const tarjeta = datos.tarjetasFidelidad.find(t => t.id === cliente.tarjetaId);
        if (tarjeta && tarjeta.sellos < 10) {
            tarjeta.sellos++;
            
            // Verificar si completó la tarjeta
            if (tarjeta.sellos >= 10) {
                enviarNotificacionPremio(cliente, tarjeta);
            }
        }
    }
    
    agregarHistorial('Visita completada', `${reserva.nombre} - ${reserva.servicio}`);
    guardarDatos();
    cargarDashboard();
    cargarReservas();
    alert('✅ Visita completada y sello agregado a la tarjeta de fidelidad');
}

function agregarSello(tarjetaId) {
    const tarjeta = datos.tarjetasFidelidad.find(t => t.id === tarjetaId);
    if (tarjeta && tarjeta.sellos < 10) {
        tarjeta.sellos++;
        
        if (tarjeta.sellos >= 10) {
            const cliente = datos.clientes.find(c => c.tarjetaId === tarjetaId);
            if (cliente) {
                enviarNotificacionPremio(cliente, tarjeta);
            }
        }
        
        agregarHistorial('Sello agregado', `Tarjeta ${tarjeta.numero} - ${tarjeta.sellos}/10`);
        guardarDatos();
        cargarTarjetasFidelidad();
        cargarDashboard();
        alert('✅ Sello agregado correctamente');
    }
}

function reclamarPremio(tarjetaId) {
    const tarjeta = datos.tarjetasFidelidad.find(t => t.id === tarjetaId);
    const cliente = datos.clientes.find(c => c.tarjetaId === tarjetaId);
    
    if (tarjeta && cliente) {
        tarjeta.premioReclamado = true;
        tarjeta.sellos = 0; // Reiniciar tarjeta
        
        agregarHistorial('Premio reclamado', `${cliente.nombre} reclamó su premio: ${tarjeta.tipoPremio}`);
        guardarDatos();
        cargarTarjetasFidelidad();
        cargarDashboard();
        
        alert(`🎉 ¡Premio reclamado exitosamente!\nCliente: ${cliente.nombre}\nPremio: ${tarjeta.tipoPremio}\nSe ha reiniciado la tarjeta de fidelidad.`);
        
        // Simular envío de correo
        console.log(`[EMAIL SIMULADO] Para: ${cliente.email}`);
        console.log(`Asunto: ¡Felicidades! Has reclamado tu premio en Marjorie Peluquería`);
        console.log(`Mensaje: Estimado/a ${cliente.nombre}, tu premio (${tarjeta.tipoPremio}) ha sido reclamado exitosamente.`);
    }
}

function eliminarReserva(index) {
    if (confirm('¿Estás seguro de eliminar esta reserva?')) {
        const reserva = datos.reservas[index];
        datos.reservas.splice(index, 1);
        agregarHistorial('Reserva eliminada', `Reserva de ${reserva.nombre}`);
        guardarDatos();
        cargarDashboard();
        cargarReservas();
    }
}

function eliminarCliente(index) {
    if (confirm('¿Estás seguro de eliminar este cliente? Se eliminará también su tarjeta de fidelidad.')) {
        const cliente = datos.clientes[index];
        datos.tarjetasFidelidad = datos.tarjetasFidelidad.filter(t => t.id !== cliente.tarjetaId);
        datos.clientes.splice(index, 1);
        agregarHistorial('Cliente eliminado', `Cliente ${cliente.nombre} eliminado`);
        guardarDatos();
        cargarDashboard();
        cargarClientes();
    }
}

function verTarjeta(tarjetaId) {
    // Cambiar a la pestaña de fidelidad
    document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
    document.querySelector('.nav-item[data-tab="fidelidad"]').classList.add('active');
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.getElementById('fidelidad').classList.add('active');
    cargarTarjetasFidelidad();
}

// ===== ENVÍO DE NOTIFICACIÓN (SIMULADO) =====
function enviarNotificacionPremio(cliente, tarjeta) {
    console.log('═══════════════════════════════════════');
    console.log('📧 SIMULACIÓN DE ENVÍO DE CORREO');
    console.log('═══════════════════════════════════════');
    console.log(`Para: ${cliente.email}`);
    console.log(`Asunto: ¡Felicidades ${cliente.nombre}! Has completado tu tarjeta de fidelidad`);
    console.log('───────────────────────────────────────');
    console.log(`
        Estimado/a ${cliente.nombre}:
        
        ¡Felicitaciones! Has completado los 10 sellos de tu tarjeta de fidelidad 
        en Marjorie Peluquería.
        
        Tu premio: ${tarjeta.tipoPremio}
        Número de tarjeta: ${tarjeta.numero}
        
        Puedes pasar a reclamar tu premio en nuestro salón.
        
        Horario: Lun - Sáb: 9:00 - 20:00
        Dirección: Calle Principal 123, Centro, Ciudad
        
        ¡Te esperamos!
        
        Marjorie Peluquería
    `);
    console.log('═══════════════════════════════════════');
    
    agregarHistorial('Correo enviado', `Notificación de premio a ${cliente.email}`);
}

// ===== REGISTRO DE CLIENTE =====
function configurarFormularioCliente() {
    const form = document.getElementById('formCliente');
    const tarjetaNumeroPreview = document.getElementById('tarjetaNumeroPreview');
    
    // Generar número de tarjeta preview
    const nuevoNumero = `FID-${String(datos.contadorTarjetas + 1).padStart(4, '0')}`;
    if (tarjetaNumeroPreview) {
        tarjetaNumeroPreview.textContent = nuevoNumero;
    }
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const nombre = document.getElementById('nombre').value;
        const email = document.getElementById('email').value;
        const telefono = document.getElementById('telefono').value;
        const fechaNacimiento = document.getElementById('fechaNacimiento').value;
        const tipoPremio = document.getElementById('tipoPremio').value;
        
        // Crear tarjeta de fidelidad
        const tarjetaId = 'tarjeta_' + Date.now();
        const tarjetaNumero = `FID-${String(datos.contadorTarjetas + 1).padStart(4, '0')}`;
        
        const nuevaTarjeta = {
            id: tarjetaId,
            numero: tarjetaNumero,
            sellos: 0,
            tipoPremio: tipoPremio,
            premioReclamado: false,
            fechaCreacion: new Date().toISOString()
        };
        
        // Crear cliente
        const nuevoCliente = {
            id: 'cliente_' + Date.now(),
            nombre: nombre,
            email: email,
            telefono: telefono,
            fechaNacimiento: fechaNacimiento,
            tarjetaId: tarjetaId,
            fechaRegistro: new Date().toISOString()
        };
        
        datos.tarjetasFidelidad.push(nuevaTarjeta);
        datos.clientes.push(nuevoCliente);
        datos.contadorTarjetas++;
        
        agregarHistorial('Cliente registrado', `${nombre} - Tarjeta ${tarjetaNumero}`);
        guardarDatos();
        
        // Mostrar mensaje de éxito
        form.style.display = 'none';
        const mensajeExito = document.getElementById('mensajeExito');
        mensajeExito.style.display = 'block';
        document.getElementById('tarjetaCreada').textContent = tarjetaNumero;
        
        // Simular envío de correo de bienvenida
        console.log('═══════════════════════════════════════');
        console.log('📧 CORREO DE BIENVENIDA SIMULADO');
        console.log('═══════════════════════════════════════');
        console.log(`Para: ${email}`);
        console.log(`Asunto: ¡Bienvenido/a a Marjorie Peluquería! Tu tarjeta de fidelidad está lista`);
        console.log('───────────────────────────────────────');
        console.log(`
            Estimado/a ${nombre}:
            
            ¡Gracias por registrarte en Marjorie Peluquería!
            
            Tu tarjeta de fidelidad ha sido creada:
            Número: ${tarjetaNumero}
            
            Acumula 10 visitas y recibe un premio gratis:
            ${tipoPremio}
            
            ¡Te esperamos!
            
            Marjorie Peluquería
        `);
        console.log('═══════════════════════════════════════');
    });
}

// ===== CONFIGURAR BÚSQUEDAS =====
function configurarBusquedas() {
    const searchReservas = document.getElementById('searchReservas');
    const searchClientes = document.getElementById('searchClientes');
    const filterEstado = document.getElementById('filterEstado');
    
    if (searchReservas) {
        searchReservas.addEventListener('input', function() {
            cargarReservas(filterEstado ? filterEstado.value : 'todas', this.value);
        });
    }
    
    if (searchClientes) {
        searchClientes.addEventListener('input', function() {
            cargarClientes(this.value);
        });
    }
    
    if (filterEstado) {
        filterEstado.addEventListener('change', function() {
            cargarReservas(this.value, searchReservas ? searchReservas.value : '');
        });
    }
}

// ===== CONFIGURAR MENÚ MÓVIL =====
function configurarMenuMovil() {
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.querySelector('.admin-sidebar');
    
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('open');
        });
        
        // Cerrar al hacer clic en un enlace
        sidebar.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                sidebar.classList.remove('open');
            });
        });
    }
}

// ===== FUNCIÓN AUXILIAR =====
function agregarHistorial(accion, descripcion) {
    datos.historial.push({
        accion: accion,
        descripcion: descripcion,
        fecha: new Date().toISOString()
    });
}
// ===== CERRAR SESIÓN =====
function cerrarSesion() {
    if (confirm('¿Estás seguro de cerrar sesión?')) {
        sessionStorage.removeItem('marjorieAdminSesion');
        localStorage.removeItem('marjorieAdminRecordar');
        window.location.href = '../index.html';
    }
}

// Hacer la función accesible globalmente
window.cerrarSesion = cerrarSesion;

// Hacer funciones accesibles globalmente
window.cambiarEstadoReserva = cambiarEstadoReserva;
window.completarVisita = completarVisita;
window.eliminarReserva = eliminarReserva;
window.eliminarCliente = eliminarCliente;
window.agregarSello = agregarSello;
window.reclamarPremio = reclamarPremio;
window.verTarjeta = verTarjeta;