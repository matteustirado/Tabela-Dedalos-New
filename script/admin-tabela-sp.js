document.addEventListener('DOMContentLoaded', () => {
    // --- SELETORES DE ELEMENTOS ---
    const showLogsBtn = document.getElementById('showLogsBtn');
    const logsModal = document.getElementById('logsModal');
    const closeLogsModal = document.getElementById('closeLogsModal');
    const downloadLogsBtn = document.getElementById('downloadLogsBtn');
    const dayOptions = document.querySelectorAll('.day-option');
    const permanentChangeCheckbox = document.getElementById('permanentChange');
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const saveBtn = document.getElementById('saveBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const logsContainer = document.getElementById('logsContainer');
    const currentPricesContainer = document.getElementById('currentPricesContainer');
    const calendarIcons = document.querySelectorAll('.calendar-icon');

    // --- VARIÁVEIS DE ESTADO ---
    let selectedDays = new Set();
    let logs = []; // Cache local para TODOS os logs buscados do servidor
    let currentPrices = {};

    // --- FUNÇÕES ---

    async function fetchCurrentPrices() {
        try {
            const response = await fetch('/api/prices');
            if (!response.ok) throw new Error('Falha ao buscar preços do servidor.');
            currentPrices = await response.json();
            
            console.log("Preços recebidos do servidor (Admin):", currentPrices);

            renderCurrentPrices();
            populatePriceInputs();
        } catch (error) {
            console.error('Erro ao buscar preços (Admin):', error);
            alert('Não foi possível carregar os preços atuais. Verifique o console do navegador.');
        }
    }
    
    function isHoliday(date) {
        if (!currentPrices.feriados) return false;
        const currentDate = String(date.getDate()).padStart(2, '0') + '-' +
                              String(date.getMonth() + 1).padStart(2, '0') + '-' +
                              date.getFullYear();
        return currentPrices.feriados.includes(currentDate);
    }

    function getCurrentDay() {
        const now = new Date();
        if (isHoliday(now)) { return 'feriados'; }
        const dayIndex = now.getDay();
        const days = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
        return days[dayIndex];
    }

    function renderCurrentPrices() {
        if (!currentPricesContainer || !currentPrices.dias) return;
        
        const currentDayName = getCurrentDay();
        const currentDayData = currentPrices.dias[currentDayName];
        
        if (!currentDayData || !currentDayData.prices) {
            console.error(`Estrutura de preços para '${currentDayName}' está incompleta.`);
            currentPricesContainer.innerHTML = `<p>Não foi possível carregar os preços para ${currentDayName}.</p>`;
            return;
        }

        const displayName = currentDayName.charAt(0).toUpperCase() + currentDayName.slice(1);

        currentPricesContainer.innerHTML = `
            <div class="prices-display-wrapper">
                ${Object.keys(currentDayData.prices).map(type => {
                    const typeData = currentDayData.prices[type];
                    const title = type === 'player' ? 'Player' : (type === 'amiga' ? 'Mão Amiga' : 'Marmita');
                    return `
                    <div class="price-card-display">
                        <h4>${title}</h4>
                        <ul>
                            <li>Manhã: <span class="price-value">R$ ${typeData.manha.toFixed(2)}</span></li>
                            <li>Tarde: <span class="price-value">R$ ${typeData.tarde.toFixed(2)}</span></li>
                            <li>Noite: <span class="price-value">R$ ${typeData.noite.toFixed(2)}</span></li>
                        </ul>
                    </div>`;
                }).join('')}
            </div>
            <p style="font-size: 0.8rem; color: #888; text-align: center; margin-top: 1rem;">*Exibindo preços atuais de ${displayName}.</p>`;
    }

    function populatePriceInputs() {
        if (!currentPrices.dias) return;
        const referenceDay = currentPrices.dias.segunda;
        if (!referenceDay || !referenceDay.prices || !referenceDay.messages) return;

        document.querySelectorAll('.price-input').forEach(input => {
            const type = input.dataset.type;
            const period = input.dataset.period;
            if (referenceDay.prices[type] && referenceDay.prices[type][period] !== undefined) {
                input.value = referenceDay.prices[type][period].toFixed(2);
            }
        });

        document.getElementById('amigaMessage').value = referenceDay.messages.amiga.message || '';
        document.getElementById('marmitaMessage').value = referenceDay.messages.marmita.message || '';
    }
    
    async function fetchLogs() {
        try {
            const response = await fetch('/api/logs');
            if (!response.ok) { throw new Error("Falha ao buscar logs do servidor."); }
            logs = await response.json();
            renderLogs();
        } catch (error) {
            console.error(error);
            logsContainer.innerHTML = `<p style="color: red;">${error.message}</p>`;
        }
    }

    function renderLogs() {
        logsContainer.innerHTML = '';

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const monthlyLogs = logs.filter(log => {
            const logDate = new Date(log.timestamp);
            return logDate.getMonth() === currentMonth && logDate.getFullYear() === currentYear;
        });

        if (monthlyLogs.length === 0) {
            logsContainer.innerHTML = '<p>Nenhum log de alteração encontrado para este mês.</p>';
            return;
        }

        monthlyLogs.forEach(log => {
            const logEntryDiv = document.createElement('div');
            logEntryDiv.className = 'log-entry';
            logEntryDiv.innerHTML = `
                <div class="log-header">
                    <h4 class="log-title">Alteração para: ${log.days.join(', ')}</h4>
                    <p class="log-meta">Responsável: ${log.responsible}</p>
                    <p class="log-meta">Data: ${new Date(log.timestamp).toLocaleString('pt-BR')}</p>
                </div>
                <div class="log-details">
                     <p><strong>Observação:</strong> ${log.notes || 'Nenhuma'}</p>
                </div>`;
            logsContainer.appendChild(logEntryDiv);
        });
    }
    
    function downloadFullLogs() {
        if (!logs || logs.length === 0) {
            alert("Não há logs para baixar. Abra o histórico primeiro.");
            return;
        }
        
        const logText = JSON.stringify(logs, null, 2);
        const blob = new Blob([logText], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        a.href = url;
        a.download = `historico_completo_tabela_de_precos.json`;
        document.body.appendChild(a);
        a.click();
        
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    function resetForm() {
        document.getElementById('responsible').value = '';
        document.getElementById('password').value = '';
        startDateInput.value = '';
        endDateInput.value = '';
        permanentChangeCheckbox.checked = false;
        startDateInput.disabled = false;
        endDateInput.disabled = false;
        document.getElementById('notes').value = '';
        dayOptions.forEach(button => button.classList.remove('active'));
        selectedDays.clear();
        if (currentPrices.dias) {
            populatePriceInputs();
        }
    }

    // --- EVENT LISTENERS ---

    if (showLogsBtn) {
        showLogsBtn.addEventListener('click', () => {
            const password = prompt("Para ver os logs, por favor, digite a senha:");
            if (password === "adminlog") {
                logsModal.classList.remove('hidden');
                logsContainer.innerHTML = "<p>Carregando histórico...</p>";
                fetchLogs();
            } else if (password !== null) {
                alert("Senha incorreta!");
            }
        });
    }

    if (closeLogsModal) {
        closeLogsModal.addEventListener('click', () => {
            logsModal.classList.add('hidden');
        });
    }
    
    if (downloadLogsBtn) {
        downloadLogsBtn.addEventListener('click', downloadFullLogs);
    }

    calendarIcons.forEach(icon => {
        icon.addEventListener('click', (event) => {
            const input = event.currentTarget.previousElementSibling;
            if (input && typeof input.showPicker === 'function') {
                input.showPicker();
            }
        });
    });

    dayOptions.forEach(button => {
        button.addEventListener('click', () => {
            const day = button.dataset.day;
            if (selectedDays.has(day)) {
                selectedDays.delete(day);
                button.classList.remove('active');
            } else {
                selectedDays.add(day);
                button.classList.add('active');
            }
        });
    });

    if (permanentChangeCheckbox) {
        permanentChangeCheckbox.addEventListener('change', (event) => {
            const isChecked = event.target.checked;
            startDateInput.disabled = isChecked;
            endDateInput.disabled = isChecked;
            if (isChecked) {
                startDateInput.value = '';
                endDateInput.value = '';
            }
        });
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            resetForm();
            alert('Alterações canceladas.');
        });
    }

    if (saveBtn) {
        saveBtn.addEventListener('click', async () => {
            const responsible = document.getElementById('responsible').value;
            const password = document.getElementById('password').value;
            const startDate = startDateInput.value;
            const endDate = endDateInput.value;
            const isPermanent = permanentChangeCheckbox.checked;
            const notes = document.getElementById('notes').value;
            const amigaMessage = document.getElementById('amigaMessage').value;
            const marmitaMessage = document.getElementById('marmitaMessage').value;

            if (!responsible || !password) return alert('Por favor, preencha o responsável e a senha.');
            if (selectedDays.size === 0) return alert('Por favor, selecione ao menos um dia da semana.');
            if (!isPermanent && (!startDate || !endDate)) return alert('Selecione as datas de início e fim para uma alteração temporária.');

            const newPrices = {};
            document.querySelectorAll('.price-input').forEach(input => {
                const type = input.dataset.type;
                const period = input.dataset.period;
                if (!newPrices[type]) newPrices[type] = {};
                newPrices[type][period] = parseFloat(input.value);
            });

            const payload = {
                password, days: Array.from(selectedDays), prices: newPrices,
                messages: { amiga: {message: amigaMessage}, marmita: {message: marmitaMessage} },
                isPermanent, startDate, endDate, responsible, notes
            };
            
            try {
                const response = await fetch('/api/prices', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
                const result = await response.json();
                if (!response.ok) throw new Error(result.message || 'Falha ao salvar os preços.');
                
                alert(result.message);
                
                await fetchCurrentPrices();
                resetForm();

            } catch (error) {
                console.error('Erro ao salvar preços:', error);
                alert(`Erro ao salvar: ${error.message}`);
            }
        });
    }

    // --- INICIALIZAÇÃO ---
    fetchCurrentPrices();
});