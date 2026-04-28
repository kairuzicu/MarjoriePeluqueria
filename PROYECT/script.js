// ===== MENÚ HAMBURGUESA (MEJORADO) =====
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');
const body = document.body;

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
    body.classList.toggle('no-scroll');
});

// Cerrar menú al hacer click en un enlace
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        body.classList.remove('no-scroll');
    });
});

// Cerrar menú al hacer clic fuera de él
document.addEventListener('click', (event) => {
    const isClickInsideMenu = navMenu.contains(event.target);
    const isClickOnHamburger = hamburger.contains(event.target);
    
    if (!isClickInsideMenu && !isClickOnHamburger && navMenu.classList.contains('active')) {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        body.classList.remove('no-scroll');
    }
});

// ===== NAVEGACIÓN ACTIVA Y HEADER CON EFECTO (MEJORADO) =====
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');
const header = document.querySelector('.header');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;
    
    // Activar enlace de navegación según la sección visible
    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 150;
        const sectionId = section.getAttribute('id');
        
        if(currentScroll > sectionTop && currentScroll <= sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if(link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });

    // Efecto de opacidad en el header
    if(currentScroll > 100) {
        header.style.background = 'rgba(26, 26, 26, 0.98)';
        header.style.backdropFilter = 'blur(15px)';
    } else {
        header.style.background = 'rgba(26, 26, 26, 0.95)';
        header.style.backdropFilter = 'blur(10px)';
    }

    // Ocultar/mostrar header al hacer scroll
    if(currentScroll > lastScroll && currentScroll > 500) {
        header.style.transform = 'translateY(-100%)';
    } else {
        header.style.transform = 'translateY(0)';
    }
    lastScroll = currentScroll;
});

// ===== ANIMACIÓN SUAVE PARA ENLACES INTERNOS =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        
        if(targetId === '#') return; // Ignorar enlaces "#"
        
        const target = document.querySelector(targetId);
        
        if(target) {
            window.scrollTo({
                top: target.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// ===== SISTEMA DE FILTRADO POR CATEGORÍAS (MEJORADO) =====
document.addEventListener('DOMContentLoaded', function() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const serviceCards = document.querySelectorAll('.service-card');
    const servicesGrid = document.getElementById('servicesGrid');

    function filterServices(category) {
        servicesGrid.style.opacity = '0';

        setTimeout(() => {
            serviceCards.forEach((card, index) => {
                const cardCategory = card.dataset.category;
                if (category === 'todos' || cardCategory.includes(category)) {
                    card.style.display = 'block';
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 50 + (index * 50));
                } else {
                    card.style.display = 'none';
                }
            });
            servicesGrid.style.opacity = '1';
        }, 150);
    }

    tabButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            const category = this.dataset.category;
            filterServices(category);
            createRipple(this, e);
        });
    });

    // Inicializar con "Todos" activo
    filterServices('todos');
});

// ===== MANEJO DEL FORMULARIO DE RESERVA CON ANIMACIÓN =====
const reserveForm = document.querySelector('.reserve-form');
if (reserveForm) {
    reserveForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const submitButton = this.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;

        // Animación de carga
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
        submitButton.disabled = true;

        // Simulación de envío (reemplazar con fetch a tu backend)
        setTimeout(() => {
            submitButton.innerHTML = '<i class="fas fa-check-circle"></i> ¡Solicitud Enviada!';
            submitButton.style.background = '#27ae60';
            
            // Mostrar mensaje de éxito
            const formContainer = document.querySelector('.reserve-content');
            const existingMessage = document.querySelector('.success-message');
            if (existingMessage) existingMessage.remove();
            
            const successMessage = document.createElement('div');
            successMessage.className = 'success-message animate-on-scroll visible';
            successMessage.innerHTML = `
                <i class="fas fa-check-circle"></i>
                <p>¡Gracias por tu reserva! Te confirmaremos por WhatsApp en menos de 10 minutos.</p>
            `;
            formContainer.appendChild(successMessage);
            
            setTimeout(() => {
                submitButton.innerHTML = originalText;
                submitButton.style.background = '';
                submitButton.disabled = false;
                reserveForm.reset();
                successMessage.remove();
            }, 5000);

        }, 1500);
    });
}

