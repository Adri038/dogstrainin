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
        whatsappNumber: '19045637550',
        phoneNumber: '+521234567890',
        youtubeUrl: 'https://youtube.com',
        instagramUrl: 'https://instagram.com',
        facebookUrl: 'https://facebook.com'
    },
    login: {
        username: 'admin',
        password: 'admin123'
    },
    texts: {
        home: [
            "We are so glad you stopped by our webpage!",
            "Our main goal is to make you and your pup a better functioning, safe team.",
            "We begin our instruction in your home.  This allows me to see your house and dog in action.  We will discuss your ideas and what you want from our sessions.",
            "We can start in the first session with beginning commands:  sit, down, touch/boop.  From there, we can create a teaching schedule the whole family can be part of.",
            "Learning for a dog can have its limitations as a human learning, patience, and repetition.  I was taught Positive Reinforcement; this is safer and keeps your dog attentive.  Reach out on our contact page, and I will get back with you!  You are going to make a great team!"
        ],
        about: [
            "It's a dog's world!",
            "They are great animals who give their love so freely and never ask anything in return. Dogs have always been a part of my life.  When I was a child, I rode horses in playdays, rodeos and showed steers in 4-H.  But I always had a dog with me.",
            "Canine obedience training is a goal I had always set for myself but never set the time.  Now as I move forward toward my goal, I feel encouraged by the learning I have received.  I can see the dog in its truest form, a helper and a companion.",
            "It is more important than ever to have a well-behaved dog in our society; whether flying, going to the dog park, or simply walking down the street.  Well-mannered dogs are noticeable as they saunter down the street, they receive smiles and \"may I pet your dog\".  They are a child to be proud of!  Not just our pride, but safety:  an untrained dog could shake out of his/her collar and bolt into traffic!  Will they return to you when you call?",
            "Our dogs want to respect us and follow the leader while being taught. Now is your time to teach your dog to follow \"you\" the leader.",
            "I am a certified professional trainer with memberships in leading canine training organizations and certifications in positive reinforcement training methods."
        ],
        services: [
            "We come to your home. This enables me to know the hierarchy in the home, where the dog's place is. And you are there with us, so you learn alongside your dog! During our phone conversation we can discuss what you need to help your relationship with the dog."
        ],
        concierge: [
            "In our ever-demanding world, the needs of family and the fur-baby are increasing. In an effort to ease this stress of our clients, we would like to introduce \"Puppy Concierge\". We will help fur-baby parents by performing smaller tasks that add up. Picking up or dropping off at daycare, vet drop-offs, pup cup emergencies! Let us help you as we get to know you and your pet better!"
        ],
        boarding: [
            "Coming soon"
        ]
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
            <div class="video-thumbnail" style="background: linear-gradient(135deg, #40E0D0, #20B2AA);">
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
        let whatsappNum = appData.config.whatsappNumber.replace(/[^0-9]/g, '');
        // Si el número no empieza con código de país, agregar 1 (USA)
        if (whatsappNum && !whatsappNum.startsWith('1') && whatsappNum.length === 10) {
            whatsappNum = '1' + whatsappNum;
        }
        // Asegurar que el número tenga el formato correcto
        if (!whatsappNum) {
            whatsappNum = '19045637550'; // Número por defecto
        }
        whatsappFloatEl.href = `https://wa.me/${whatsappNum}`;
        // Forzar actualización del href
        whatsappFloatEl.setAttribute('href', `https://wa.me/${whatsappNum}`);
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

// Smooth scrolling (only for anchors on the same page)
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            // Only prevent default if the anchor exists on the current page
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                // Close mobile menu if open
                const navMenu = document.getElementById('navMenu');
                if (navMenu) navMenu.classList.remove('active');
            }
            // If anchor doesn't exist, let the browser handle it normally (navigate to page)
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
        initTextEditor(); // Initialize text editor when panel is shown
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

// Highlight active menu item based on current page
function initActiveNavHighlight() {
    const navLinks = document.querySelectorAll('.nav-link');
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        const linkHref = link.getAttribute('href');
        // Check if the link matches the current page
        if (linkHref === currentPage || (currentPage === '' && linkHref === 'index.html')) {
            link.classList.add('active');
        }
    });
    
    // Also handle scroll-based highlighting for anchors on the same page
    const sections = document.querySelectorAll('.section');
    if (sections.length > 0) {
        window.addEventListener('scroll', () => {
            let current = '';
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;
                if (window.pageYOffset >= sectionTop - 200) {
                    current = section.getAttribute('id');
                }
            });
            
            // Only update if we're on a page with sections
            if (current) {
                navLinks.forEach(link => {
                    const linkHref = link.getAttribute('href');
                    // Only update if it's an anchor link
                    if (linkHref.startsWith('#')) {
                        link.classList.remove('active');
                        if (linkHref === `#${current}`) {
                            link.classList.add('active');
                        }
                    }
                });
            }
        });
    }
}

