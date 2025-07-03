const express = require('express');
const fs = require('fs').promises;
const path = 'path';
const { v4: uuidv4 } = require('uuid'); // Usaremos para dar um ID único a cada alteração temporária
const app = express();
const PORT = 3000;

// Instale o 'uuid' com: npm install uuid
// Ele é necessário para a lógica de overrides.

app.use(express.json());
app.use(express.static(__dirname));

const dataPath = '/data';
const pricesFilePath = path.join(dataPath, 'precos.json');
const overridesFilePath = path.join(dataPath, 'overrides.json');

// ROTA POST (SALVAR): Agora decide onde salvar a alteração
app.post('/api/prices', async (req, res) => {
    const { password, days, prices, messages, isPermanent, startDate, endDate, responsible, notes } = req.body;

    // A validação de senha deve ser mais robusta em produção
    if (password !== process.env.ADMIN_PASSWORD) {
        return res.status(401).json({ message: "Senha incorreta!" });
    }

    // LÓGICA PARA ALTERAÇÃO PERMANENTE
    if (isPermanent) {
        try {
            const pricesDataRaw = await fs.readFile(pricesFilePath, 'utf8');
            const pricesData = JSON.parse(pricesDataRaw);

            days.forEach(day => {
                if (pricesData.dias[day]) {
                    Object.assign(pricesData.dias[day].player, prices.player);
                    Object.assign(pricesData.dias[day].amiga, prices.amiga);
                    Object.assign(pricesData.dias[day].marmita, prices.marmita);
                    pricesData.dias[day].amiga.message = messages.amiga;
                    pricesData.dias[day].marmita.message = messages.marmita;
                }
            });

            await fs.writeFile(pricesFilePath, JSON.stringify(pricesData, null, 2));
            return res.json({ message: "Preços permanentes atualizados!", updatedPrices: pricesData });
        } catch (error) {
            return res.status(500).json({ message: "Erro ao salvar alteração permanente." });
        }
    } 
    // LÓGICA PARA ALTERAÇÃO TEMPORÁRIA
    else {
        try {
            const overridesDataRaw = await fs.readFile(overridesFilePath, 'utf8');
            const overrides = JSON.parse(overridesDataRaw);

            const newOverride = {
                id: uuidv4(), // Um ID único para a alteração
                startDate,
                endDate,
                days,
                prices,
                messages,
                responsible,
                notes,
                createdAt: new Date().toISOString()
            };

            overrides.push(newOverride);
            await fs.writeFile(overridesFilePath, JSON.stringify(overrides, null, 2));
            
            // Retorna sucesso (não precisa retornar os preços, pois a base não mudou)
            return res.json({ message: "Alteração temporária salva com sucesso!" });

        } catch (error) {
            return res.status(500).json({ message: "Erro ao salvar alteração temporária." });
        }
    }
});

// ROTA GET (CARREGAR): Agora mescla preços base com alterações temporárias
app.get('/api/prices', async (req, res) => {
    try {
        const pricesDataRaw = await fs.readFile(pricesFilePath, 'utf8');
        const basePrices = JSON.parse(pricesDataRaw);

        const overridesDataRaw = await fs.readFile(overridesFilePath, 'utf8');
        const overrides = JSON.parse(overridesDataRaw);

        const today = new Date();
        today.setHours(0, 0, 0, 0); // Zera a hora para comparar apenas a data

        // Filtra apenas as alterações temporárias que estão ativas hoje
        const activeOverrides = overrides.filter(override => {
            const startDate = new Date(override.startDate + 'T00:00:00'); // Considera o fuso horário local
            const endDate = new Date(override.endDate + 'T23:59:59');
            return today >= startDate && today <= endDate;
        });

        if (activeOverrides.length === 0) {
            return res.json(basePrices); // Se não houver nada ativo, retorna os preços base
        }

        // Se houver, cria uma cópia dos preços base para não modificá-los
        const finalPrices = JSON.parse(JSON.stringify(basePrices));

        // Aplica as alterações ativas sobre os preços base
        activeOverrides.forEach(override => {
            override.days.forEach(day => {
                if (finalPrices.dias[day]) {
                    Object.assign(finalPrices.dias[day].player, override.prices.player);
                    Object.assign(finalPrices.dias[day].amiga, override.prices.amiga);
                    Object.assign(finalPrices.dias[day].marmita, override.prices.marmita);
                    finalPrices.dias[day].amiga.message = override.messages.amiga;
                    finalPrices.dias[day].marmita.message = override.messages.marmita;
                }
            });
        });

        res.json(finalPrices);

    } catch (error) {
        res.status(500).json({ message: "Erro ao ler os arquivos de preços." });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});