// javascript
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const startScreen = document.getElementById("startScreen");
const music = document.getElementById("music");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

let gameStarted = false;
let gameOver = false;

let score = 0;
let highScore = 0;

let gravity = 0.65;
let speed = 6;

const playerImage = new Image();
playerImage.src = "assets/tung.png";

const dpr = window.devicePixelRatio || 1;

canvas.width = WIDTH * dpr;
canvas.height = HEIGHT * dpr;

canvas.style.width = WIDTH + "px";
canvas.style.height = HEIGHT + "px";

ctx.scale(dpr, dpr);

const player = {
    x: 150,
    y: 350,
    width: 70,
    height: 100,

    velocityY: 0,

    rotation: 0,

    grounded: false
};

let platforms = [];
let spikes = [];

function resetGame() {
    player.x = 150;
    player.y = 350;
    player.velocityY = 0;
    player.rotation = 0;

    score = 0;
    speed = 6;

    gameOver = false;

    platforms = [];
    spikes = [];

    createInitialPlatforms();
}

function createInitialPlatforms() {

    platforms.push({
        x: 0,
        y: 500,
        width: 1200,
        height: 100
    });

    let currentX = 500;

    for (let i = 0; i < 8; i++) {
        generateChunk(currentX);
        currentX += 300;
    }
}

function generateChunk(startX) {

    const platformWidth =
        120 + Math.random() * 100;

    const platformY =
        350 + Math.random() * 120;

    platforms.push({
        x: startX,
        y: platformY,
        width: platformWidth,
        height: 25
    });

    if (Math.random() < 0.5) {

        spikes.push({
            x: startX + platformWidth - 40,
            y: platformY - 30,
            width: 30,
            height: 30
        });
    }
}

function jump() {

    if (!gameStarted) {
        startGame();
        return;
    }

    if (gameOver) return;

    if (player.grounded) {
        player.velocityY = -14;
        player.grounded = false;
    }
}

function startGame() {

    gameStarted = true;
    startScreen.style.display = "none";

    music.play().catch(() => {});
}

function update() {

    if (!gameStarted || gameOver) return;

    score += 0.02;

    speed += 0.0005;

    player.velocityY += gravity;
    player.y += player.velocityY;

    player.grounded = false;

    for (const platform of platforms) {

        const landing =
            player.velocityY > 0 &&
            player.x + player.width > platform.x &&
            player.x < platform.x + platform.width &&
            player.y + player.height >= platform.y &&
            player.y + player.height <= platform.y + 20;

        if (landing) {
            player.y = platform.y - player.height;
            player.velocityY = 0;
            player.grounded = true;
            player.rotation = 0;
        }
    }

    if (!player.grounded) {
        player.rotation += 0.12;
    }

    for (const platform of platforms) {
        platform.x -= speed;
    }

    for (const spike of spikes) {
        spike.x -= speed;
    }

    platforms = platforms.filter(
        p => p.x + p.width > -100
    );

    spikes = spikes.filter(
        s => s.x + s.width > -100
    );

    let furthestX = 0;

    for (const p of platforms) {
        if (p.x > furthestX) {
            furthestX = p.x;
        }
    }

    while (furthestX < WIDTH + 400) {
        furthestX += 300;
        generateChunk(furthestX);
    }

    for (const spike of spikes) {

        if (
            player.x < spike.x + spike.width &&
            player.x + player.width > spike.x &&
            player.y < spike.y + spike.height &&
            player.y + player.height > spike.y
        ) {
            gameOver = true;
        }
    }

    if (player.y > HEIGHT + 200) {
        gameOver = true;
    }

    if (score > highScore) {
        highScore = score;
    }
}

function drawSky() {
    ctx.fillStyle = "#87CEEB";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
}

function drawPlatforms() {

    ctx.fillStyle = "#444";

    for (const platform of platforms) {

        ctx.fillRect(
            platform.x,
            platform.y,
            platform.width,
            platform.height
        );
    }
}

function drawSpikes() {

    ctx.fillStyle = "#d62828";

    for (const spike of spikes) {

        ctx.beginPath();

        ctx.moveTo(
            spike.x,
            spike.y + spike.height
        );

        ctx.lineTo(
            spike.x + spike.width / 2,
            spike.y
        );

        ctx.lineTo(
            spike.x + spike.width,
            spike.y + spike.height
        );

        ctx.fill();
    }
}

function drawPlayer() {

    ctx.save();

    ctx.translate(
        player.x + player.width / 2,
        player.y + player.height / 2
    );

    ctx.rotate(player.rotation);

    ctx.drawImage(
        playerImage,
        -player.width / 2,
        -player.height / 2,
        player.width,
        player.height
    );

    ctx.restore();
}

function drawScore() {

    ctx.fillStyle = "white";
    ctx.font = "28px Arial";

    ctx.fillText(
        `Score: ${Math.floor(score)}`,
        20,
        40
    );

    ctx.fillText(
        `High Score: ${Math.floor(highScore)}`,
        20,
        80
    );
}

function drawGameOver() {

    if (!gameOver) return;

    ctx.fillStyle = "white";
    ctx.font = "48px Arial";

    ctx.fillText(
        "GAME OVER",
        Math.round(WIDTH / 2 - 160),
        Math.round(HEIGHT / 2)
    );

    ctx.font = "24px Arial";

    ctx.fillText(
        "Press R to Restart",
        WIDTH / 2 - 95,
        HEIGHT / 2 + 50
    );
}

function draw() {

    drawSky();
    drawPlatforms();
    drawSpikes();
    drawPlayer();
    drawScore();
    drawGameOver();
}

function gameLoop() {

    update();
    draw();

    requestAnimationFrame(gameLoop);
}

window.addEventListener("keydown", e => {

    if (e.code === "Space" || e.code === "KeyW") {
        e.preventDefault();
        jump();
    }

    if (e.code === "KeyR" && gameOver) {
        resetGame();
    }
});

canvas.addEventListener("touchstart", e => {
    e.preventDefault();
    jump();
});

resetGame();
gameLoop();
