const prompt = require('prompt-sync')();
function spawnEnemy(name, level) {
   let enemy = { name: name, level: level };
   console.log("A wild " + enemy.name + " appeared! Level: " + enemy.level);
}
spawnEnemy("Goblin", 3);
spawnEnemy("Goblin", 5);
spawnEnemy("Goblin", 4);
spawnEnemy("Dragon", 10);