// ==========================================================================
// BACKGROUND PARTICLES SYSTEM (HEARTS AND SPARKLES)
// ==========================================================================
const canvas = document.getElementById('particles-canvas');
const ctx = canvas.getContext('2d');

let particles = [];
const maxParticles = 40;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Particle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height + Math.random() * 100;
        this.size = Math.random() * 15 + 5;
        this.speedY = -(Math.random() * 1.5 + 0.5);
        this.speedX = Math.sin(Math.random() * 2) * 0.5;
        this.opacity = Math.random() * 0.5 + 0.2;
        this.type = Math.random() > 0.45 ? 'heart' : 'star';
        // Soft pink, red, and gold shades
        const colors = ['#ff668f', '#ff3366', '#ffd700', '#ffccd5'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
        this.y += this.speedY;
        this.x += this.speedX;
        
        // Fade out as it goes up
        if (this.y < 0) {
            this.reset();
        }
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;

        if (this.type === 'heart') {
            // Draw a cute simple heart shape
            ctx.beginPath();
            const topCurveHeight = this.size * 0.3;
            ctx.moveTo(this.x, this.y + topCurveHeight);
            // Top left curve
            ctx.bezierCurveTo(
                this.x - this.size / 2, this.y - topCurveHeight, 
                this.x - this.size, this.y + this.size / 3, 
                this.x, this.y + this.size
            );
            // Top right curve
            ctx.bezierCurveTo(
                this.x + this.size, this.y + this.size / 3, 
                this.x + this.size / 2, this.y - topCurveHeight, 
                this.x, this.y + topCurveHeight
            );
            ctx.closePath();
            ctx.fill();
        } else {
            // Draw a simple 4-point sparkle star
            ctx.beginPath();
            ctx.moveTo(this.x, this.y - this.size);
            ctx.quadraticCurveTo(this.x, this.y, this.x + this.size, this.y);
            ctx.quadraticCurveTo(this.x, this.y, this.x, this.y + this.size);
            ctx.quadraticCurveTo(this.x, this.y, this.x - this.size, this.y);
            ctx.quadraticCurveTo(this.x, this.y, this.x, this.y - this.size);
            ctx.closePath();
            ctx.fill();
        }
        ctx.restore();
    }
}

// Initialize particles
for (let i = 0; i < maxParticles; i++) {
    particles.push(new Particle());
    // Scatter them vertically at the beginning
    particles[i].y = Math.random() * canvas.height;
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    requestAnimationFrame(animateParticles);
}
animateParticles();

// ==========================================================================
// STATE MANAGEMENT & DATA
// ==========================================================================
let currentStepId = 'step-invitation';
let selectedPlan = null;
let selectedPlace = null;
let customPlanText = null;
let customPlaceText = null;