// ===== CARRUSEL DE GALERÍA (NUEVO) =====
const galleryItems = document.querySelectorAll('.gallery-item');
galleryItems.forEach((item, index) => {
    item.addEventListener('click', () => {
        alert(`Próximamente: Vista en grande del Look ${index + 1}.\n¡Estamos actualizando nuestra galería con fotos reales!`);
    });
    item.style.cursor = 'pointer';
    item.title = `Click para ampliar Look ${index + 1}`;
});

// ===== CONTADOR DE ESTADÍSTICAS ANIMADO (NUEVO) =====
const heroStats = document.querySelector('.hero-stats');
if (heroStats) {
    const statNumbers = heroStats.querySelectorAll('.stat-number');
    
    const animateStats = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                statNumbers.forEach(stat => {
                    const targetText = stat.textContent;
                    const isPlus = targetText.includes('+');
                    const isK = targetText.includes('K');
                    let targetNumber = parseInt(targetText.replace(/[^0-9]/g, ''));
                    
                    if(targetNumber > 0) {
                        let currentNumber = 0;
                        const increment = targetNumber / 50;
                        const timer = setInterval(() => {
                            currentNumber += increment;
                            if (currentNumber >= targetNumber) {
                                stat.textContent = (isK ? targetNumber + 'K' : targetNumber) + (isPlus ? '+' : '');
                                clearInterval(timer);
                            } else {
                                stat.textContent = (isK ? Math.floor(currentNumber) + 'K' : Math.floor(currentNumber)) + (isPlus ? '+' : '');
                            }
                        }, 30);
                    }
                });
                observer.unobserve(entry.target);
            }
        });
    };

    const statsObserver = new IntersectionObserver(animateStats, { threshold: 0.5 });
    statsObserver.observe(heroStats);
}

// ===== ANIMACIÓN DE ENTRADA PARA ELEMENTOS (INTERSECTION OBSERVER) =====
const animateElements = document.querySelectorAll('.animate-on-scroll');

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            entry.target.style.transitionDelay = `${index * 0.1}s`;
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
});

animateElements.forEach(el => observer.observe(el));

// ===== EFECTO DE HOVER 3D MEJORADO PARA CARDS =====
document.querySelectorAll('.service-card, .product-card').forEach(card => {
    card.addEventListener('mouseenter', function(e) {
        this.style.transition = 'transform 0.1s ease, box-shadow 0.3s ease';
    });
    
    card.addEventListener('mousemove', function(e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 15;
        const rotateY = (centerX - x) / 15;
        
        this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transition = 'transform 0.5s ease, box-shadow 0.3s ease';
        this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
    });
});

// ===== EFECTO RIPPLE EN BOTONES (FUNCIÓN GLOBAL) =====
function createRipple(button, event) {
    const ripple = document.createElement('span');
    ripple.classList.add('ripple-effect');
    
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    
    button.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
}

document.querySelectorAll('.btn, .tab-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
        createRipple(this, e);
    });
});

// ===== INICIALIZACIÓN Y MENSAJE EN CONSOLA =====
console.log('✨ Marjorie Peluquería - Sitio web cargado exitosamente');
console.log('🚀 Funciones activas: Filtrado, contador animado, formulario inteligente, galería interactiva y más');
console.log('💇‍♀️ ¡Listo para brillar en internet!');

// =====================================================
// ===== SISTEMA DE LOGIN PARA PANEL ADMINISTRADOR =====
// =====================================================

// Configuración de credenciales (en producción usar backend)
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'marjorie2024'
};

// Elementos del DOM para el login
const loginModal = document.getElementById('loginModal');
const loginOverlay = document.getElementById('loginOverlay');
const loginClose = document.getElementById('loginClose');
const loginForm = document.getElementById('loginForm');
const adminLink = document.getElementById('adminLink');
const togglePassword = document.getElementById('togglePassword');
const loginError = document.getElementById('loginError');
const loginErrorMessage = document.getElementById('loginErrorMessage');

