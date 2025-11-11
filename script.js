// Datos iniciales (se pueden modificar desde el admin)
const defaultData = {
    videos: {
        comandos: [],
        orinal: [],
        reactivos: [],
        trucos: []
    },
    config: {
        contactEmail: 'contacto@perrosguias.com',
        whatsappNumber: '521234567890',
        phoneNumber: '+521234567890',
        youtubeUrl: 'https://youtube.com',
        instagramUrl: 'https://instagram.com',
        facebookUrl: 'https://facebook.com'
    },
    login: {
        username: 'admin',
        password: 'admin123'
    }
};

// Cargar datos del localStorage o usar los predeterminados
function loadData() {
    const stored = localStorage.getItem('perrosGuiasData');
    if (stored) {
        return JSON.parse(stored);
    }
    return defaultData;
}

// Guardar datos en localStorage
function saveData(data) {
    localStorage.setItem('perrosGuiasData', JSON.stringify(data));
}

// Inicializar datos
let appData = loadData();

// Verificar si el usuario está logueado
function isLoggedIn() {
    return localStorage.getItem('perrosGuiasLoggedIn') === 'true';
}

// Función para extraer el ID de YouTube de una URL
function getYouTubeId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

// Función para generar el thumbnail de YouTube
function getYouTubeThumbnail(videoId) {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}

// Función para crear una tarjeta de video
function createVideoCard(video, category, index = null, showDelete = false) {
    const videoId = getYouTubeId(video.url);
    if (!videoId) return '';

    const thumbnail = getYouTubeThumbnail(videoId);
    const embedUrl = `https://www.youtube.com/embed/${videoId}`;
    const safeTitle = escapeHtml(video.title);
    const safeDescription = escapeHtml(video.description);
    const safeEmbedUrl = embedUrl.replace(/'/g, "\\'");

    const deleteBtn = showDelete && index !== null ? `
        <button class="video-card-delete" onclick="event.stopPropagation(); deleteVideo('${category}', ${index})" title="Eliminar video">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        </button>
    ` : '';

    const dataIndex = index !== null ? `data-index="${index}"` : '';
    const dataCategory = showDelete ? `data-category="${category}"` : '';
    
    return `
        <div class="video-card" data-video-url="${safeEmbedUrl}" data-video-title="${safeTitle}" ${dataIndex} ${dataCategory}>
            <div class="video-thumbnail" style="background: linear-gradient(135deg, #40E0D0, #FF7F50);">
                <img src="${thumbnail}" alt="${safeTitle}" 
                     style="width: 100%; height: 100%; object-fit: cover;"
                     onerror="this.onerror=null; this.style.display='none';">
                <div class="video-play-overlay"></div>
                ${deleteBtn}
            </div>
            <div class="video-info">
                <h3 class="video-title">${safeTitle}</h3>
                <p class="video-description">${safeDescription}</p>
            </div>
        </div>
    `;
}

// Función auxiliar para escapar HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Función para abrir modal de video
function openVideoModal(embedUrl, title) {
    const modal = document.createElement('div');
    modal.className = 'video-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        padding: 20px;
    `;
    
    const closeModal = () => {
        modal.remove();
        document.removeEventListener('keydown', handleEscKey);
    };
    
    const handleEscKey = (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    };
    
    modal.innerHTML = `
        <div style="position: relative; width: 100%; max-width: 900px;">
            <button onclick="document.querySelector('.video-modal')?.remove()" style="
                position: absolute;
                top: -40px;
                right: 0;
                background: white;
                border: none;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                font-size: 24px;
                cursor: pointer;
                z-index: 10001;
                transition: all 0.3s;
            ">×</button>
            <div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 10px; overflow: hidden;">
                <iframe 
                    src="${embedUrl}" 
                    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen>
                </iframe>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    document.addEventListener('keydown', handleEscKey);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Cerrar al hacer clic en el botón de cerrar
    const closeBtn = modal.querySelector('button');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }
}