// Medellín places options per plan
const placesDatabase = {
    cena: [
        {
            id: 'colosal',
            name: 'restaurante de la esquina (tu casita) 🍷',
            description: 'me gusta la de ahi.'
        },
        {
            id: 'elcielo',
            name: 'El Cielo (El Poblado, no me alcanza pero por ti lo q sea) ✨',
            description: 'Experiencia multisensorial única de cocina colombiana de vanguardia.'
        },
        {
            id: 'ocimde',
            name: 'Oci.Mde (El Poblado, lo mismo q el cielo) 🥩',
            description: 'Platos modernos preparados a fuego lento, con un ambiente súper íntimo y acogedor.'
        }
    ],
    picnic: [
        {
            id: 'jardin-botanico',
            name: 'Jardín Botánico 🌸',
            description: 'Picnic bajo la sombra de árboles inmensos cerca del Orquideorama.'
        },
        {
            id: 'parque-arvi',
            name: 'Parque Arví (Santa Elena) 🌲',
            description: 'Aire puro, pinos y el clima frío ideal para acurrucarse en un mantel.'
        },
        {
            id: 'parque-el-salado',
            name: 'Parque El Salado (Envigado) 🍃',
            description: 'Naturaleza pura, senderos ecológicos y la tranquilidad del agua corriendo.'
        }
    ],
    cafe: [
        {
            id: 'pergamino',
            name: 'Pergamino (Laureles aca si pq el cafe es mas barato) ☕',
            description: 'El café de especialidad favorito, postres deliciosos y una terraza hermosa.'
        },
        {
            id: 'rituales',
            name: 'Rituales (Laureles aqui tambien ) 🍰',
            description: 'Café de excelente calidad con una gran historia social y repostería espectacular.'
        },
        {
            id: 'hija-mia',
            name: 'Hija Mía (El Poblado aqui masomenos) 🥑',
            description: 'Café tostado localmente y un ambiente encantador de brunch y postres.'
        }
    ],
    mirador: [
        {
            id: 'las-palmas',
            name: 'Mirador Las Palmas (creo q no he ido)',
            description: 'La clásica noche de chocolate con queso, fresas con crema y luces de la ciudad.'
        },
        {
            id: 'san-felix',
            name: 'Mirador San Félix (tampoco)',
            description: 'Sentir el viento fuerte y ver toda la inmensidad de Medellín iluminada a tus pies.'
        },
        {
            id: 'terraza-tesoro',
            name: 'Terraza El Tesoro (menos)',
            description: 'Una vista privilegiada de la ciudad con la comodidad de cafés y heladerías excelentes.'
        }
    ],
    aventura: [
        {
            id: 'guatape',
            name: 'Paseo a Guatapé ⛵',
            description: 'Subir a la Piedra del Peñol, comer trucha deliciosa y dar una vuelta en lancha.'
        },
        {
            id: 'explora',
            name: 'Parque Explora & Planetario 🚀',
            description: 'Un día súper divertido interactuando con la ciencia, el acuario y viendo las estrellas.'
        },
        {
            id: 'arvi-trek',
            name: 'Senderismo en Parque Arví 🥾',
            description: 'Caminar entre senderos ecológicos gigantes y respirar aire puro de bosque.'
        }
    ],
    cine: [
        {
            id: 'cine-vip',
            name: 'Cine VIP (El Tesoro u Oviedo) 🍿',
            description: 'Sillas reclinables espectaculares, comida deliciosa a la mesa y máxima comodidad.'
        },
        {
            id: 'cine-estrellas',
            name: 'Cine a Cielo Abierto 🌌',
            description: 'Ver una gran película bajo las estrellas con mantita y palomitas.'
        },
        {
            id: 'cine-casa',
            name: 'Maratón de Pelis en Casa 🎬',
            description: 'Tu película o serie favorita, cobijas gigantes, pizza y snacks ilimitados.'
        }
    ],
    juegos: [
        {
            id: 'bolos-mde',
            name: 'Bolos (Bowlerama / Monterrey) 🎳',
            description: 'Un juego competitivo súper divertido con comida rápida y malteadas.'
        },
        {
            id: 'arcade-tesoro',
            name: 'Arcade & Videojuegos 🕹️',
            description: 'Jugar clásicos de maquinitas, simuladores de carreras y ganar tickets juntos.'
        },
        {
            id: 'juegos-casa',
            name: 'Noche de Juegos de Mesa 🎲',
            description: 'Competir en Monopoly, Jenga o cartas comiendo cositas ricas en casa.'
        }
    ],
    cocinar: [
        {
            id: 'pizza-casera',
            name: 'Preparar Pizza Casera 🍕',
            description: 'Hacer la masa desde cero y ponerle nuestros ingredientes favoritos.'
        },
        {
            id: 'sushi-casa',
            name: 'Hacer Sushi en Pareja 🍣',
            description: 'Aprender a enrollar nuestro propio sushi y pasar un rato divertido comiendo rico.'
        },
        {
            id: 'hornear-galletas',
            name: 'Hornear Galletas con Chispas 🍪',
            description: 'Llenar la cocina de harina, hornear galletas y comerlas calientes con leche.'
        }
    ]
};

