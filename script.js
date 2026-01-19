// ===== 3D INTERACTIVE GRID =====
const canvas = document.getElementById('grid');
const ctx = canvas.getContext('2d');

let width, height;
let time = 0;
let mouse = { x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5 };

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}

document.addEventListener('mousemove', (e) => {
    mouse.targetX = e.clientX / width;
    mouse.targetY = e.clientY / height;
});

function drawGrid() {
    time += 0.005;

    mouse.x += (mouse.targetX - mouse.x) * 0.05;
    mouse.y += (mouse.targetY - mouse.y) * 0.05;

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);

    const cols = 100;
    const rows = 100;
    const cellW = width / cols * 5;
    const cellH = height / rows * 5;

    const perspective = 400;
    const cameraZ = 600;
    const rotationX = (mouse.y - 0.5) * 0.15;
    const rotationY = (mouse.x - 0.5) * 0.15;

    // Calculate 3D points
    const points = [];
    for (let y = 0; y <= rows; y++) {
        points[y] = [];
        for (let x = 0; x <= cols; x++) {
            let px = (x - cols / 2) * cellW;
            let py = (y - rows / 2) * cellH;
            let pz = 0;

            const wave = Math.sin(x * 0.15 + time * 2) * Math.cos(y * 0.15 + time * 1.5) * 40 +
                        Math.sin(x * 0.1 - time) * Math.sin(y * 0.1 + time * 0.5) * 30;
            pz += wave;

            // Mouse influence - tight cursor tracking
            const normalizedX = (x / cols);
            const normalizedY = (y / rows);
            const mouseDx = mouse.x - normalizedX;
            const mouseDy = mouse.y - normalizedY;
            const distToMouse = Math.sqrt(mouseDx ** 2 + mouseDy ** 2);
            const mouseInfluence = Math.max(0, 1 - distToMouse / 0.2) ** 2;
            pz += mouseInfluence * 100;

            const cosX = Math.cos(rotationX);
            const sinX = Math.sin(rotationX);
            const y1 = py * cosX - pz * sinX;
            const z1 = py * sinX + pz * cosX;

            const cosY = Math.cos(rotationY);
            const sinY = Math.sin(rotationY);
            const x1 = px * cosY + z1 * sinY;
            const z2 = -px * sinY + z1 * cosY;

            const scale = perspective / (perspective + z2 + cameraZ);
            const screenX = width / 2 + x1 * scale;
            const screenY = height / 2 + y1 * scale;
            const depth = (z2 + 200) / 400;

            points[y][x] = { x: screenX, y: screenY, z: z2, depth, scale };
        }
    }

    // Draw grid lines
    ctx.lineCap = 'round';

    for (let y = 0; y <= rows; y++) {
        for (let x = 0; x < cols; x++) {
            const p1 = points[y][x];
            const p2 = points[y][x + 1];

            const depth = (p1.depth + p2.depth) / 2;
            const hue = 260 + depth * 40;
            const lightness = 30 + depth * 40;
            const alpha = 0.15 + depth * 0.5;

            ctx.strokeStyle = `hsla(${hue}, 70%, ${lightness}%, ${alpha})`;
            ctx.lineWidth = 0.5 + depth * 1.5;

            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
        }
    }

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x <= cols; x++) {
            const p1 = points[y][x];
            const p2 = points[y + 1][x];

            const depth = (p1.depth + p2.depth) / 2;
            const hue = 260 + depth * 40;
            const lightness = 30 + depth * 40;
            const alpha = 0.15 + depth * 0.5;

            ctx.strokeStyle = `hsla(${hue}, 70%, ${lightness}%, ${alpha})`;
            ctx.lineWidth = 0.5 + depth * 1.5;

            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
        }
    }

    // Glow at mouse position
    const glowX = mouse.x * width;
    const glowY = mouse.y * height;
    const glow = ctx.createRadialGradient(glowX, glowY, 0, glowX, glowY, 300);
    glow.addColorStop(0, 'rgba(139, 92, 246, 0.15)');
    glow.addColorStop(0.5, 'rgba(6, 182, 212, 0.05)');
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);

    // Edge fades
    const edgeFade = 80;

    const topGrad = ctx.createLinearGradient(0, 0, 0, edgeFade);
    topGrad.addColorStop(0, 'rgba(0, 0, 0, 0.8)');
    topGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = topGrad;
    ctx.fillRect(0, 0, width, edgeFade);

    const bottomGrad = ctx.createLinearGradient(0, height - edgeFade, 0, height);
    bottomGrad.addColorStop(0, 'transparent');
    bottomGrad.addColorStop(1, 'rgba(0, 0, 0, 0.8)');
    ctx.fillStyle = bottomGrad;
    ctx.fillRect(0, height - edgeFade, width, edgeFade);

    const leftGrad = ctx.createLinearGradient(0, 0, edgeFade, 0);
    leftGrad.addColorStop(0, 'rgba(0, 0, 0, 0.6)');
    leftGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = leftGrad;
    ctx.fillRect(0, 0, edgeFade, height);

    const rightGrad = ctx.createLinearGradient(width - edgeFade, 0, width, 0);
    rightGrad.addColorStop(0, 'transparent');
    rightGrad.addColorStop(1, 'rgba(0, 0, 0, 0.6)');
    ctx.fillStyle = rightGrad;
    ctx.fillRect(width - edgeFade, 0, edgeFade, height);

    requestAnimationFrame(drawGrid);
}

resize();
window.addEventListener('resize', resize);
drawGrid();

// ===== WORD CYCLE =====
const words = ['build', 'launch', 'scale', 'acquire'];
const wordEl = document.querySelector('.word');
let wordIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typeSpeed = 100;

function typeWord() {
    const currentWord = words[wordIndex];

    if (isDeleting) {
        wordEl.textContent = currentWord.substring(0, charIndex - 1);
        charIndex--;
        typeSpeed = 40;
    } else {
        wordEl.textContent = currentWord.substring(0, charIndex + 1);
        charIndex++;
        typeSpeed = 80 + Math.random() * 40;
    }

    if (!isDeleting && charIndex === currentWord.length) {
        typeSpeed = 2500;
        isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        typeSpeed = 400;
    }

    setTimeout(typeWord, typeSpeed);
}

setTimeout(typeWord, 600);
