class SplashScreen {
    constructor() {
        this.splashScreen = document.getElementById('splashScreen');
        this.particleCanvas = document.getElementById('particleCanvas');
        this.ctx = this.particleCanvas.getContext('2d');
        this.particles = [];
        this.init();
    }

    init() {
        // Configurar o canvas
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Iniciar animações
        this.createParticles();
        this.animate();
        
        // Adicionar efeitos de flutuação aos elementos multichrome
        this.initMultichromeEffects();
    }

    resizeCanvas() {
        this.particleCanvas.width = window.innerWidth;
        this.particleCanvas.height = window.innerHeight;
    }

    createParticles() {
        const numberOfParticles = 50;
        for (let i = 0; i < numberOfParticles; i++) {
            this.particles.push({
                x: Math.random() * this.particleCanvas.width,
                y: Math.random() * this.particleCanvas.height,
                size: Math.random() * 2 + 1,
                speedX: Math.random() * 2 - 1,
                speedY: Math.random() * 2 - 1,
                opacity: Math.random() * 0.5 + 0.2
            });
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.particleCanvas.width, this.particleCanvas.height);
        
        this.particles.forEach(particle => {
            // Atualizar posição
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            
            // Verificar bordas
            if (particle.x < 0 || particle.x > this.particleCanvas.width) particle.speedX *= -1;
            if (particle.y < 0 || particle.y > this.particleCanvas.height) particle.speedY *= -1;
            
            // Desenhar partícula
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(245, 166, 35, ${particle.opacity})`;
            this.ctx.fill();
        });
        
        requestAnimationFrame(() => this.animate());
    }

    initMultichromeEffects() {
        const lights = document.querySelectorAll('.multichrome-ambient-1, .multichrome-ambient-2, .multichrome-ambient-3');
        lights.forEach((light, index) => {
            light.style.animation = `float-${index + 1} ${15 + index * 3}s infinite ease-in-out`;
        });
    }
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    new SplashScreen();
});

// Adicionar os keyframes das animações
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    @keyframes float-1 {
        0%, 100% { transform: translate(-10px, -10px); }
        50% { transform: translate(10px, 10px); }
    }
    @keyframes float-2 {
        0%, 100% { transform: translate(10px, -10px); }
        50% { transform: translate(-10px, 10px); }
    }
    @keyframes float-3 {
        0%, 100% { transform: translate(-15px, 5px); }
        50% { transform: translate(15px, -5px); }
    }
`;
document.head.appendChild(styleSheet);