// Friendly names for plans
const planNames = {
    cena: 'Cena Romántica ✨',
    picnic: 'Picnic al Aire Libre 🧺',
    cafe: 'Tarde de Café & Postre ☕',
    mirador: 'Mirador & Luces 🌅',
    aventura: 'Día de Aventura 🧭',
    cine: 'Noche de Películas 🎬',
    juegos: 'Bolos & Arcade 🎮',
    cocinar: 'Cocinar Juntos 🍳'
};

// ==========================================================================
// EVASIVE BUTTON LOGIC ("NO" BUTTON)
// ==========================================================================
const btnNo = document.getElementById('btn-no');

function moveButton() {
    // Add custom class for fixed positioning once hovered/touched
    if (!btnNo.classList.contains('btn-evasive')) {
        btnNo.classList.add('btn-evasive');
    }

    const buttonWidth = btnNo.offsetWidth;
    const buttonHeight = btnNo.offsetHeight;

    // Get viewport boundaries (leaving padding to avoid overflow)
    const padding = 30;
    const maxX = window.innerWidth - buttonWidth - padding;
    const maxY = window.innerHeight - buttonHeight - padding;

    // Calculate a random location
    let newX = Math.random() * maxX;
    let newY = Math.random() * maxY;

    // Ensure it doesn't spawn off-screen
    newX = Math.max(padding, Math.min(newX, maxX));
    newY = Math.max(padding, Math.min(newY, maxY));

    // Update coordinates
    btnNo.style.left = `${newX}px`;
    btnNo.style.top = `${newY}px`;
}

// Trigger movement on mouse hover & mobile screen touch
btnNo.addEventListener('mouseover', moveButton);
btnNo.addEventListener('touchstart', (e) => {
    e.preventDefault(); // Prevents default click behavior on touch
    moveButton();
});

// ==========================================================================
// FLOW TRANSITIONS
// ==========================================================================
function navigateTo(targetStepId) {
    const currentStep = document.getElementById(currentStepId);
    const targetStep = document.getElementById(targetStepId);

    // Fade out current
    currentStep.style.opacity = '0';
    currentStep.style.transform = 'translateY(-20px) scale(0.98)';

    setTimeout(() => {
        currentStep.classList.remove('active');
        currentStep.style.display = 'none';

        // Prepare target
        targetStep.style.display = 'block';
        // Trigger reflow
        targetStep.offsetHeight;
        
        targetStep.classList.add('active');
        targetStep.style.opacity = '1';
        targetStep.style.transform = 'translateY(0) scale(1)';
        
        currentStepId = targetStepId;
    }, 400);
}

// Handle "Sí" acceptance
const btnSi = document.getElementById('btn-si');
btnSi.addEventListener('click', () => {
    // Remove fixed positioning of "No" if she was trying to touch it
    btnNo.style.display = 'none';
    
    // Confetti burst!
    if (typeof confetti === 'function') {
        confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.6 }
        });
        
        // Extra hearts/stars confetti
        setTimeout(() => {
            confetti({
                particleCount: 80,
                angle: 60,
                spread: 55,
                origin: { x: 0 }
            });
            confetti({
                particleCount: 80,
                angle: 120,
                spread: 55,
                origin: { x: 1 }
            });
        }, 300);
    }
    
    navigateTo('step-celebration');
});

// Start celebration button (Goes to Gallery)
document.getElementById('btn-start-celebration').addEventListener('click', () => {
    navigateTo('step-gallery');
});

// Gallery Next button (Goes to Plan Selection)
document.getElementById('btn-gallery-next').addEventListener('click', () => {
    navigateTo('step-plan');
});

