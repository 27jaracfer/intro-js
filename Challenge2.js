const prompt = require('prompt-sync')();
let coins = 0; while (coins < 15) {
   let collected = parseInt(prompt("Enter coins collected this turn (1-3): "));
   coins += collected;
   console.log("Total coins: " + coins);
}
console.log("Treasure unlocked!");