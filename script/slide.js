document.addEventListener('DOMContentLoaded', function () {
    const diasSemana = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
    const hoje = new Date();
    const diaAtual = diasSemana[hoje.getDay()];

    const slider = document.getElementById('slider');
    const imagens = Array.from(slider.getElementsByTagName('img'));
    
    // Filtra apenas imagens do dia atual
    const imagensDia = imagens.filter(img => img.src.includes(diaAtual));
    
    let indiceAtual = 0;

    // Inicializa todas como invisíveis
    imagens.forEach(img => img.style.opacity = 0);

    if (imagensDia.length === 0) {
        console.warn(`Nenhuma imagem encontrada para o dia: ${diaAtual}`);
        return;
    }

    // Mostra a primeira imagem do dia
    imagensDia[indiceAtual].style.opacity = 1;

    setInterval(() => {
        // Esconde imagem atual
        imagensDia[indiceAtual].style.opacity = 0;

        // Avança índice
        indiceAtual = (indiceAtual + 1) % imagensDia.length;

        // Mostra próxima imagem
        imagensDia[indiceAtual].style.opacity = 1;
    }, 5000); // alterna a cada 3 segundos
});
