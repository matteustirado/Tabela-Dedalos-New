document.addEventListener('DOMContentLoaded', () => {
    let pricingData = {};

    async function fetchPricingData() {
        try {
            const response = await fetch('/api/prices'); 
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Servidor respondeu com erro: ${response.status}. Detalhes: ${errorText}`);
            }
            pricingData = await response.json();
            updateInterface();
        } catch (error) {
            console.error("Erro detalhado ao buscar preços:", error);
        }
    }

    function isHoliday(date) {
        if (!pricingData.feriados) return false;
        const currentDate = String(date.getDate()).padStart(2, '0') + '-' +
                              String(date.getMonth() + 1).padStart(2, '0') + '-' +
                              date.getFullYear();
        return pricingData.feriados.includes(currentDate);
    }

    function getCurrentPeriod() {
        const now = new Date();
        const hours = now.getHours();
        if (hours >= 6 && hours < 14) return 'manha';
        if (hours >= 14 && hours < 20) return 'tarde';
        return 'noite';
    }

    function getCurrentDay() {
        const now = new Date();
        if (isHoliday(now)) {
            return 'feriados';
        }
        const dayIndex = now.getDay();
        const days = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
        return days[dayIndex];
    }

    function updatePrices(day, period) {
        if (!pricingData.dias || !pricingData.dias[day] || !pricingData.dias[day].prices) {
            console.error(`Dados de preços não encontrados para o dia: ${day}`);
            return;
        }

        const dayData = pricingData.dias[day];
        const priceCards = document.querySelectorAll('.price-card');

        priceCards.forEach(card => {
            const titleElement = card.querySelector('h3');
            
            // ⭐ 1. CORREÇÃO: Normaliza o texto para remover espaços E acentos.
            const type = titleElement.textContent
                .toLowerCase()
                .normalize("NFD") // Separa os acentos das letras
                .replace(/[\u0300-\u036f]/g, "") // Remove os acentos
                .replace(/\s+/g, ''); // Remove os espaços
            
            let key;

            // ⭐ 2. CORREÇÃO: Verifica o texto normalizado ("maoamiga" em vez de "moamiga")
            if (type === 'player') key = 'player';
            else if (type === 'maoamiga') key = 'amiga';
            else if (type === 'marmita') key = 'marmita';

            if (!key || !dayData.prices[key] || dayData.prices[key][period] === undefined) {
                 card.querySelector('.price').textContent = '--';
                 return;
            }

            const priceValue = dayData.prices[key][period];
            card.querySelector('.price').textContent = priceValue.toFixed(2);
            
            const featuresList = card.querySelector('.price-features');
            let messageItem = featuresList.querySelector('.dynamic-message');
            if (messageItem) messageItem.remove();

            if ((key === 'amiga' || key === 'marmita') && dayData.messages && dayData.messages[key] && dayData.messages[key].message) {
                 const newListItem = document.createElement('li');
                 newListItem.className = 'dynamic-message';
                 newListItem.textContent = dayData.messages[key].message;
                 featuresList.appendChild(newListItem);
            }
        });
    }

    function updateInterface() {
        if (!pricingData || !pricingData.dias) {
            console.error("Dados de preços inválidos ou vazios recebidos do servidor.");
            return;
        }

        const currentDay = getCurrentDay();
        const currentPeriod = getCurrentPeriod();

        document.querySelectorAll('.tab-button').forEach(button => {
            button.classList.toggle('active', button.dataset.tab === currentDay);
        });

        document.querySelectorAll('.period-option').forEach(option => {
            option.classList.toggle('active', option.dataset.period === currentPeriod);
        });

        updatePrices(currentDay, currentPeriod);
    }

    // Event Listeners (não precisam de alteração)
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', () => {
            const selectedDay = button.dataset.tab;
            const activePeriod = document.querySelector('.period-option.active').dataset.period;
            updatePrices(selectedDay, activePeriod);
            document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        });
    });

    document.querySelectorAll('.period-option').forEach(option => {
        option.addEventListener('click', () => {
            const selectedPeriod = option.dataset.period;
            const activeDay = document.querySelector('.tab-button.active').dataset.tab;
            updatePrices(activeDay, selectedPeriod);
            document.querySelectorAll('.period-option').forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
        });
    });

    fetchPricingData(); 
});