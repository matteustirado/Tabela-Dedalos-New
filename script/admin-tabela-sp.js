document.addEventListener('DOMContentLoaded', () => {
    // --- SELETORES DE ELEMENTOS ---
    const showLogsBtn = document.getElementById('showLogsBtn');
    const logsModal = document.getElementById('logsModal');
    const closeLogsModal = document.getElementById('closeLogsModal');
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
    let logs = []; // Armazena os logs localmente
    let currentPrices = {};

    // --- FUNÇÕES ---

    async function fetchCurrentPrices() {
        try {
            const response = await fetch('/api/prices');
            if (!response.ok) throw new Error('Falha ao buscar preços do servidor.');
            currentPrices = await response.json();
            renderCurrentPrices();
            populatePriceInputs();
        } catch (error) {
            console.error('Erro ao buscar preços:', error);
            alert('Não foi possível carregar os preços atuais.');
        }
    }

    function renderCurrentPrices() {
        if (!currentPricesContainer || !currentPrices.dias) return;
        const referenceDayPrices = currentPrices.dias.segunda;
        currentPricesContainer.innerHTML = `
            <div class="prices-display-wrapper">
                ${Object.keys(referenceDayPrices).filter(type => type !== 'message').map(type => {
                    const typeData = referenceDayPrices[type];
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
            <p style="font-size: 0.8rem; color: #888; text-align: center; margin-top: 1rem;">*Exibindo preços base de Segunda-Feira.</p>`;
    }

    function populatePriceInputs() {
        const referencePrices = currentPrices.dias.segunda;
        document.querySelectorAll('.price-input').forEach(input => {
            const type = input.dataset.type;
            const period = input.dataset.period;
            if (referencePrices[type] && referencePrices[type][period] !== undefined) {
                input.value = referencePrices[type][period].toFixed(2);
            }
        });
        document.getElementById('amigaMessage').value = referencePrices.amiga.message || '';
        document.getElementById('marmitaMessage').value = referencePrices.marmita.message || '';
    }
    
    // ⭐ FUNÇÃO PARA RENDERIZAR OS LOGS (NECESSÁRIA PARA A EXIBIÇÃO)
    function renderLogs() {
        logsContainer.innerHTML = '';
        if (logs.length === 0) {
            logsContainer.innerHTML = '<p>Nenhum log de alteração encontrado.</p>';
            return;
        }
        // Como a array 'logs' já está na ordem correta (mais novo primeiro),
        // apenas iteramos e adicionamos ao container.
        logs.forEach(log => {
            const logEntryDiv = document.createElement('div');
            logEntryDiv.className = 'log-entry';
            logEntryDiv.innerHTML = `
                <div class="log-header">
                    <h4 class="log-title">Alteração para: ${log.days.join(', ')}</h4>
                    <p class="log-meta">Responsável: ${log.responsible}</p>
                    <p class="log-meta">Data: ${log.timestamp}</p>
                </div>
                <div class="log-details">
                     <p><strong>Observação:</strong> ${log.notes || 'Nenhuma'}</p>
                </div>`;
            logsContainer.appendChild(logEntryDiv);
        });
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

    // ⭐ EVENT LISTENER DO LOG MODIFICADO PARA PEDIR SENHA
    if (showLogsBtn) {
        showLogsBtn.addEventListener('click', () => {
            const password = prompt("Para ver os logs, por favor, digite a senha:");
            if (password === "adminlog") { // Senha definida
                renderLogs(); // Prepara os logs para exibição
                logsModal.classList.remove('hidden'); // Abre o modal
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

    // ACIONAMENTO DO CALENDÁRIO (CÓDIGO ORIGINAL MANTIDO)
    calendarIcons.forEach(icon => {
        icon.addEventListener('click', (event) => {
            const input = event.currentTarget.previousElementSibling;
            if (input && typeof input.showPicker === 'function') {
                input.showPicker();
            }
        });
    });

    // SELEÇÃO MÚLTIPLA DOS DIAS (CÓDIGO ORIGINAL MANTIDO)
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

    // CHECKBOX DE ALTERAÇÃO DEFINITIVA (CÓDIGO ORIGINAL MANTIDO)
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
    
    // BOTÃO CANCELAR (CÓDIGO ORIGINAL MANTIDO)
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            resetForm();
            alert('Alterações canceladas.');
        });
    }

    // ⭐ BOTÃO SALVAR COM A LÓGICA COMPLETA E ADICIONANDO O LOG NO INÍCIO
    // BOTÃO SALVAR (Lógica atualizada para o novo backend)
    if (saveBtn) {
        saveBtn.addEventListener('click', async () => {
            // Coleta de dados do formulário
            const responsible = document.getElementById('responsible').value;
            const password = document.getElementById('password').value;
            const startDate = startDateInput.value;
            const endDate = endDateInput.value;
            const isPermanent = permanentChangeCheckbox.checked;
            const notes = document.getElementById('notes').value;
            const amigaMessage = document.getElementById('amigaMessage').value;
            const marmitaMessage = document.getElementById('marmitaMessage').value;

            // Validações
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

            // Estrutura os dados para enviar ao servidor
            const payload = {
                password,
                days: Array.from(selectedDays),
                prices: newPrices,
                messages: { amiga: amigaMessage, marmita: marmitaMessage },
                isPermanent,
                startDate,
                endDate,
                responsible,
                notes
            };
            
            // Estrutura o log para exibição local
            const newLog = {
                responsible,
                timestamp: new Date().toLocaleString('pt-BR'),
                days: Array.from(selectedDays),
                // Adiciona o tipo de alteração no log
                notes: `(${isPermanent ? 'DEFINITIVA' : 'TEMPORÁRIA'}) ${notes}`
            };

            // Envia para o servidor
            try {
                const response = await fetch('/api/prices', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });

                const result = await response.json();
                if (!response.ok) throw new Error(result.message || 'Falha ao salvar os preços.');
                
                alert(result.message); // Exibe a mensagem de sucesso do servidor
                
                logs.unshift(newLog); // Adiciona o log no início da lista local
                
                // Se a alteração foi permanente, busca os novos preços base
                if (isPermanent) {
                    currentPrices = result.updatedPrices;
                }
                
                resetForm();
                renderCurrentPrices();

            } catch (error) {
                console.error('Erro ao salvar preços:', error);
                alert(`Erro ao salvar: ${error.message}`);
            }
        });
    }

    // --- INICIALIZAÇÃO ---
    fetchCurrentPrices();
});