// Render videos
function renderVideos() {
    const categoryMap = {
        'commands': { id: 'videosComandos', backend: 'comandos' },
        'potty': { id: 'videosOrinal', backend: 'orinal' },
        'reactive': { id: 'videosReactivos', backend: 'reactivos' },
        'tricks': { id: 'videosTrucos', backend: 'trucos' }
    };
    
    Object.keys(categoryMap).forEach(frontendCategory => {
        const { id, backend } = categoryMap[frontendCategory];
        const container = document.getElementById(id);
        if (container) {
            const videos = appData.videos[backend] || [];
            if (videos.length === 0) {
                container.innerHTML = '<p style="text-align: center; color: #999; padding: 2rem;">No videos available in this category.</p>';
            } else {
                container.innerHTML = videos.map(video => createVideoCard(video, backend)).join('');
                // Add event listeners to video cards
                container.querySelectorAll('.video-card').forEach(card => {
                    card.addEventListener('click', function() {
                        const videoUrl = this.getAttribute('data-video-url');
                        const videoTitle = this.getAttribute('data-video-title');
                        openVideoModal(videoUrl, videoTitle);
                    });
                });
            }
        }
    });
}

// Render admin videos
function renderAdminVideos() {
    const categoryMap = {
        'Comandos': { id: 'videosListComandos', backend: 'comandos' },
        'Orinal': { id: 'videosListOrinal', backend: 'orinal' },
        'Reactivos': { id: 'videosListReactivos', backend: 'reactivos' },
        'Trucos': { id: 'videosListTrucos', backend: 'trucos' }
    };
    
    Object.keys(categoryMap).forEach(frontendCategory => {
        const { id, backend } = categoryMap[frontendCategory];
        const container = document.getElementById(id);
        if (container) {
            const videos = appData.videos[backend] || [];
            if (videos.length === 0) {
                container.innerHTML = '<p style="text-align: center; color: #999; padding: 2rem;">No videos in this category. Click "Add Video" to get started.</p>';
            } else {
                // Display as card grid
                container.style.display = 'grid';
                container.style.gridTemplateColumns = 'repeat(auto-fill, minmax(280px, 1fr))';
                container.style.gap = '1.5rem';
                container.innerHTML = videos.map((video, index) => {
                    return createVideoCard(video, backend, index, true); // true = show delete button
                }).join('');
                
                // Add event listeners to video cards
                container.querySelectorAll('.video-card').forEach(card => {
                    const deleteBtn = card.querySelector('.video-card-delete');
                    if (deleteBtn) {
                        deleteBtn.addEventListener('click', (e) => {
                            e.stopPropagation();
                            const videoIndex = parseInt(card.getAttribute('data-index'));
                            if (!isNaN(videoIndex)) {
                                deleteVideo(backend, videoIndex);
                            }
                        });
                    }
                    
                    // Allow clicking on card to view video
                    card.addEventListener('click', function(e) {
                        if (!e.target.closest('.video-card-delete')) {
                            const videoUrl = this.getAttribute('data-video-url');
                            const videoTitle = this.getAttribute('data-video-title');
                            openVideoModal(videoUrl, videoTitle);
                        }
                    });
                });
            }
        }
    });
}

// Delete video
function deleteVideo(category, index) {
    if (confirm('Are you sure you want to delete this video?')) {
        appData.videos[category].splice(index, 1);
        saveData(appData);
        renderAdminVideos();
        renderVideos();
        showSuccessMessage('Video deleted successfully');
    }
}

// Agregar video
function addVideo(category, title, url, description) {
    if (!appData.videos[category]) {
        appData.videos[category] = [];
    }
    appData.videos[category].push({ title, url, description });
    saveData(appData);
    renderAdminVideos();
    renderVideos();
}

// Actualizar configuración
function updateConfig(key, value) {
    appData.config[key] = value;
    saveData(appData);
    applyConfig();
}

