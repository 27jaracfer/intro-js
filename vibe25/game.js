// Game canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
canvas.width = 1200;
canvas.height = 800;

// Game state
let gameStarted = false;
let gameWon = false;
let currentLevel = 1;
let zombiesDefeated = 0;
let waveNumber = 1;
let lastWaveSpawn = 0;
const WAVE_DELAY = 20000; // 20 seconds between waves

let player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: 30,
    speed: 5,
    health: 150,
    hasSword: true,
    swordCooldown: 0,
    isAttacking: false,
    attackDuration: 0,
    facingRight: true // New property to track player direction
};

let zombies = [];
let lastZombieSpawn = 0;
const MIN_ZOMBIE_DISTANCE = 200; // Minimum distance between zombies when spawning
const ATTACK_DURATION = 20; // Duration of attack animation in frames
const ATTACK_COOLDOWN = 30; // Cooldown between attacks in frames

// Level configuration
const LEVEL_CONFIG = {
    1: { zombiesPerWave: 3, totalZombies: 6, background: '#2ecc71' }, // Green background for level 1
    2: { zombiesPerWave: 4, totalZombies: 8, background: '#1a237e' }, // Dark blue background for level 2
    3: { zombiesPerWave: 5, totalZombies: 10, background: '#2ecc71' }, // Green background for level 3
    4: { zombiesPerWave: 3, totalZombies: 5, background: '#1a237e' }, // Dark blue background for level 4
    5: { zombiesPerWave: 1, totalZombies: 1, background: '#000000' } // Black background for level 5
};

// Escape boat
const boat = {
    x: canvas.width - 100,
    y: canvas.height - 100,
    width: 80,
    height: 60,
    repaired: false
};

// Health potion
let healthPotion = {
    x: 0,
    y: 0,
    size: 20,
    active: false
};

// Draw boat
function drawBoat() {
    // Draw boat body
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(boat.x, boat.y, boat.width, boat.height);
    
    // Draw mast
    ctx.fillStyle = '#654321';
    ctx.fillRect(boat.x + boat.width/2 - 5, boat.y - 40, 10, 40);
    
    // Draw sail
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(boat.x + boat.width/2, boat.y - 40);
    ctx.lineTo(boat.x + boat.width/2 - 20, boat.y - 20);
    ctx.lineTo(boat.x + boat.width/2 + 20, boat.y - 20);
    ctx.closePath();
    ctx.fill();
}

// Check if player can escape
function checkEscape() {
    if (checkCollision(player, boat)) {
        gameWon = true;
        gameStarted = false;
        showWinScreen();
    }
}

// Show win screen
function showWinScreen() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#2ecc71';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('You Escaped!', canvas.width / 2, canvas.height / 2);
    ctx.font = '24px Arial';
    ctx.fillText('Press SPACE to play again', canvas.width / 2, canvas.height / 2 + 40);
}

// Show level complete screen
function showLevelCompleteScreen() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#3498db';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`Level ${currentLevel} Complete!`, canvas.width / 2, canvas.height / 2);
    ctx.font = '24px Arial';
    ctx.fillText('Press SPACE to continue to Level ' + (currentLevel + 1), canvas.width / 2, canvas.height / 2 + 40);
    ctx.fillText('Your health will stay at ' + player.health, canvas.width / 2, canvas.height / 2 + 80);
    ctx.fillText('Zombies defeated will reset to 0', canvas.width / 2, canvas.height / 2 + 120);
    if (currentLevel === 1) {
        ctx.fillText('Next level: Dark Blue Map', canvas.width / 2, canvas.height / 2 + 160);
    }
    if (currentLevel === 3) {
        ctx.fillText('Next level: Zombies take 2 hits to kill', canvas.width / 2, canvas.height / 2 + 160);
    }
    if (currentLevel === 4) {
        ctx.fillText('Next level: Giant Zombie Boss!', canvas.width / 2, canvas.height / 2 + 160);
    }
}

// Start next level
function startNextLevel() {
    currentLevel++;
    zombiesDefeated = 0;
    zombies = [];
    waveNumber = 1;
    lastWaveSpawn = 0;
    
    // Reset player stats but keep health
    player.hasSword = true;
    player.swordCooldown = 0;
    player.isAttacking = false;
    player.attackDuration = 0;
    
    // Reset player position
    player.x = canvas.width / 2;
    player.y = canvas.height / 2;
    
    // Update health display
    document.getElementById('health').textContent = player.health;
    
    // Spawn first wave of zombies
    const config = LEVEL_CONFIG[currentLevel];
    for (let i = 0; i < config.zombiesPerWave; i++) {
        spawnZombie();
    }

    // Spawn health potion in level 4
    if (currentLevel === 4) {
        spawnHealthPotion();
    }
}

