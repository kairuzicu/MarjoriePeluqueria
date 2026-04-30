// Configuración de API
const API_URL = 'http://localhost:5000/api';

// Token de autenticación
let authToken = localStorage.getItem('authToken');

// Función para hacer peticiones a la API
async function apiRequest(endpoint, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers
    });
    
    if (response.status === 401) {
        // Token expirado, redirigir al login
        localStorage.removeItem('authToken');
        sessionStorage.removeItem('authToken');
        window.location.href = '/index.html';
        throw new Error('Sesión expirada');
    }
    
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.error || 'Error en la petición');
    }
    
    return data;
}

// Función de login
async function login(username, password) {
    const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
    });
    
    if (data.token) {
        authToken = data.token;
        localStorage.setItem('authToken', data.token);
        return data;
    }
    
    throw new Error('Error al iniciar sesión');
}

// Función de logout
function logout() {
    authToken = null;
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
    window.location.href = '/index.html';
}

// Clientes API
const clientesAPI = {
    listar: () => apiRequest('/clientes'),
    obtener: (id) => apiRequest(`/clientes/${id}`),
    crear: (data) => apiRequest('/clientes', { method: 'POST', body: JSON.stringify(data) }),
    actualizar: (id, data) => apiRequest(`/clientes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    eliminar: (id) => apiRequest(`/clientes/${id}`, { method: 'DELETE' }),
    buscar: (termino) => apiRequest(`/clientes/buscar?q=${encodeURIComponent(termino)}`)
};

// Reservas API
const reservasAPI = {
    listar: (filtros = {}) => {
        const params = new URLSearchParams(filtros).toString();
        return apiRequest(`/reservas${params ? `?${params}` : ''}`);
    },
    obtener: (id) => apiRequest(`/reservas/${id}`),
    crear: (data) => apiRequest('/reservas/public', { method: 'POST', body: JSON.stringify(data) }),
    crearAdmin: (data) => apiRequest('/reservas', { method: 'POST', body: JSON.stringify(data) }),
    actualizarEstado: (id, estado) => apiRequest(`/reservas/${id}/estado`, { method: 'PATCH', body: JSON.stringify({ estado }) }),
    eliminar: (id) => apiRequest(`/reservas/${id}`, { method: 'DELETE' })
};

// Dashboard API
const dashboardAPI = {
    getEstadisticas: () => apiRequest('/dashboard/estadisticas'),
    getActividades: () => apiRequest('/dashboard/actividades'),
    getProximasReservas: () => apiRequest('/dashboard/proximas-reservas')
};

// Exportar para uso global
window.api = {
    login,
    logout,
    clientes: clientesAPI,
    reservas: reservasAPI,
    dashboard: dashboardAPI
};