// ==========================================================================
// DYNAMIC GALLERY GENERATION
// ==========================================================================
const galleryImages = ["IMG_0647.jpg","IMG_0648.jpg","IMG_0649.jpg","IMG_1220.jpg","IMG_1225.jpg","IMG_1249.jpg","IMG_1250.jpg","IMG_1259.jpg","IMG_1260.jpg","IMG_1358.jpg","IMG_1359.jpg","IMG_1360.jpg","IMG_1361.jpg","IMG_1362.jpg","IMG_1363.jpg","IMG_1364.jpg","IMG_1365.jpg","IMG_1366.jpg","IMG_1367.jpg","IMG_1368.jpg","IMG_1369.jpg","IMG_2444.jpg","IMG_2445.jpg","IMG_2452.jpg","IMG_2453.jpg","IMG_2455.jpg","IMG_2456.jpg","IMG_2457.jpg","IMG_2458.jpg","IMG_2460.jpg","IMG_2463.jpg","IMG_2464.jpg","IMG_2519.jpg","IMG_2760.jpg","IMG_2761.jpg","IMG_2763.jpg","IMG_2764.jpg","IMG_2765.jpg","IMG_2766.jpg","IMG_2767.jpg","IMG_2771.jpg","IMG_2772.jpg","IMG_2777.jpg","IMG_2835.jpg","IMG_2888.jpg","IMG_2889.jpg","IMG_2890.jpg","IMG_2891.jpg","IMG_2892.jpg","IMG_2893.jpg","IMG_2894.jpg","IMG_2895.jpg","IMG_2896.jpg","IMG_2897.jpg","IMG_2898.jpg","IMG_2900.jpg","IMG_2901.jpg","IMG_2902.jpg","IMG_2903.jpg","IMG_2904.jpg","IMG_2905.jpg","IMG_2906.jpg","IMG_2907.jpg","IMG_2908.jpg","IMG_2909.jpg","IMG_2910.jpg","IMG_2911.jpg","IMG_2912.jpg","IMG_2915.jpg","IMG_2926.jpg","IMG_2933.jpg","IMG_2934.jpg","IMG_2935.jpg","IMG_2936.jpg","IMG_2937.jpg","IMG_2938.jpg","IMG_2939.jpg","IMG_2940.jpg","IMG_2941.jpg","IMG_2942.jpg","IMG_2943.jpg","IMG_2944.jpg","IMG_2945.jpg","IMG_2946.jpg","IMG_2947.jpg","IMG_2948.jpg","IMG_2950.jpg","IMG_2951.jpg","IMG_3122.jpg","IMG_3123.jpg","IMG_3124.jpg","IMG_3125.jpg","IMG_3126.jpg","IMG_3128.jpg","IMG_3129.jpg","IMG_3130.jpg","IMG_3160.jpg","IMG_3163.jpg","IMG_3164.jpg","IMG_3930.jpg","IMG_3937.jpg","IMG_3938.jpg","IMG_3939.jpg","IMG_3940.jpg","IMG_3941.jpg","IMG_4517.jpg","IMG_4518.jpg","IMG_4532.jpg","IMG_4533.jpg","IMG_4534.jpg","IMG_4696.jpg","IMG_4697.jpg","IMG_4698.jpg","IMG_4699.jpg","IMG_4700.jpg","IMG_4701.jpg","IMG_4702.jpg","IMG_4834.jpg","IMG_5005.jpg","IMG_5008.jpg","IMG_5039.jpg","IMG_5040.jpg","IMG_5042.jpg","IMG_5045.jpg","IMG_5046.jpg","IMG_5048.jpg","IMG_5062.jpg","IMG_5064.jpg","IMG_5070.jpg","IMG_5072.jpg","IMG_5073.jpg","IMG_5080.jpg","IMG_5369.jpg","IMG_5370.jpg","IMG_5372.jpg","IMG_5627.jpg","IMG_7045.jpg"];

const captions = [
    "Tú y yo... ❤️",
    "Momento favorito ✨",
    "Contigo siempre 🥰",
    "Mi lugar feliz 💖",
    "Haces mi mundo brillar 🌟",
    "Te amo cada día más 💕",
    "Risas infinitas con mi amor 💫",
    "El amor de mi vida 🌹",
    "Creando recuerdos inolvidables 🥂",
    "Mi persona favorita del universo 🌌",
    "Cada segundo vale la pena junto a ti ⏱️❤️",
    "Coleccionando momentos especiales con el amor de mi vida 📸✨"
];

const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxCaption = document.getElementById('lightbox-caption');
const lightboxClose = document.querySelector('.lightbox-close');

