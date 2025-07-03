const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

// Caminhos para os arquivos dentro do Disco Persistente
const dataPath = '/data';
const pricesFilePath = path.join(dataPath, 'precos.json');
const overridesFilePath = path.join(dataPath, 'overrides.json');

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
}

// ROTA POST (SALVAR)
app.post('/api/prices', async (req, res) => {
    const { password, days, prices, messages, isPermanent, startDate, endDate, responsible, notes } = req.body;
    if (password !== process.env.ADMIN_PASSWORD) {
        return res.status(401).json({ message: "Senha incorreta!" });
    }
    if (isPermanent) {
        try {
            const pricesDataRaw = await fs.readFile(pricesFilePath, 'utf8');
            const pricesData = JSON.parse(pricesDataRaw);
            days.forEach(day => {
                if (pricesData.dias[day]) {
                    Object.assign(pricesData.dias[day].prices.player, prices.player);
                    Object.assign(pricesData.dias[day].prices.amiga, prices.amiga);
                    Object.assign(pricesData.dias[day].prices.marmita, prices.marmita);
                    pricesData.dias[day].messages.amiga = messages.amiga;
                    pricesData.dias[day].messages.marmita = messages.marmita;
                }
            });
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

// ROTA GET (CARREGAR)
app.get('/api/prices', async (req, res) => {
    try {
        const pricesDataRaw = await fs.readFile(pricesFilePath, 'utf8');
        const basePrices = JSON.parse(pricesDataRaw);

        const overridesDataRaw = await fs.readFile(overridesFilePath, 'utf8');
        const overrides = JSON.parse(overridesDataRaw);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // ⭐ LÓGICA DE FILTRO COMPLETA E CORRIGIDA
        const activeOverrides = overrides.filter(override => {
            const startDate = new Date(override.startDate);
            const endDate = new Date(override.endDate);
            // Ajusta as datas para evitar problemas com fuso horário, considerando o dia inteiro.
            startDate.setHours(0,0,0,0);
            endDate.setHours(23,59,59,999);
            return today >= startDate && today <= endDate;
        });

        if (activeOverrides.length === 0) {
            return res.json(basePrices);
        }

        const finalPrices = JSON.parse(JSON.stringify(basePrices));

        // ⭐ LÓGICA DE MERGE COMPLETA E CORRIGIDA
        activeOverrides.forEach(override => {
            override.days.forEach(day => {
                if (finalPrices.dias[day]) {
                    // Mescla os preços e as mensagens do override sobre os preços base
                    Object.assign(finalPrices.dias[day].prices.player, override.prices.player);
                    Object.assign(finalPrices.dias[day].prices.amiga, override.prices.amiga);
                    Object.assign(finalPrices.dias[day].prices.marmita, override.prices.marmita);
                    finalPrices.dias[day].messages.amiga = override.messages.amiga;
                    finalPrices.dias[day].messages.marmita = override.messages.marmita;
                }
            });
        });

        res.json(finalPrices);

    } catch (error) {
        console.error("Erro detalhado na rota GET /api/prices:", error);
        res.status(500).json({ message: "Erro ao ler os arquivos de preços no servidor." });
    }
});


// INICIALIZAÇÃO DO SERVIDOR
app.listen(PORT, async () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    await initializeDataFiles();
});