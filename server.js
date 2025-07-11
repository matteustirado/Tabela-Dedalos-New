const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const http = require('http');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

// --- CAMINHOS DOS ARQUIVOS NO DISCO PERSISTENTE ---
const dataPath = '/data';
const pricesFilePath = path.join(dataPath, 'precos.json');
const overridesFilePath = path.join(dataPath, 'overrides.json');
const logsFilePath = path.join(dataPath, 'logs.json'); 

// --- DADOS PADRÃO E INICIALIZAÇÃO ---
const defaultPrices = {
    dias: {
        segunda: { prices: { player: { manha: 29.99, tarde: 32.99, noite: 35.99 }, amiga: { manha: 35.99, tarde: 49.99, noite: 54.99 }, marmita: { manha: 49.99, tarde: 59.99, noite: 69.99 } }, messages: { amiga: { message: "*Cupom necessário" }, marmita: { message: "*Cupom necessário" } } },
        terca:   { prices: { player: { manha: 29.99, tarde: 32.99, noite: 35.99 }, amiga: { manha: 35.99, tarde: 49.99, noite: 54.99 }, marmita: { manha: 49.99, tarde: 59.99, noite: 69.99 } }, messages: { amiga: { message: "*Cupom necessário" }, marmita: { message: "*Cupom necessário" } } },
        quarta:  { prices: { player: { manha: 29.99, tarde: 32.99, noite: 35.99 }, amiga: { manha: 35.99, tarde: 49.99, noite: 54.99 }, marmita: { manha: 49.99, tarde: 59.99, noite: 69.99 } }, messages: { amiga: { message: "*Cupom necessário" }, marmita: { message: "*Cupom necessário" } } },
        quinta:  { prices: { player: { manha: 29.99, tarde: 32.99, noite: 53.99 }, amiga: { manha: 35.99, tarde: 49.99, noite: 107.98 }, marmita: { manha: 49.99, tarde: 59.99, noite: 161.97 } }, messages: { amiga: { message: "*Cupom necessário" }, marmita: { message: "*Cupom necessário" } } },
        sexta:   { prices: { player: { manha: 29.99, tarde: 32.99, noite: 35.99 }, amiga: { manha: 35.99, tarde: 49.99, noite: 54.99 }, marmita: { manha: 49.99, tarde: 59.99, noite: 69.99 } }, messages: { amiga: { message: "*Cupom necessário" }, marmita: { message: "*Cupom necessário" } } },
        sabado:  { prices: { player: { manha: 34.99, tarde: 49.99, noite: 53.99 }, amiga: { manha: 58.99, tarde: 79.99, noite: 89.99 }, marmita: { manha: 79.99, tarde: 109.99, noite: 119.99 } }, messages: { amiga: { message: "*Cupom necessário" }, marmita: { message: "*Cupom necessário" } } },
        domingo: { prices: { player: { manha: 34.99, tarde: 49.99, noite: 53.99 }, amiga: { manha: 58.99, tarde: 79.99, noite: 89.99 }, marmita: { manha: 79.99, tarde: 109.99, noite: 119.99 } }, messages: { amiga: { message: "*Cupom necessário" }, marmita: { message: "*Cupom necessário" } } },
        feriados:{ prices: { player: { manha: 34.99, tarde: 49.99, noite: 53.99 }, amiga: { manha: 58.99, tarde: 79.99, noite: 89.99 }, marmita: { manha: 79.99, tarde: 109.99, noite: 119.99 } }, messages: { amiga: { message: "*Cupom necessário" }, marmita: { message: "*Cupom necessário" } } }
    },
    feriados: [ "01-01-2025", "04-03-2025", "01-05-2025", "25-12-2025" ]
};

async function initializeDataFiles() {
    try {
        await fs.access(pricesFilePath);
    } catch (error) {
        console.log("precos.json não encontrado. Criando arquivo padrão...");
        await fs.writeFile(pricesFilePath, JSON.stringify(defaultPrices, null, 2), 'utf8');
    }
    try {
        await fs.access(overridesFilePath);
    } catch (error) {
        console.log("overrides.json não encontrado. Criando arquivo padrão...");
        await fs.writeFile(overridesFilePath, JSON.stringify([], null, 2), 'utf8');
    }
    try {
        await fs.access(logsFilePath);
    } catch (error) {
        console.log("logs.json não encontrado. Criando arquivo padrão...");
        await fs.writeFile(logsFilePath, JSON.stringify([], null, 2), 'utf8');
    }
}

// --- LÓGICA DO SOCKET.IO ---
io.on('connection', (socket) => {
  console.log('Uma tela pública se conectou em tempo real:', socket.id);
  socket.on('disconnect', () => {
    console.log('Uma tela pública desconectou:', socket.id);
  });
});