function generateGallery() {
    const container = document.getElementById('gallery-container');
    if (!container) return;

    galleryImages.forEach((filename, index) => {
        const card = document.createElement('div');
        card.className = 'polaroid-card';
        
        // Alternating tilted angles
        const rotation = (index % 3 === 0) ? 1.5 : (index % 2 === 0 ? 2 : -2);
        card.style.setProperty('--rotation', `${rotation}deg`);

        const img = document.createElement('img');
        img.src = `images/${filename}`;
        img.alt = `Recuerdo ${index + 1}`;
        img.loading = 'lazy'; // Performance boost

        const captionDiv = document.createElement('div');
        captionDiv.className = 'polaroid-caption';
        captionDiv.textContent = captions[index % captions.length];

        card.appendChild(img);
        card.appendChild(captionDiv);

        // Click zoom event
        card.addEventListener('click', () => {
            lightbox.style.display = 'block';
            lightboxImg.src = img.src;
            lightboxCaption.textContent = captionDiv.textContent;
        });

        container.appendChild(card);
    });
}

// Generate the gallery
generateGallery();

lightboxClose.addEventListener('click', () => {
    lightbox.style.display = 'none';
});

lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target === lightboxClose) {
        lightbox.style.display = 'none';
    }
});

// ==========================================================================
// PLAN SELECTION (STEP 1)
// ==========================================================================
const planCards = document.querySelectorAll('.plan-card');
const btnPlanNext = document.getElementById('btn-plan-next');
const customPlanWrapper = document.getElementById('custom-plan-wrapper');
const customPlanInput = document.getElementById('custom-plan-input');

function checkCustomPlanValidity() {
    if (selectedPlan === 'personalizado') {
        const val = customPlanInput.value.trim();
        if (val) {
            customPlanText = val;
            btnPlanNext.classList.remove('btn-disabled');
            btnPlanNext.removeAttribute('disabled');
        } else {
            customPlanText = null;
            btnPlanNext.classList.add('btn-disabled');
            btnPlanNext.setAttribute('disabled', 'true');
        }
    }
}

customPlanInput.addEventListener('input', checkCustomPlanValidity);

planCards.forEach(card => {
    card.addEventListener('click', () => {
        // Clear active classes
        planCards.forEach(c => c.classList.remove('selected'));
        // Select clicked card
        card.classList.add('selected');
        
        selectedPlan = card.getAttribute('data-plan');

        if (selectedPlan === 'personalizado') {
            // Show custom plan textarea, disable next until filled
            customPlanWrapper.style.display = 'block';
            customPlanInput.focus();
            btnPlanNext.classList.add('btn-disabled');
            btnPlanNext.setAttribute('disabled', 'true');
            checkCustomPlanValidity();
        } else {
            // Hide custom plan textarea, enable next button normally
            customPlanWrapper.style.display = 'none';
            customPlanText = null;
            btnPlanNext.classList.remove('btn-disabled');
            btnPlanNext.removeAttribute('disabled');
        }
    });
});

btnPlanNext.addEventListener('click', () => {
    if (selectedPlan) {
        if (selectedPlan === 'personalizado') {
            customPlanText = customPlanInput.value.trim();
        }
        populatePlaces();
        navigateTo('step-place');
    }
});

// ==========================================================================
// PLACE SELECTION (STEP 2)
// ==========================================================================
const placesContainer = document.getElementById('places-container');
const btnPlaceNext = document.getElementById('btn-place-next');
const btnPlaceBack = document.getElementById('btn-place-back');