// Función para abrir el modal de login
function abrirLoginModal(e) {
    e.preventDefault();
    loginModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Limpiar campos
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    loginError.classList.remove('show');
}

// Función para cerrar el modal de login
function cerrarLoginModal() {
    loginModal.classList.remove('active');
    document.body.style.overflow = '';
}

// Función para mostrar error
function mostrarError(mensaje) {
    loginErrorMessage.textContent = mensaje;
    loginError.classList.add('show');
    
    // Sacudir el formulario
    loginForm.style.animation = 'shake 0.5s ease';
    setTimeout(() => {
        loginForm.style.animation = '';
    }, 500);
}

// Función para verificar si ya hay sesión activa
function verificarSesion() {
    const sesion = sessionStorage.getItem('marjorieAdminSesion');
    const recordar = localStorage.getItem('marjorieAdminRecordar');
    
    if (sesion || recordar) {
        adminLink.innerHTML = '<i class="fas fa-user-shield"></i> Panel Admin';
        adminLink.classList.add('logged-in');
        adminLink.href = 'admin/admin.html';
        adminLink.removeEventListener('click', abrirLoginModal);
        adminLink.addEventListener('click', function(e) {
            // Ya tiene acceso directo
        });
    }
}

// Manejar login
if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('rememberMe').checked;
        
        // Validar campos vacíos
        if (!username || !password) {
            mostrarError('Por favor completa todos los campos');
            return;
        }
        
        // Verificar credenciales
        if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
            // Login exitoso
            console.log('✅ Login exitoso - Redirigiendo al panel de administración');
            
            // Guardar sesión
            sessionStorage.setItem('marjorieAdminSesion', 'activa');
            
            // Si seleccionó "Recordarme", guardar en localStorage
            if (rememberMe) {
                localStorage.setItem('marjorieAdminRecordar', 'activa');
                console.log('💾 Sesión guardada (recordar)');
            }
            
            // Mostrar animación de éxito
            const btnLogin = loginForm.querySelector('.btn-login');
            btnLogin.innerHTML = '<i class="fas fa-check-circle"></i> ¡Acceso Concedido!';
            btnLogin.style.background = '#4caf50';
            
            // Registrar en historial
            if (typeof datos !== 'undefined' && datos.historial) {
                datos.historial.push({
                    accion: 'Inicio de sesión',
                    descripcion: 'Administrador accedió al panel',
                    fecha: new Date().toISOString()
                });
                if (typeof guardarDatos === 'function') {
                    guardarDatos();
                }
            }
            
            // Redirigir al panel después de una pequeña pausa
            setTimeout(() => {
                window.location.href = 'admin/admin.html';
            }, 800);
            
        } else {
            // Login fallido
            mostrarError('Usuario o contraseña incorrectos');
            console.log('❌ Intento de login fallido');
            
            // Limpiar campo de contraseña
            document.getElementById('password').value = '';
            document.getElementById('password').focus();
        }
    });
}

// Toggle para mostrar/ocultar contraseña
if (togglePassword) {
    togglePassword.addEventListener('click', function() {
        const passwordInput = document.getElementById('password');
        const icon = this.querySelector('i');
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            passwordInput.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    });
}

// Event Listeners para abrir/cerrar modal
if (adminLink) {
    // Verificar si ya está autenticado
    verificarSesion();
    
    // Si no hay sesión, configurar para abrir el modal
    if (!sessionStorage.getItem('marjorieAdminSesion') && !localStorage.getItem('marjorieAdminRecordar')) {
        adminLink.addEventListener('click', abrirLoginModal);
    }
}

if (loginClose) {
    loginClose.addEventListener('click', cerrarLoginModal);
}

if (loginOverlay) {
    loginOverlay.addEventListener('click', cerrarLoginModal);
}

// Cerrar modal con tecla ESC
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && loginModal && loginModal.classList.contains('active')) {
        cerrarLoginModal();
    }
});

console.log('🔐 Sistema de login inicializado');
console.log('👤 Credenciales predeterminadas:');
console.log('   Usuario: admin');
console.log('   Contraseña: marjorie2024');
console.log('   ⚠️ Cambia estas credenciales en producción');