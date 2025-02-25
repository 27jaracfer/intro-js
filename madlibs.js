const prompt = require("prompt-sync")(); // Ask for user inputs
let gameCharacter = prompt(" pick a charcter : ");
let gameCharacter2 = prompt("pick a charcter : ");
let gameCharacter3 = prompt("pick a charcter : ");
let gameCharacter4 = prompt("pick a charcter : ");
let gameCharacter5 = prompt("pick a charcter : ");
let gameCharacter6 = prompt("pick a charcter: ");
let weapon = prompt("pick a weapon: ");
let weapon2 = prompt("pick a weapon: ");
let story2 = " Once upon a time "+gameCharacter4+" was resting in her room waiting for "+gameCharacter+" to return  but then a "+weapon+" blasts threw "+gameCharacter4+" window she look over it's "+gameCharacter5+", and his evil son "+gameCharacter6+", they quickly grab her. "+gameCharacter4+" uses her "+weapon2+" to try to fight back but "+gameCharacter5+", and "+gameCharacter6+" where to strong so then they quicky grab "+gameCharacter4+"  and toke her away. ..."
let story = "Once upon a time "+gameCharacter+", "+gameCharacter2+", and "+gameCharacter3+" were taking there daily walk around the castle but then they heard a loud blast coming from the direction of the castle, "+gameCharacter+", "+gameCharacter2+", and "+gameCharacter3+" ran into the castle to "+gameCharacter4+" is room. They look around and find her missing,  then finds a note form "+gameCharacter5+", and "+gameCharacter6+" reading come and find us. So "+gameCharacter+", "+gameCharacter2+", and "+gameCharacter3+" set off on another adventure to save "+gameCharacter4+" ..."
console.log(story);