function populatePlaces() {
    // Clear container
    placesContainer.innerHTML = '';
    selectedPlace = null;
    customPlaceText = null;
    btnPlaceNext.classList.add('btn-disabled');
    btnPlaceNext.setAttribute('disabled', 'true');

    if (selectedPlan === 'personalizado') {
        // Show a freeform input for location
        placesContainer.innerHTML = `
            <div class="custom-place-prompt">
                <div class="custom-place-icon"><i class="bi bi-geo-alt"></i></div>
                <p class="custom-place-hint">Cuéntame, ¿a dónde te gustaría que fuéramos? 📍</p>
                <div class="message-input-wrapper" style="text-align:left; width:100%;">
                    <label for="custom-place-input" class="input-label">Nombre del lugar o dirección</label>
                    <textarea id="custom-place-input" rows="2" placeholder="Ej: La pizzería de la esquina, tu casa, el parque central..."></textarea>
                </div>
            </div>
        `;
        const customPlaceInput = document.getElementById('custom-place-input');
        customPlaceInput.addEventListener('input', () => {
            const val = customPlaceInput.value.trim();
            if (val) {
                customPlaceText = val;
                selectedPlace = val;
                btnPlaceNext.classList.remove('btn-disabled');
                btnPlaceNext.removeAttribute('disabled');
            } else {
                customPlaceText = null;
                selectedPlace = null;
                btnPlaceNext.classList.add('btn-disabled');
                btnPlaceNext.setAttribute('disabled', 'true');
            }
        });
        return;
    }

    const places = placesDatabase[selectedPlan];
    
    places.forEach(place => {
        const placeCard = document.createElement('div');
        placeCard.className = 'place-card';
        placeCard.setAttribute('data-place', place.name);
        placeCard.innerHTML = `
            <div class="card-icon"><i class="bi bi-geo-alt-fill"></i></div>
            <h3>${place.name}</h3>
            <p>${place.description}</p>
            <span class="select-indicator"><i class="bi bi-circle"></i> Seleccionar</span>
        `;
        
        placeCard.addEventListener('click', () => {
            document.querySelectorAll('.place-card').forEach(c => c.classList.remove('selected'));
            placeCard.classList.add('selected');
            selectedPlace = place.name;
            
            // Enable next button
            btnPlaceNext.classList.remove('btn-disabled');
            btnPlaceNext.removeAttribute('disabled');
        });
        
        placesContainer.appendChild(placeCard);
    });
}

btnPlaceBack.addEventListener('click', () => {
    navigateTo('step-plan');
});

btnPlaceNext.addEventListener('click', () => {
    if (selectedPlace) {
        generateSummary();
        navigateTo('step-summary');
    }
});

// ==========================================================================
// SUMMARY AND WHATSAPP (STEP 3)
// ==========================================================================
const btnSummaryBack = document.getElementById('btn-summary-back');
const btnWhatsapp = document.getElementById('btn-whatsapp');

function generateSummary() {
    const planDisplay = selectedPlan === 'personalizado'
        ? `Plan personalizado: ${customPlanText}`
        : planNames[selectedPlan];
    document.getElementById('summary-plan-val').textContent = planDisplay;
    document.getElementById('summary-place-val').textContent = selectedPlace;
}

btnSummaryBack.addEventListener('click', () => {
    navigateTo('step-place');
});

btnWhatsapp.addEventListener('click', () => {
    const customMessage = document.getElementById('custom-msg').value.trim();
    
    const planDisplay = selectedPlan === 'personalizado'
        ? `Plan personalizado: ${customPlanText}`
        : planNames[selectedPlan];

    let text = `Hola mi amor! Acepto tu invitacion a salir. Este es el plan que arme:\n\n`;
    text += `Plan: ${planDisplay}\n`;
    text += `Lugar: ${selectedPlace}\n`;
    text += `Ciudad: Medellin\n`;
    
    if (customMessage) {
        text += `\nMensaje: "${customMessage}"\n`;
    }
    
    text += `\nEstoy super emocionada!`;
    
    // Filtrar para mantener solo letras, números, signos de puntuación básicos y caracteres en español.
    const cleanText = text
        .replace(/[^\x00-\x7F¡¿áéíóúÁÉÍÓÚñÑüÜ,,.:;!?()""'*\-\s#]/g, '')
        .replace(/[ \t]+/g, ' ') // Normalizar solo espacios/tabs horizontales (preservando \n)
        .trim();

    const whatsappUrl = `https://wa.me/573014085511?text=${encodeURIComponent(cleanText)}`;
    window.open(whatsappUrl, '_blank');
});