// Spawn health potion
function spawnHealthPotion() {
    const position = findValidSpawnPosition();
    healthPotion.x = position.x;
    healthPotion.y = position.y;
    healthPotion.active = true;
}

// Input handling
const keys = {};
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (e.key === ' ') {
        if (gameWon) {
            // Reset game for new playthrough
            currentLevel = 1;
            gameWon = false;
            gameStarted = true;
            zombiesDefeated = 0;
            // Spawn first wave of zombies for level 1
            const config = LEVEL_CONFIG[currentLevel];
            for (let i = 0; i < config.zombiesPerWave; i++) {
                spawnZombie();
            }
            gameLoop();
        } else if (!gameStarted) {
            // Start new game or continue to next level
            if (currentLevel === 1 && zombiesDefeated === 0) {
                gameStarted = true;
                zombiesDefeated = 0;
                // Spawn first wave of zombies for level 1
                const config = LEVEL_CONFIG[currentLevel];
                for (let i = 0; i < config.zombiesPerWave; i++) {
                    spawnZombie();
                }
                gameLoop();
            } else {
                // Continue to next level
                startNextLevel();
                gameStarted = true;
                gameLoop();
            }
        } else if (gameStarted && player.swordCooldown === 0) {
            player.isAttacking = true;
            player.attackDuration = ATTACK_DURATION;
            player.swordCooldown = ATTACK_COOLDOWN;
        }
    } else if (e.key === 'c' && gameStarted && player.swordCooldown === 0) {
        // Move right and attack when pressing C
        player.x += player.speed;
        player.facingRight = true;
        player.isAttacking = true;
        player.attackDuration = ATTACK_DURATION;
        player.swordCooldown = ATTACK_COOLDOWN;
    }
});
document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Check if a position is far enough from other zombies
function isPositionValid(x, y) {
    for (const zombie of zombies) {
        const dx = x - zombie.x;
        const dy = y - zombie.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < MIN_ZOMBIE_DISTANCE) {
            return false;
        }
    }
    return true;
}

// Find valid spawn position
function findValidSpawnPosition() {
    let attempts = 0;
    const maxAttempts = 50;
    
    while (attempts < maxAttempts) {
        const x = Math.random() * (canvas.width - 30);
        const y = Math.random() * (canvas.height - 30);
        
        if (isPositionValid(x, y)) {
            return { x, y };
        }
        attempts++;
    }
    
    // If no valid position found, return a random position
    return {
        x: Math.random() * (canvas.width - 30),
        y: Math.random() * (canvas.height - 30)
    };
}

// Spawn zombie
function spawnZombie() {
    const position = findValidSpawnPosition();
    const zombie = {
        x: position.x,
        y: position.y,
        size: currentLevel === 5 ? 60 : 30, // Bigger zombie in level 5
        speed: currentLevel === 5 ? 1 : 1.5, // Slower but bigger zombie in level 5
        health: currentLevel === 5 ? 5 : (currentLevel === 3 || currentLevel === 4 ? 2 : 1), // Takes 5 hits to kill in level 5
        active: true
    };
    zombies.push(zombie);
}

