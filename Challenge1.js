const prompt = require('prompt-sync')();
let health = parseInt(prompt("Enter player's health: "));
if (health > 30) {
   console.log("You're healthy, no need for a potion!");
} else {
   console.log("You're injured, drink a potion!");
}