const prompt = require("prompt-sync")(); // Ask for user inputs
let gameCharacter = prompt("Enter a game character: ");
let weapon = prompt("Enter a weapon: ");
let story = "Once upon a time " + gameCharacter + " was on a mission to ..."
console.log(story);
