// import prompt function
const prompt = require('prompt-sync')();

// Game state variables
let playerName = "";
let rabbitFound = false;
let inventory = [];
let location = "Hanted house"; // Starting location
let gameOver = false;

function startGame() {
    playerName = prompt("Welcome to the Hanted House escape room! What's your name?");
    console.log(`Hello, ${playerName}! Your goal is to escape this Hanted house alive by fining the speacil key.`);
    gameLoop();
}

function gameLoop() {
    while (!gameOver) {
        console.log("\n--- Game Status ---");
        console.log(`Location: ${location}`);
        console.log(`Inventory: ${inventory.join(", ")}`);


        if (location === "Hanted house") {
            housePath();
        } else if (location === "Master bed room") {
            gardenPath();
        } else if (location === "Garage") {
            Garage()
        } else if (location === "Backyard") {
            Backyard()
        } else {
            console.log("You seem lost... Please make a decision.");
            gameOver = true; // End game if no valid location is found
        }
    }
    console.log("\nGame Over! Thanks for playing.");
}

function housePath() {
    console.log("\nYou are in the Hanted house your first misson is to look for the special key.");
    let action = prompt("Do you want to search the Master bed room yes or no?");

    if (action.toLowerCase() === "yes") {
        console.log("You search the Master bed room... but you can't find the key .");
        inventory.push("Crowbar");
        console.log("You found a Crowbar! Maybe this will open the door...");
        console.log("You go to the main door but it wont open, you look around and see a small hole next to the Garage door.");
        let action = prompt("Do you want to open the Garage door yes or no?");
        if (action.toLowerCase() === "yes") {
            console.log("You walk in the Garage .");
            location = "Garage"
        } else if (action.toLowerCase() === "no ") {
            console.log('You try to hid and a Ghost finds you ')
        }

    } else if (action.toLowerCase() === "no") {
        console.log('You wait for the poice to save you')
    } else {
        console.log("Invalid action! Please choose 'yes' or 'no'.");
    }
}

function Garage() {
    console.log("\nYou walk in the Garage the door slams behind you, you try to open it but its locked, you look over and see a chest in the corner.");
    let action = prompt("Do you want to use your Crowbar to open it yes or no?");

    if (action.toLowerCase() === "yes") {
        console.log(" you carefully open it and see a large vacuum inside!");
        console.log("You grab it and put it on...");
        inventory.push("Vacuum");
        console.log("The room starts getting smaller you have to escape fast ...");
        let action = prompt("Do you want to use the Vacuum to suck up the door to escape yes or no?");
        if (action.toLowerCase() === "yes") {
            console.log("you successfully tore the door down!");
            console.log("you walk out then and keep looking for your next room, and find the door to the backyard you use your Vacuum and tore it down then you walk in!");
            location= "Backyard"
        }

    } else if (action.toLowerCase() === "no") {
        console.log("you keep searching the room and a Ghost attacks Game over.");

    }
}

function Backyard() {
    console.log("\nYou walk in the Backyard and see the Special key you go to it and pick it up.");
    inventory.push("Special key");
    console.log("\nYou are about to walk out and the door slams in your face you turn around and see a large Ghost stare at you, telling you if you want to escape you have to fight him.");
    let action = prompt("Do you want to fight the King Ghost yes or no?");
    if (action.toLowerCase() === "yes") {
        console.log("\nyou grab your Vacuum and get ready.");
        let action = prompt("Do you want to wait for the Ghost to attack or just jump in?");
        if (action.toLowerCase() === "wait") {
            console.log("\nYou wait until it gets close to you then you vaccum it up.");
            console.log("\nYou succsesfully defeated him you run back to the Main door.");
            let action = prompt("Do you want to use your Special key yes or no?");
            if (action.toLowerCase() === "yes") {
                console.log("\nYou open the door and succsesfully escape congratulations The End.");
                gameOver=true
            } else if (action.toLowerCase() === "no")
                console.log("\nYou wait for the police to save you.");

        } else if (action.toLowerCase() === "Jump") {
            console.log("\nYou jump in and he eats you up.");
        }
    }

    else if (action.toLowerCase() === "no") {
        console.log("\nThe King Ghost grabs you and takes you away forever.");
    }


}
    // Start the game
    startGame();