// Apply configuration
function applyConfig() {
    // Update social media links
    const youtubeLink = document.getElementById('youtubeLink');
    const instagramLink = document.getElementById('instagramLink');
    const facebookLink = document.getElementById('facebookLink');
    const whatsappLink = document.getElementById('whatsappLink');
    
    if (youtubeLink) youtubeLink.href = appData.config.youtubeUrl;
    if (instagramLink) instagramLink.href = appData.config.instagramUrl;
    if (facebookLink) facebookLink.href = appData.config.facebookUrl;
    if (whatsappLink) {
        const whatsappNum = appData.config.whatsappNumber.replace(/[^0-9]/g, '');
        whatsappLink.href = `https://wa.me/${whatsappNum}`;
    }
    const whatsappFloatEl = document.getElementById('whatsappFloat');
    if (whatsappFloatEl) {
        const whatsappNum = appData.config.whatsappNumber.replace(/[^0-9]/g, '');
        whatsappFloatEl.href = `https://wa.me/${whatsappNum}`;
    }

    // Update admin configuration fields
    const contactEmail = document.getElementById('contactEmail');
    const whatsappNumber = document.getElementById('whatsappNumber');
    const phoneNumber = document.getElementById('phoneNumber');
    const youtubeUrl = document.getElementById('youtubeUrl');
    const instagramUrl = document.getElementById('instagramUrl');
    const facebookUrl = document.getElementById('facebookUrl');
    
    if (contactEmail) contactEmail.value = appData.config.contactEmail;
    if (whatsappNumber) whatsappNumber.value = appData.config.whatsappNumber;
    if (phoneNumber) phoneNumber.value = appData.config.phoneNumber || '';
    if (youtubeUrl) youtubeUrl.value = appData.config.youtubeUrl;
    if (instagramUrl) instagramUrl.value = appData.config.instagramUrl;
    if (facebookUrl) facebookUrl.value = appData.config.facebookUrl;
}

// Smooth scrolling
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                // Close mobile menu if open
                const navMenu = document.getElementById('navMenu');
                if (navMenu) navMenu.classList.remove('active');
            }
        });
    });
}

// Tabs de servicios
function initServiceTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            
            // Remover active de todos los botones y contenidos
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Agregar active al botón y contenido seleccionado
            btn.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });
}

// Tabs de admin
function initAdminTabs() {
    const adminTabBtns = document.querySelectorAll('.admin-tab-btn');
    const adminTabContents = document.querySelectorAll('.admin-tab-content');

    adminTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-admin-tab');
            
            adminTabBtns.forEach(b => b.classList.remove('active'));
            adminTabContents.forEach(c => c.classList.remove('active'));
            
            btn.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });
}