// Handle missing images
function initImageFallback() {
    const portadaImage = document.getElementById('portadaImage');
    const biografiaImage = document.getElementById('biografiaImage');
    const logoImage = document.querySelector('.logo-image');
    const slideshowImages = document.querySelectorAll('.slideshow-image');
    
    if (portadaImage) {
        portadaImage.addEventListener('error', function() {
            this.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080"%3E%3Crect fill="%2340E0D0" width="1920" height="1080"/%3E%3Ctext x="50%25" y="50%25" font-size="48" fill="white" text-anchor="middle" dominant-baseline="middle"%3EHome%3C/text%3E%3C/svg%3E';
            this.alt = 'Home image not available';
        });
    }
    
    if (biografiaImage) {
        biografiaImage.addEventListener('error', function() {
            this.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="1280" height="720"%3E%3Crect fill="%2320B2AA" width="1280" height="720"/%3E%3Ctext x="50%25" y="50%25" font-size="32" fill="white" text-anchor="middle" dominant-baseline="middle"%3EAbout%3C/text%3E%3C/svg%3E';
            this.alt = 'About image not available';
        });
    }
    
    if (logoImage) {
        logoImage.addEventListener('error', function() {
            this.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="150" height="150"%3E%3Crect fill="%2340E0D0" width="150" height="150" rx="8"/%3E%3Ctext x="50%25" y="50%25" font-size="24" fill="white" text-anchor="middle" dominant-baseline="middle"%3ELogo%3C/text%3E%3C/svg%3E';
            this.alt = 'Logo not available';
        });
    }
    
    // Handle slideshow images
    slideshowImages.forEach(img => {
        img.addEventListener('error', function() {
            const slide = this.closest('.slideshow-slide');
            if (slide) {
                slide.style.display = 'none';
            }
        });
    });
}

// Slideshow functionality
function initSlideshow() {
    const slides = document.querySelectorAll('.slideshow-slide');
    if (slides.length === 0) return;
    
    let currentSlide = 0;
    let slideshowInterval;
    
    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.classList.remove('active');
            if (i === index) {
                // Small delay to ensure smooth transition
                setTimeout(() => {
                    slide.classList.add('active');
                }, 50);
            }
        });
    }
    
    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }
    
    function prevSlide() {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(currentSlide);
    }
    
    function startSlideshow() {
        // Clear existing interval
        if (slideshowInterval) {
            clearInterval(slideshowInterval);
        }
        // Change slide every 6 seconds for slower, smoother transitions
        slideshowInterval = setInterval(nextSlide, 6000);
    }
    
    function stopSlideshow() {
        if (slideshowInterval) {
            clearInterval(slideshowInterval);
        }
    }
    
    // Initialize first slide
    showSlide(0);
    startSlideshow();
    
    // Add event listeners to control buttons
    const prevBtn = document.getElementById('slideshowPrev');
    const nextBtn = document.getElementById('slideshowNext');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            prevSlide();
            stopSlideshow();
            startSlideshow(); // Restart timer
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            nextSlide();
            stopSlideshow();
            startSlideshow(); // Restart timer
        });
    }
}

// Load and apply page texts
function loadPageTexts() {
    const texts = appData.texts || {};
    
    // Apply texts to all editable elements
    document.querySelectorAll('.editable-text').forEach(element => {
        const page = element.getAttribute('data-page');
        const index = parseInt(element.getAttribute('data-index'));
        
        if (texts[page] && texts[page][index] !== undefined) {
            element.textContent = texts[page][index];
        }
    });
}

// Load texts into editor
function loadTextsIntoEditor() {
    const texts = appData.texts || {};
    
    // Load all text inputs
    document.querySelectorAll('.text-editor-input').forEach(input => {
        const page = input.getAttribute('data-page');
        const index = parseInt(input.getAttribute('data-index'));
        
        if (texts[page] && texts[page][index] !== undefined) {
            input.value = texts[page][index];
        }
    });
}

// Save texts from editor
function saveTexts(page) {
    const inputs = document.querySelectorAll(`.text-editor-input[data-page="${page}"]`);
    const texts = [];
    
    inputs.forEach(input => {
        const index = parseInt(input.getAttribute('data-index'));
        texts[index] = input.value.trim();
    });
    
    // Remove undefined entries
    const cleanTexts = texts.filter(text => text !== undefined && text !== '');
    
    if (!appData.texts) {
        appData.texts = {};
    }
    
    appData.texts[page] = cleanTexts;
    saveData(appData);
    loadPageTexts(); // Apply changes immediately
    showSuccessMessage(`${page.charAt(0).toUpperCase() + page.slice(1)} texts saved successfully!`);
}

// Initialize text editor tabs
function initTextEditorTabs() {
    const tabBtns = document.querySelectorAll('.text-edit-tab-btn');
    const tabContents = document.querySelectorAll('.text-edit-tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-text-tab');
            
            // Remove active from all buttons and contents
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active to clicked button and corresponding content
            btn.classList.add('active');
            const targetContent = document.getElementById(targetTab);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });
}

// Initialize text editor
function initTextEditor() {
    // Load texts into editor when admin panel is shown
    loadTextsIntoEditor();
    
    // Initialize tabs
    initTextEditorTabs();
    
    // Add save button listeners
    document.querySelectorAll('.save-texts-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const page = btn.getAttribute('data-page');
            saveTexts(page);
        });
    });
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
    initSlideshow();
    applyConfig();
    renderVideos();
    loadPageTexts(); // Load saved texts
    
    // If logged in, also render admin videos and init text editor
    if (isLoggedIn()) {
        renderAdminVideos();
        initTextEditor();
    }
});

// Save initial data if it doesn't exist
if (!localStorage.getItem('perrosGuiasData')) {
    saveData(defaultData);
}