// Game loop
function gameLoop() {
    if (!gameStarted) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background based on current level
    ctx.fillStyle = LEVEL_CONFIG[currentLevel].background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw boat
    drawBoat();

    // Draw health potion in level 4
    if (currentLevel === 4 && healthPotion.active) {
        ctx.fillStyle = '#00ff00'; // Green color for health potion
        ctx.beginPath();
        ctx.arc(healthPotion.x + healthPotion.size/2, healthPotion.y + healthPotion.size/2, healthPotion.size/2, 0, Math.PI * 2);
        ctx.fill();
        
        // Check if player collects health potion
        if (checkCollision(player, healthPotion)) {
            player.health = Math.min(150, player.health + 40); // Heal 40 health, max 150
            document.getElementById('health').textContent = player.health;
            healthPotion.active = false;
        }
    }

    // Draw level info
    ctx.fillStyle = currentLevel === 2 ? '#ffffff' : '#000000'; // White text for dark background
    ctx.font = '20px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Level: ${currentLevel}`, 10, 30);
    ctx.fillText(`Zombies Defeated: ${zombiesDefeated}/${LEVEL_CONFIG[currentLevel].totalZombies}`, 10, 60);

    // Spawn second wave after delay (except for level 5)
    const currentTime = Date.now();
    if (waveNumber === 1 && currentTime - lastWaveSpawn >= WAVE_DELAY && currentLevel !== 5) {
        const config = LEVEL_CONFIG[currentLevel];
        for (let i = 0; i < config.zombiesPerWave; i++) {
            spawnZombie();
        }
        waveNumber = 2;
        lastWaveSpawn = currentTime;
    }

    // Update player position and direction
    if (keys['w'] || keys['ArrowUp']) player.y -= player.speed;
    if (keys['s'] || keys['ArrowDown']) player.y += player.speed;
    if (keys['a'] || keys['ArrowLeft']) {
        player.x -= player.speed;
        player.facingRight = false;
    }
    if (keys['d'] || keys['ArrowRight']) {
        player.x += player.speed;
        player.facingRight = true;
    }

    // Keep player in bounds
    player.x = Math.max(0, Math.min(canvas.width - player.size, player.x));
    player.y = Math.max(0, Math.min(canvas.height - player.size, player.y));

    // Update attack state
    if (player.isAttacking) {
        player.attackDuration--;
        if (player.attackDuration <= 0) {
            player.isAttacking = false;
        }
    }
    if (player.swordCooldown > 0) {
        player.swordCooldown--;
    }

    // Update and draw zombies
    zombies.forEach((zombie, index) => {
        if (zombie.active) {
            // Update zombie position
            const dx = player.x - zombie.x;
            const dy = player.y - zombie.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0) {
                zombie.x += (dx / distance) * zombie.speed;
                zombie.y += (dy / distance) * zombie.speed;
            }

            // Check collision with player
            if (checkCollision(player, zombie)) {
                player.health -= currentLevel === 5 ? 5 : 1; // Deal 5 damage in level 5
                document.getElementById('health').textContent = player.health;
                
                if (player.health <= 0) {
                    gameOver();
                    return;
                }
            }

            // Check if zombie is hit by sword
            if (player.isAttacking && checkSwordCollision(player, zombie)) {
                zombie.health--;
                if (zombie.health <= 0) {
                    zombie.active = false;
                    zombies.splice(index, 1);
                    zombiesDefeated++;
                    
                    // Heal player when killing a zombie
                    player.health = Math.min(150, player.health + 3); // Heal 3 health, max 150
                    document.getElementById('health').textContent = player.health;
                    
                    // Check if level is complete
                    if (zombiesDefeated >= LEVEL_CONFIG[currentLevel].totalZombies) {
                        if (currentLevel < 5) {
                            gameStarted = false;
                            showLevelCompleteScreen();
                        } else {
                            gameWon = true;
                            gameStarted = false;
                            showWinScreen();
                        }
                    }
                }
            }

            // Draw zombie
            ctx.fillStyle = currentLevel === 5 ? '#ff0000' : '#e74c3c'; // Redder color for big zombie
            ctx.fillRect(zombie.x, zombie.y, zombie.size, zombie.size);
        }
    });

    // Draw player
    ctx.fillStyle = '#3498db';
    ctx.fillRect(player.x, player.y, player.size, player.size);

    // Draw sword
    if (player.hasSword) {
        ctx.fillStyle = '#34495e';
        // Draw sword with attack animation
        if (player.isAttacking) {
            if (player.facingRight) {
                ctx.fillRect(player.x + player.size - 5, player.y + player.size/2 - 20, 25, 40);
            } else {
                ctx.fillRect(player.x - 20, player.y + player.size/2 - 20, 25, 40);
            }
        } else {
            if (player.facingRight) {
                ctx.fillRect(player.x + player.size - 5, player.y + player.size/2 - 10, 15, 20);
            } else {
                ctx.fillRect(player.x - 10, player.y + player.size/2 - 10, 15, 20);
            }
        }
    }

    // Check for escape
    checkEscape();

    // Continue game loop
    requestAnimationFrame(gameLoop);
}

// Collision detection
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.size &&
           rect1.x + rect1.size > rect2.x &&
           rect1.y < rect2.y + rect2.size &&
           rect1.y + rect1.size > rect2.y;
}

// Sword attack collision detection
function checkSwordCollision(player, zombie) {
    const swordRange = 60; // Increased sword range
    const dx = player.x - zombie.x;
    const dy = player.y - zombie.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Check if zombie is in front of player
    const isInFront = player.facingRight ? dx < 0 : dx > 0;
    return distance < swordRange && isInFront;
}

// Game over function
function gameOver() {
    gameStarted = false;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#e74c3c';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2);
    ctx.font = '24px Arial';
    ctx.fillText('Press SPACE to restart', canvas.width / 2, canvas.height / 2 + 40);
    
    // Reset game state
    currentLevel = 1;
    zombiesDefeated = 0;
    waveNumber = 1;
    player.health = 150;
    player.hasSword = true;
    zombies = [];
    lastWaveSpawn = 0;
    document.getElementById('health').textContent = player.health;
} 