// Function to show add video modal
function showAddVideoModal(category) {
    const modal = document.createElement('div');
    modal.className = 'add-video-modal';
    modal.innerHTML = `
        <div class="add-video-modal-content">
            <div class="add-video-modal-header">
                <h3>Add New Video</h3>
                <button class="add-video-modal-close" onclick="this.closest('.add-video-modal').remove()">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
            <form class="add-video-modal-form">
                <div class="form-group">
                    <label>Video Title</label>
                    <input type="text" class="modal-video-title" placeholder="e.g.: How to teach sit" required>
                </div>
                <div class="form-group">
                    <label>YouTube URL</label>
                    <input type="text" class="modal-video-url" placeholder="https://youtube.com/watch?v=..." required>
                </div>
                <div class="form-group">
                    <label>Description</label>
                    <textarea class="modal-video-desc" placeholder="Brief description of the video..." rows="4" required></textarea>
                </div>
                <div class="add-video-modal-actions">
                    <button type="button" class="btn-secondary" onclick="this.closest('.add-video-modal').remove()">Cancel</button>
                    <button type="submit" class="btn-primary">Add Video</button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Close on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
    
    // Close with ESC
    const handleEsc = (e) => {
        if (e.key === 'Escape') {
            modal.remove();
            document.removeEventListener('keydown', handleEsc);
        }
    };
    document.addEventListener('keydown', handleEsc);
    
    // Handle form submission
    const form = modal.querySelector('.add-video-modal-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = form.querySelector('.modal-video-title').value.trim();
        const url = form.querySelector('.modal-video-url').value.trim();
        const description = form.querySelector('.modal-video-desc').value.trim();
        
        if (title && url && description) {
            addVideo(category, title, url, description);
            modal.remove();
            document.removeEventListener('keydown', handleEsc);
            showSuccessMessage('Video added successfully');
        } else {
            alert('Please fill in all fields');
        }
    });
}

// Función para mostrar mensaje de éxito
function showSuccessMessage(message) {
    const messageEl = document.createElement('div');
    messageEl.className = 'success-message';
    messageEl.textContent = message;
    document.body.appendChild(messageEl);
    
    setTimeout(() => {
        messageEl.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        messageEl.classList.remove('show');
        setTimeout(() => messageEl.remove(), 300);
    }, 3000);
}

// Video forms in admin
function initVideoForms() {
    const categories = ['comandos', 'orinal', 'reactivos', 'trucos'];
    categories.forEach(category => {
        const manager = document.querySelector(`.video-manager[data-category="${category}"]`);
        if (manager) {
            // Hide old form
            const form = manager.querySelector('.video-form');
            if (form) {
                form.style.display = 'none';
            }
            
            // Hide h4 if exists
            const h4 = manager.querySelector('h4');
            if (h4) {
                h4.style.display = 'none';
            }
            
            // Add add video button if it doesn't exist
            if (!manager.querySelector('.add-video-btn')) {
                const addButton = document.createElement('button');
                addButton.className = 'add-video-btn';
                addButton.type = 'button';
                addButton.innerHTML = `
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Add Video
                `;
                addButton.addEventListener('click', () => showAddVideoModal(category));
                
                const videoManagerContent = manager.querySelector('.videos-list');
                if (videoManagerContent) {
                    manager.insertBefore(addButton, videoManagerContent);
                } else {
                    manager.appendChild(addButton);
                }
            }
        }
    });
}

// Botones de guardar configuración
function initConfigButtons() {
    document.querySelectorAll('.save-config-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const configType = btn.getAttribute('data-config');
            let input, key;
            
            switch(configType) {
                case 'email':
                    input = document.getElementById('contactEmail');
                    key = 'contactEmail';
                    break;
                case 'whatsapp':
                    input = document.getElementById('whatsappNumber');
                    key = 'whatsappNumber';
                    break;
                case 'phone':
                    input = document.getElementById('phoneNumber');
                    key = 'phoneNumber';
                    break;
                case 'youtube':
                    input = document.getElementById('youtubeUrl');
                    key = 'youtubeUrl';
                    break;
                case 'instagram':
                    input = document.getElementById('instagramUrl');
                    key = 'instagramUrl';
                    break;
                case 'facebook':
                    input = document.getElementById('facebookUrl');
                    key = 'facebookUrl';
                    break;
            }
            
            if (input && key) {
                updateConfig(key, input.value);
                showSuccessMessage('Settings saved successfully');
                applyConfig(); // Update links immediately
            }
        });
    });
}

// Login
function initLogin() {
    const loginModal = document.getElementById('loginModal');
    const loginBtnNav = document.getElementById('loginBtnNav');
    const loginModalClose = document.getElementById('loginModalClose');
    const loginForm = document.getElementById('loginForm');
    const loginContainer = document.getElementById('loginContainer');
    const adminPanel = document.getElementById('adminPanel');
    const logoutBtn = document.getElementById('logoutBtn');

    // Abrir modal de login (solo si no está logueado, o siempre para acceso)
    if (loginBtnNav) {
        const openModalHandler = () => {
            if (loginModal) {
                loginModal.classList.add('active');
                document.body.style.overflow = 'hidden';
                // Si está logueado, mostrar el panel; si no, mostrar el formulario
                if (isLoggedIn()) {
                    showAdminPanel();
                } else {
                    hideAdminPanel();
                }
            }
        };
        loginBtnNav.addEventListener('click', openModalHandler);
    }

    // Cerrar modal de login
    function closeLoginModal() {
        if (loginModal) {
            loginModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    if (loginModalClose) {
        loginModalClose.addEventListener('click', closeLoginModal);
    }

    // Cerrar al hacer clic fuera del modal
    if (loginModal) {
        loginModal.addEventListener('click', (e) => {
            if (e.target === loginModal) {
                closeLoginModal();
            }
        });
    }

    // Cerrar con ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && loginModal && loginModal.classList.contains('active')) {
            closeLoginModal();
        }
    });

    // Verificar estado de login al cargar
    // No abrir el modal automáticamente, pero preparar el estado
    if (isLoggedIn()) {
        showAdminPanel();
    } else {
        hideAdminPanel();
    }

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('usuario').value;
            const password = document.getElementById('password').value;
            
            if (username === appData.login.username && password === appData.login.password) {
                localStorage.setItem('perrosGuiasLoggedIn', 'true');
                showAdminPanel();
                showSuccessMessage('Login successful');
            } else {
                alert('Incorrect username or password');
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('perrosGuiasLoggedIn');
            hideAdminPanel();
            if (loginForm) loginForm.reset();
            showSuccessMessage('Signed out successfully');
            closeLoginModal();
        });
    }

    function showAdminPanel() {
        if (loginContainer) loginContainer.style.display = 'none';
        if (adminPanel) adminPanel.style.display = 'block';
        renderAdminVideos();
    }

    function hideAdminPanel() {
        if (loginContainer) loginContainer.style.display = 'block';
        if (adminPanel) adminPanel.style.display = 'none';
    }
}

// Contact form
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const nombre = document.getElementById('nombre').value;
            const email = document.getElementById('email').value;
            const mensaje = document.getElementById('mensaje').value;
            
            // Create mailto link
            const subject = encodeURIComponent(`Contact from website - ${nombre}`);
            const body = encodeURIComponent(`Name: ${nombre}\nEmail: ${email}\n\nMessage:\n${mensaje}`);
            const mailtoLink = `mailto:${appData.config.contactEmail}?subject=${subject}&body=${body}`;
            
            // Open email client
            window.location.href = mailtoLink;
            
            // Clear form
            contactForm.reset();
            
            alert('Thank you for contacting us. Your email client will open.');
        });
    }
}

// Hamburger menu
function initHamburgerMenu() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
        
        // Close menu when clicking on a link
        const navLinks = navMenu.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
            });
        });
    }
}

// Highlight active menu item based on scroll
function initActiveNavHighlight() {
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('.nav-link');
    
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.pageYOffset >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

// Handle missing images
function initImageFallback() {
    const portadaImage = document.getElementById('portadaImage');
    const biografiaImage = document.getElementById('biografiaImage');
    const logoImage = document.querySelector('.logo-image');
    
    if (portadaImage) {
        portadaImage.addEventListener('error', function() {
            this.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080"%3E%3Crect fill="%2340E0D0" width="1920" height="1080"/%3E%3Ctext x="50%25" y="50%25" font-size="48" fill="white" text-anchor="middle" dominant-baseline="middle"%3EHome%3C/text%3E%3C/svg%3E';
            this.alt = 'Home image not available';
        });
    }
    
    if (biografiaImage) {
        biografiaImage.addEventListener('error', function() {
            this.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="1280" height="720"%3E%3Crect fill="%23FF7F50" width="1280" height="720"/%3E%3Ctext x="50%25" y="50%25" font-size="32" fill="white" text-anchor="middle" dominant-baseline="middle"%3EAbout%3C/text%3E%3C/svg%3E';
            this.alt = 'About image not available';
        });
    }
    
    if (logoImage) {
        logoImage.addEventListener('error', function() {
            this.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="150" height="150"%3E%3Crect fill="%2340E0D0" width="150" height="150" rx="8"/%3E%3Ctext x="50%25" y="50%25" font-size="24" fill="white" text-anchor="middle" dominant-baseline="middle"%3ELogo%3C/text%3E%3C/svg%3E';
            this.alt = 'Logo not available';
        });
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initSmoothScroll();
    initServiceTabs();
    initAdminTabs();
    initVideoForms();
    initConfigButtons();
    initLogin();
    initContactForm();
    initHamburgerMenu();
    initActiveNavHighlight();
    initImageFallback();
    applyConfig();
    renderVideos();
    
    // If logged in, also render admin videos
    if (isLoggedIn()) {
        renderAdminVideos();
    }
});

// Save initial data if it doesn't exist
if (!localStorage.getItem('perrosGuiasData')) {
    saveData(defaultData);
}
