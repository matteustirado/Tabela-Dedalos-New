document.addEventListener('DOMContentLoaded', () => {
    let pricingData = {};

    // Função para buscar os dados de preços do arquivo JSON
    async function fetchPricingData() {
        try {
            const response = await fetch('precos.json');
            if (!response.ok) {
                throw new Error('Não foi possível carregar os dados de preços.');
            }
            pricingData = await response.json();
            updateInterface(); // Atualiza a interface assim que os dados são carregados
        } catch (error) {
            console.error(error);
            // Exibir uma mensagem de erro para o usuário, se desejar
        }
    }

    function isHoliday(date) {
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
        if (!pricingData.dias || !pricingData.dias[day] || !pricingData.dias[day][period]) {
            console.error(`Dados de preços não encontrados para: ${day}, ${period}`);
            return;
        }

        const prices = pricingData.dias[day][period];
        const priceCards = document.querySelectorAll('.price-card');

        priceCards.forEach(card => {
            const titleElement = card.querySelector('h3');
            const type = titleElement.textContent.toLowerCase().replace(' ', ''); // 'player', 'moamiga', 'marmita'
            
            let key;
            if (type.includes('player')) key = 'player';
            else if (type.includes('amiga')) key = 'amiga';
            else if (type.includes('marmita')) key = 'marmita';

            if (prices[key] !== undefined) {
                card.querySelector('.price').textContent = prices[key].toFixed(2);
            }

            const featuresList = card.querySelector('.price-features');
            const messageItem = featuresList.querySelector('.dynamic-message');
            if (messageItem) {
                messageItem.remove();
            }

            if ((key === 'amiga' || key === 'marmita') && pricingData.dias[day].amiga.message) {
                 const newListItem = document.createElement('li');
                 newListItem.className = 'dynamic-message';
                 newListItem.textContent = pricingData.dias[day].amiga.message;
                 featuresList.appendChild(newListItem);
            }
        });
    }

    function updateInterface() {
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

    fetchPricingData(); // Inicia o processo
});