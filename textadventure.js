// import prompt function
const prompt = require('prompt-sync')();

// Game state variables
let playerName = "";
let rabbitFound = false;
let inventory = [];
let location = "house"; // Starting location
let gameOver = false;

function startGame() {
playerName = prompt("Welcome to the Lost Rabbit Adventure! What's your name?");
console.log(`Hello, ${playerName}! Your pet rabbit, Flopsy, has gone missing! It's time to find them.`);
gameLoop();
}

function gameLoop() {
while (!gameOver) {
console.log("\n--- Game Status ---");
console.log(`Location: ${location}`);
console.log(`Inventory: ${inventory.join(", ")}`);
console.log(`Rabbit Found: ${rabbitFound ? "Yes" : "No"}`);

if (location === "house") {
housePath();
} else if (location === "garden") {
gardenPath();
} else {
console.log("You seem lost... Please make a decision.");
gameOver = true; // End game if no valid location is found
}
}
console.log("\nGame Over! Thanks for playing.");
}

function housePath() {
console.log("\nYou are in your house. It's cozy, but the rabbit is nowhere to be found.");
let action = prompt("Do you want to search the house or go to the garden?");

if (action.toLowerCase() === "search") {
console.log("You search the house... but you can't find Flopsy anywhere.");
inventory.push("Magnifying Glass");
console.log("You found a magnifying glass! Maybe this will help...");
} else if (action.toLowerCase() === "garden") {
console.log("You decide to head to the garden to look for Flopsy.");
location = "garden"; // Move to garden
} else {
console.log("Invalid action! Please choose 'search' or 'garden'.");
}
}

function gardenPath() {
console.log("\nYou are now in the garden. The flowers are blooming, but there's no sign of Flopsy.");
let action = prompt("Do you want to look under the bushes or call out for Flopsy?");

if (action.toLowerCase() === "look") {
console.log("You crouch down and peek under the bushes... You spot something!");
let foundRabbit = Math.random() < 0.5; // 50% chance to find the rabbit

if (foundRabbit) {
rabbitFound = true;
console.log("You found Flopsy! The rabbit is safe and sound.");
gameOver = true; // End game when rabbit is found
} else {
console.log("No rabbit here, just some old gardening tools.");
}
} else if (action.toLowerCase() === "call") {
console.log("You call out, 'Flopsy! Where are you?'... You hear a rustling in the bushes.");
let rabbitNearby = Math.random() < 0.7; // 70% chance the rabbit responds

if (rabbitNearby) {
console.log("Flopsy hops out from behind the bushes! You've found your rabbit!");
rabbitFound = true;
gameOver = true; // End game when rabbit is found
} else {
console.log("No response. The garden is quiet again.");
}
} else {
console.log("Invalid action! Please choose 'look under the bushes' or 'call out'.");
}
}

// Start the game
startGame();
