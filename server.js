const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000; // Render usa a variável de ambiente PORT

app.use(express.json());
app.use(express.static(__dirname));

// Caminhos para os arquivos dentro do Disco Persistente
const dataPath = '/data';
const pricesFilePath = path.join(dataPath, 'precos.json');
const overridesFilePath = path.join(dataPath, 'overrides.json');

// ⭐ NOVO: Estrutura de preços padrão para criar o arquivo se ele não existir
const defaultPrices = {
    dias: {
        segunda: { player: { manha: 29.99, tarde: 32.99, noite: 35.99 }, amiga: { manha: 35.99, tarde: 49.99, noite: 54.99, message: "*Cupom necessário" }, marmita: { manha: 49.99, tarde: 59.99, noite: 69.99, message: "*Cupom necessário" } },
        terca:   { player: { manha: 29.99, tarde: 32.99, noite: 35.99 }, amiga: { manha: 35.99, tarde: 49.99, noite: 54.99, message: "*Cupom necessário" }, marmita: { manha: 49.99, tarde: 59.99, noite: 69.99, message: "*Cupom necessário" } },
        quarta:  { player: { manha: 29.99, tarde: 32.99, noite: 35.99 }, amiga: { manha: 35.99, tarde: 49.99, noite: 54.99, message: "*Cupom necessário" }, marmita: { manha: 49.99, tarde: 59.99, noite: 69.99, message: "*Cupom necessário" } },
        quinta:  { player: { manha: 29.99, tarde: 32.99, noite: 53.99 }, amiga: { manha: 35.99, tarde: 49.99, noite: 107.98, message: "*Cupom necessário" }, marmita: { manha: 49.99, tarde: 59.99, noite: 161.97, message: "*Cupom necessário" } },
        sexta:   { player: { manha: 29.99, tarde: 32.99, noite: 35.99 }, amiga: { manha: 35.99, tarde: 49.99, noite: 54.99, message: "*Cupom necessário" }, marmita: { manha: 49.99, tarde: 59.99, noite: 69.99, message: "*Cupom necessário" } },
        sabado:  { player: { manha: 34.99, tarde: 49.99, noite: 53.99 }, amiga: { manha: 58.99, tarde: 79.99, noite: 89.99, message: "*Cupom necessário" }, marmita: { manha: 79.99, tarde: 109.99, noite: 119.99, message: "*Cupom necessário" } },
        domingo: { player: { manha: 34.99, tarde: 49.99, noite: 53.99 }, amiga: { manha: 58.99, tarde: 79.99, noite: 89.99, message: "*Cupom necessário" }, marmita: { manha: 79.99, tarde: 109.99, noite: 119.99, message: "*Cupom necessário" } },
        feriados:{ player: { manha: 34.99, tarde: 49.99, noite: 53.99 }, amiga: { manha: 58.99, tarde: 79.99, noite: 89.99, message: "*Cupom necessário" }, marmita: { manha: 79.99, tarde: 109.99, noite: 119.99, message: "*Cupom necessário" } }
    },
    feriados: [ "01-01-2025", "04-03-2025", "01-05-2025", "25-12-2025" ]
};

// ⭐ NOVO: Função que verifica e cria os arquivos de dados se não existirem
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
}


// --- ROTAS DA API ---

// ROTA POST (SALVAR) - Nenhuma alteração necessária aqui
app.post('/api/prices', async (req, res) => {
    // ... seu código da rota POST continua o mesmo ...
    const { password, days, prices, messages, isPermanent, startDate, endDate, responsible, notes } = req.body;
    if (password !== process.env.ADMIN_PASSWORD) {
        return res.status(401).json({ message: "Senha incorreta!" });
    }
    if (isPermanent) {
        try {
            const pricesDataRaw = await fs.readFile(pricesFilePath, 'utf8');
            const pricesData = JSON.parse(pricesDataRaw);
            days.forEach(day => { /* ...lógica de alteração... */ });
            await fs.writeFile(pricesFilePath, JSON.stringify(pricesData, null, 2));
            return res.json({ message: "Preços permanentes atualizados!", updatedPrices: pricesData });
        } catch (error) {
            return res.status(500).json({ message: "Erro ao salvar alteração permanente." });
        }
    } else {
        try {
            const overridesDataRaw = await fs.readFile(overridesFilePath, 'utf8');
            const overrides = JSON.parse(overridesDataRaw);
            const newOverride = { id: uuidv4(), startDate, endDate, days, prices, messages, responsible, notes, createdAt: new Date().toISOString() };
            overrides.push(newOverride);
            await fs.writeFile(overridesFilePath, JSON.stringify(overrides, null, 2));
            return res.json({ message: "Alteração temporária salva com sucesso!" });
        } catch (error) {
            return res.status(500).json({ message: "Erro ao salvar alteração temporária." });
        }
    }
});

// ROTA GET (CARREGAR) - Nenhuma alteração necessária aqui
app.get('/api/prices', async (req, res) => {
    // ... seu código da rota GET continua o mesmo ...
    try {
        const pricesDataRaw = await fs.readFile(pricesFilePath, 'utf8');
        const basePrices = JSON.parse(pricesDataRaw);
        const overridesDataRaw = await fs.readFile(overridesFilePath, 'utf8');
        const overrides = JSON.parse(overridesDataRaw);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const activeOverrides = overrides.filter(override => { /* ...lógica de filtro... */ });
        if (activeOverrides.length === 0) { return res.json(basePrices); }
        const finalPrices = JSON.parse(JSON.stringify(basePrices));
        activeOverrides.forEach(override => { /* ...lógica de merge... */ });
        res.json(finalPrices);
    } catch (error) {
        console.log("Erro na rota GET /api/prices:", error);
        res.status(500).json({ message: "Erro ao ler os arquivos de preços." });
    }
});


// --- INICIALIZAÇÃO DO SERVIDOR ---
app.listen(PORT, async () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    // ⭐ NOVO: Chama a função de inicialização dos arquivos ao iniciar o servidor
    await initializeDataFiles();
});