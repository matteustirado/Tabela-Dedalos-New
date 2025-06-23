// pricing.js

// Lista de feriados no formato DD-MM-AAAA
const feriados = [
    '04-03-2025', // Exemplo: 04 de março de 2025
    '25-12-2024', // Natal 2024
    '01-05-2025',
    '01-01-2025', // Ano novo 2025
    // Adicione mais feriados conforme necessário
];

// Dados de preços
const pricingData = {
    'segunda': {
        'manha': { player: 29.99, amiga: 35.99, marmita: 49.99 },
        'tarde': { player: 32.99, amiga: 49.99, marmita: 59.99 },
        'noite': { player: 35.99, amiga: 54.99, marmita: 69.99 }
    },
    'terça': {
        'manha': { player: 29.99, amiga: 35.99, marmita: 49.99 },
        'tarde': { player: 32.99, amiga: 49.99, marmita: 59.99 },
        'noite': { player: 35.99, amiga: 54.99, marmita: 69.99 }
    },
    'quarta': {
        'manha': { player: 29.99, amiga: 35.99, marmita: 49.99 },
        'tarde': { player: 32.99, amiga: 49.99, marmita: 59.99 },
        'noite': { player: 35.99, amiga: 54.99, marmita: 69.99 }
    },
    'quinta': {
        'manha': { player: 29.99, amiga: 35.99, marmita: 49.99 },
        'tarde': { player: 32.99, amiga: 49.99, marmita: 59.99 },
        'noite': { player: 35.99, amiga: 54.99, marmita: 69.99 }
    },
    'sexta': {
        'manha': { player: 29.99, amiga: 35.99, marmita: 49.99 },
        'tarde': { player: 32.99, amiga: 49.99, marmita: 59.99 },
        'noite': { player: 35.99, amiga: 54.99, marmita: 69.99 }
    },
    'sabado': {
        'manha': { player: 59.99, amiga: 119.98, marmita: 179.97 },
        'tarde': { player: 69.99, amiga: 139.98, marmita: 209.97 },
        'noite': { player: 79.99, amiga: 159.98, marmita: 239.97 }
    },
    'domingo': {
        'manha': { player: 59.99, amiga: 119.98, marmita: 179.97 },
        'tarde': { player: 69.99, amiga: 139.98, marmita: 209.97 },
        'noite': { player: 79.99, amiga: 159.98, marmita: 239.97 }
    },
    'feriados': {
        'manha': { player: 59.99, amiga: 119.98, marmita: 179.97 },
        'tarde': { player: 69.99, amiga: 139.98, marmita: 209.97 },
        'noite': { player: 79.99, amiga: 159.98, marmita: 239.97 }
    }
};

// Função para verificar se uma data é feriado
function isHoliday(date) {
    const currentDate = String(date.getDate()).padStart(2, '0') + '-' +
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

// Atualiza os preços na tela
function updatePrices(day, period) {
    const priceCards = document.querySelectorAll('.price-card');

    priceCards.forEach(card => {
        const title = card.querySelector('h3').textContent.toLowerCase();
        const type = title === 'mão amiga' ? 'amiga' : title;
        const price = pricingData[day][period][type];
        card.querySelector('.price').textContent = price.toFixed(2);
    });
}

// Atualiza a interface (tabs e períodos ativos)
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

// Event listeners para os botões de dias
document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => {
        const selectedTab = button.dataset.tab;
        const currentPeriod = getCurrentPeriod();

        let dayToUse = selectedTab;

        // Se hoje é feriado, sempre usa 'feriados' (exceto se o botão clicado for explicitamente 'feriados')
        if (selectedTab !== 'feriados' && isHoliday(new Date())) {
            dayToUse = 'feriados';
        }

        updatePrices(dayToUse, currentPeriod);

        // Atualiza o destaque visual do botão clicado
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
    });
});

// Event listeners para os botões de período
document.querySelectorAll('.period-option').forEach(option => {
    option.addEventListener('click', () => {
        const period = option.dataset.period;
        const currentDay = getCurrentDay();

        updatePrices(currentDay, period);

        // Atualiza o destaque visual do período clicado
        document.querySelectorAll('.period-option').forEach(opt => opt.classList.remove('active'));
        option.classList.add('active');
    });
});

// Inicializa a interface ao carregar a página
updateInterface();