// --- ROTAS DA API ---

// ROTA PARA SALVAR PREÇOS (POST)
app.post('/api/prices', async (req, res) => {
    const { password, days, prices, messages, isPermanent, startDate, endDate, responsible, notes } = req.body;
    if (password !== process.env.ADMIN_PASSWORD) {
        return res.status(401).json({ message: "Senha incorreta!" });
    }

    try {
        if (isPermanent) {
            const pricesDataRaw = await fs.readFile(pricesFilePath, 'utf8');
            const pricesData = JSON.parse(pricesDataRaw);
            days.forEach(day => {
                if (pricesData.dias && pricesData.dias[day]) {
                    pricesData.dias[day].prices = prices;
                    pricesData.dias[day].messages = messages;
                }
            });
            await fs.writeFile(pricesFilePath, JSON.stringify(pricesData, null, 2));
        } else {
            const overridesDataRaw = await fs.readFile(overridesFilePath, 'utf8');
            const overrides = JSON.parse(overridesDataRaw);
            const newOverride = { id: uuidv4(), startDate, endDate, days, prices, messages, responsible, notes, createdAt: new Date().toISOString() };
            overrides.push(newOverride);
            await fs.writeFile(overridesFilePath, JSON.stringify(overrides, null, 2));
        }
    } catch (error) {
        console.error("ERRO AO SALVAR PREÇO:", error);
        return res.status(500).json({ message: "Erro ao salvar a alteração de preço." });
    }

    try {
        const logsDataRaw = await fs.readFile(logsFilePath, 'utf8');
        const logs = JSON.parse(logsDataRaw);
        const newLog = { responsible, timestamp: new Date().toISOString(), days, notes: `(${isPermanent ? 'DEFINITIVA' : 'TEMPORÁRIA'}) ${notes}` };
        logs.unshift(newLog);
        await fs.writeFile(logsFilePath, JSON.stringify(logs, null, 2));
        
        io.emit('prices_updated', { message: 'Preços foram atualizados!' });
        console.log("Aviso 'prices_updated' enviado para todos os clientes.");
        
        if (isPermanent) {
            const updatedPrices = await fs.readFile(pricesFilePath, 'utf8');
            return res.json({ message: "Preços permanentes atualizados e log salvo!", updatedPrices: JSON.parse(updatedPrices) });
        } else {
            return res.json({ message: "Alteração temporária salva e log registrado!" });
        }
    } catch (error) {
        console.error("ERRO AO SALVAR LOG:", error);
        return res.status(500).json({ message: "A alteração de preço foi salva, mas houve um erro ao registrar o log." });
    }
});

// ROTA PARA BUSCAR PREÇOS (GET)
app.get('/api/prices', async (req, res) => {
    try {
        const pricesDataRaw = await fs.readFile(pricesFilePath, 'utf8');
        const basePrices = JSON.parse(pricesDataRaw);

        const overridesDataRaw = await fs.readFile(overridesFilePath, 'utf8');
        const overrides = JSON.parse(overridesDataRaw);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const activeOverrides = overrides.filter(override => {
            const startDate = new Date(override.startDate);
            const endDate = new Date(override.endDate);
            startDate.setHours(0,0,0,0);
            endDate.setHours(23,59,59,999);
            return today >= startDate && today <= endDate;
        });

        if (activeOverrides.length === 0) {
            return res.json(basePrices);
        }

        const finalPrices = JSON.parse(JSON.stringify(basePrices));

        activeOverrides.forEach(override => {
            override.days.forEach(day => {
                if (finalPrices.dias && finalPrices.dias[day]) {
                    Object.assign(finalPrices.dias[day].prices, override.prices);
                    Object.assign(finalPrices.dias[day].messages, override.messages);
                }
            });
        });

        res.json(finalPrices);
    } catch (error) {
        console.error("Erro detalhado na rota GET /api/prices:", error);
        res.status(500).json({ message: "Erro ao ler os arquivos de preços no servidor." });
    }
});

// ROTA PARA BUSCAR LOGS (GET)
app.get('/api/logs', async (req, res) => {
    try {
        const logsDataRaw = await fs.readFile(logsFilePath, 'utf8');
        res.json(JSON.parse(logsDataRaw));
    } catch (error) {
        console.error("Erro ao ler o arquivo de logs:", error);
        res.status(500).json({ message: "Não foi possível carregar o histórico de logs." });
    }
});

// --- INICIALIZAÇÃO DO SERVIDOR ---
server.listen(PORT, async () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    await initializeDataFiles();
});