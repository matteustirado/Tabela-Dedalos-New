// Função para pegar o nome do dia
function pegarNomeDia(numero) {
    const dias = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
    return dias[numero];
}

// Pega o dia atual
const hoje = new Date().getDay();
const nomeDia = pegarNomeDia(hoje);

// Seleciona todos os sliders
const sliders = document.querySelectorAll('.slider');

// Esconde todos os sliders
sliders.forEach(slider => {
    slider.style.display = 'none';
});

// Pega o slider correspondente ao dia atual
const sliderHoje = document.getElementById(`slider-${nomeDia}`);

// Deixa o slider do dia atual com display: flex
if (sliderHoje) {
    sliderHoje.style.display = 'flex';
    sliderHoje.style.justifyContent = 'center';
    sliderHoje.style.alignItems = 'center';
}

// Pega todas as imagens do slider do dia atual
const imagens = sliderHoje.querySelectorAll('img');
let indiceAtual = 0;

// Inicializa: esconde todas as imagens, exceto a primeira
imagens.forEach((img, index) => {
    img.style.display = index === 0 ? 'block' : 'none';
});

setInterval(() => {
    // Esconde a imagem atual
    imagens[indiceAtual].style.display = 'none';

    // Avança para a próxima imagem
    indiceAtual = (indiceAtual + 1) % imagens.length;

    // Mostra a nova imagem
    imagens[indiceAtual].style.display = 'block';
}, 10000); // Troca a cada 10 segundos
