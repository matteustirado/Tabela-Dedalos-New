document.addEventListener('DOMContentLoaded', () => {
    let pricingData = {};

    // Função para buscar os dados de preços da nossa API
    async function fetchPricingData() {
        try {
            // ⭐ MUDANÇA PRINCIPAL AQUI ⭐
            // Pede os preços para a nossa API, não para um arquivo estático.
            const response = await fetch('/api/prices'); 
            
            if (!response.ok) {
                throw new Error('Não foi possível carregar os dados de preços do servidor.');
            }
            pricingData = await response.json();
            updateInterface(); // Atualiza a interface assim que os dados são carregados
        } catch (error) {
            console.error(error);
            // Você pode adicionar uma mensagem de erro na tela aqui, se quiser
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
        // Verifica se os dados existem na estrutura correta
        if (!pricingData.dias || !pricingData.dias[day] || !pricingData.dias[day].prices) {
            console.error(`Dados de preços não encontrados para: ${day}`);
            return;
        }

        const dayData = pricingData.dias[day];
        const priceCards = document.querySelectorAll('.price-card');

        priceCards.forEach(card => {
            const titleElement = card.querySelector('h3');
            // Remove espaços e acentos para uma chave mais confiável
            const type = titleElement.textContent.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(' ', '');
            
            let key;
            if (type.includes('player')) key = 'player';
            else if (type.includes('amiga')) key = 'amiga';
            else if (type.includes('marmita')) key = 'marmita';

            // Pega o preço para o período correto
            const priceValue = dayData.prices[key] ? dayData.prices[key][period] : undefined;

            if (priceValue !== undefined) {
                card.querySelector('.price').textContent = priceValue.toFixed(2);
            }

            // Atualiza a mensagem
            const featuresList = card.querySelector('.price-features');
            let messageItem = featuresList.querySelector('.dynamic-message');
            
            // Remove a mensagem antiga se existir
            if (messageItem) messageItem.remove();

            // Adiciona a nova mensagem se aplicável
            if ((key === 'amiga' || key === 'marmita') && dayData.messages[key] && dayData.messages[key].message) {
                 const newListItem = document.createElement('li');
                 newListItem.className = 'dynamic-message';
                 newListItem.textContent = dayData.messages[key].message;
                 featuresList.appendChild(newListItem);
            }
        });
    }

    function updateInterface() {
        if (!pricingData || Object.keys(pricingData).length === 0) return;

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

    // --- Event Listeners ---
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

    // Inicia o processo
    fetchPricingData(); 
});