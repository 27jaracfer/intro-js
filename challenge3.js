const prompt = require('prompt-sync')();
let effectiveAttacks = ["Fireball", "Lightning", "Ice Blast","Shadow Strike"];
let attack = prompt("Choose your attack: ");
if (effectiveAttacks.includes(attack)) {
   console.log("It's super effective! The boss takes damage.");
} else {
   console.log("The boss resists the attack. Try something else!");
}