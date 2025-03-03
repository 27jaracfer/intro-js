const prompt = require('prompt-sync')();
let hero = "Link";
let number = "99";
let enteredCode = prompt("Enter the secret code: ");
if (enteredCode === hero + number) {
   console.log("Door unlocked!");
} else {
console.log("Access denied!");
}