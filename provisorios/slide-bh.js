// Configurações do slider
const sliderContainer = document.querySelector('.slider-container');
const slider = document.querySelector('.slider');

// Dados das imagens para cada dia da semana
const images = {
    'segunda': [
        '7.jpeg'
    ],
    'terça': [
        '7.jpeg'
    ],
    'quarta': [
        '7.jpeg'
    ],
    'quinta': [
        '7.jpeg'
    ],
    'sexta': [
        '7.jpeg'
    ],
    'sabado': [
        '7.jpeg'
    ],
    'domingo': [
        '7.jpeg'
    ],
    'feriados': [
        '7.jpeg'
    ]
};

// Cria as imagens no slider
function createSlides() {
    const currentDay = getCurrentDay();
    const imageArray = images[currentDay];
    
    imageArray.forEach((url) => {
        const slide = document.createElement('div');
        slide.innerHTML = `
            <img src="img/${url}" alt="${currentDay}">
        `;
        slider.appendChild(slide);
    });
}

// Atualiza o slide conforme o dia atual
function updateSlide() {
    slider.innerHTML = '';
    createSlides();
}

// Inicializa o slider
function initSlider() {
    updateSlide();
    
    // Auto-rotacao a cada 5 segundos
    setInterval(() => {
    const currentDay = getCurrentDay();
    const imageArray = images[currentDay];
    const randomIndex = Math.floor(Math.random() * imageArray.length);
    const randomImage = imageArray[randomIndex];
    
    const img = document.createElement('img');
    img.src = `img/${randomImage}`;
    img.className = 'active';
    slider.appendChild(img);
    
    setTimeout(() => {
        img.classList.remove('active');
    }, 5000);
}, 5000);
}

// Define o dia atual considerando feriados
function getCurrentDay() {
    const now = new Date();
    const dayIndex = now.getDay(); // 0 = domingo, 1 = segunda, ..., 6 = sabado
    
    const days = {
        1: 'segunda',
        2: 'terça',
        3: 'quarta',
        4: 'quinta',
        5: 'sexta',
        6: 'sabado',
        0: 'domingo'
    };
    
    if (isHoliday(now)) {
        return 'feriados';
    }
    
    return days[dayIndex];
}

// Inicializa o slider quando a página carrega
window.addEventListener('load', initSlider);
