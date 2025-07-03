// script/realtime.js

// Conecta-se automaticamente ao servidor
const socket = io();

// Ouve pelo evento 'prices_updated' que o servidor envia
socket.on('prices_updated', (data) => {
    console.log('Aviso de atualização recebido do servidor:', data.message);
    
    // Recarrega a página para buscar os novos preços
    location.reload();
});

socket.on('connect', () => {
    console.log('Conectado ao servidor para atualizações em tempo real.');
});