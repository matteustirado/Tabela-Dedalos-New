// pricing.js

// Lista de feriados no formato DD-MM-AAAA
const feriados = [
    '04-03-2025', // Exemplo: 04 de março de 2025
    '25-12-2024', // Natal 2024
    '01-01-2025', // Ano novo 2025
    // Adicione mais feriados conforme necessário
];

// Dados de preços
const pricingData = {
    'segunda': {
        'manha': { single: 19.99, amiga: 24.99, marmitex: 27.99 },
        'tarde': { single: 24.99, amiga: 39.99, marmitex: 49.99 },
        'noite': { single: 29.99, amiga: 44.99, marmitex: 54.99 }
    },
    'terça': {
        'manha': { single: 19.99, amiga: 24.99, marmitex: 27.99 },
        'tarde': { single: 24.99, amiga: 39.99, marmitex: 49.99 },
        'noite': { single: 29.99, amiga: 44.99, marmitex: 54.99 }
    },
    'quarta': {
        'manha': { single: 19.99, amiga: 24.99, marmitex: 27.99 },
        'tarde': { single: 24.99, amiga: 39.99, marmitex: 49.99 },
        'noite': { single: 29.99, amiga: 44.99, marmitex: 54.99 }
    },
    'quinta': {
        'manha': { single: 19.99, amiga: 24.99, marmitex: 27.99 },
        'tarde': { single: 24.99, amiga: 39.99, marmitex: 49.99 },
        'noite': { single: 29.99, amiga: 44.99, marmitex: 54.99 }
    },
    'sexta': {
        'manha': { single: 19.99, amiga: 24.99, marmitex: 27.99 },
        'tarde': { single: 24.99, amiga: 39.99, marmitex: 49.99 },
        'noite': { single: 29.99, amiga: 44.99, marmitex: 54.99 }
    },
    'sabado': {
        'manha': { single: 24.99, amiga: 39.99, marmitex: 44.99 },
        'tarde': { single: 34.99, amiga: 49.99, marmitex: 59.99 },
        'noite': { single: 39.99, amiga: 59.99, marmitex: 79.99 }
    },
    'domingo': {
        'manha': { single: 24.99, amiga: 39.99, marmitex: 44.99 },
        'tarde': { single: 34.99, amiga: 49.99, marmitex: 59.99 },
        'noite': { single: 39.99, amiga: 59.99, marmitex: 79.99 }
    },
    'feriados': {
        'manha': { single: 24.99, amiga: 39.99, marmitex: 44.99 },
        'tarde': { single: 34.99, amiga: 49.99, marmitex: 59.99 },
        'noite': { single: 39.99, amiga: 59.99, marmitex: 79.99 }
    }
};

// Função para verificar se uma data é feriado
function isHoliday(date) {
    const currentDate = date.getDate() + '-' + 
                       String(date.getMonth() + 1).padStart(2, '0') + '-' + 
                       date.getFullYear();
    
    return feriados.includes(currentDate);
}

// Define o período atual
function getCurrentPeriod() {
    const now = new Date();
    const hours = now.getHours();
    
    if (hours >= 6 && hours < 14) return 'manha';
    if (hours >= 14 && hours < 20) return 'tarde';
    return 'noite';
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

// Atualize a função updatePrices() para:
function updatePrices(day, period) {
    const priceCards = document.querySelectorAll('.price-card');
    
    priceCards.forEach(card => {
        const title = card.querySelector('h3').textContent.toLowerCase();
        // Verifica se o título é "mão amiga" e ajusta para "amiga"
        const type = title === 'mão amiga' ? 'amiga' : title;
        const price = pricingData[day][period][type];
        card.querySelector('.price').textContent = price.toFixed(2);
    });
}

// Atualiza a interface
function updateInterface() {
    const currentDay = getCurrentDay();
    const currentPeriod = getCurrentPeriod();
    
    // Atualiza os tabs
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
        if (button.dataset.tab === currentDay) {
            button.classList.add('active');
        }
    });
    
    // Atualiza os períodos
    document.querySelectorAll('.period-option').forEach(option => {
        option.classList.remove('active');
        if (option.dataset.period === currentPeriod) {
            option.classList.add('active');
        }
    });
    
    // Atualiza os preços
    updatePrices(currentDay, currentPeriod);
}

// Event listeners
document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => {
        const day = button.dataset.tab;
        const currentPeriod = getCurrentPeriod();
        updatePrices(day, currentPeriod);
    });
});

document.querySelectorAll('.period-option').forEach(option => {
    option.addEventListener('click', () => {
        const period = option.dataset.period;
        const currentDay = getCurrentDay();
        updatePrices(currentDay, period);
    });
});

// Atualiza a interface inicial
updateInterface();
