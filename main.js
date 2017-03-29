
// TODO - bug with bouncing
// TODO change events of end of screens X to --> collide between objects - study it. to get only 1 time event when enemy collides with it instead of more.


var platforms, stars, cursors, scoreText, score = 0;

var player, runJumpFactor = 0;

var enemies, enemy, enemyCount = 1, deadEnemies, enemyVeloRightX = 100, enemyVeloLeftX = -100, isEnemyDead = false, isEnemyKicked = false;

var game = new Phaser.Game(800, 600, Phaser.AUTO);
var GameState = {
	preload: function () {
		game.load.image('sky', 'assets/sky.png');
		game.load.image('ground', 'assets/platform.png');
		game.load.image('star', 'assets/star.png');
		game.load.spritesheet('dude', 'assets/dude.png', 32, 48);
		game.load.spritesheet('baddie', 'assets/dude.png', 32, 48);
	},
	create: function () {
		// Enabling arcade Physics
		game.physics.startSystem(Phaser.Physics.ARCADE);

		// Adding sky background
		game.add.sprite(0, 0, 'sky');

		createGround();
		createLedges();
		createPlayer();
		createEnemiesGroup();
		createDeadEnemiesGroup();

		createStars();

		// Set up score:
		scoreText = game.add.text(16, 16, 'score: 0', {fontSize: '32px', fill: '#000'});

		// Game Controls
		cursors = game.input.keyboard.createCursorKeys();

		// Tween: not working now...
		// tween = game.add.tween(enemy).to( {x: enemy.position.x - 50}, 500, Phaser.Easing.Linear.None, false, 0, 0);
		// tween.onComplete.add(function(){tween.stop()});

	},
	update: function () {
		// Collide player & platforms / & stars, enemy & platforms, stars & platforms
		game.physics.arcade.collide(player, platforms, function () {
			// console.log("player collided with platforms")
		});
		game.physics.arcade.collide(stars, platforms);
		game.physics.arcade.collide(enemy, platforms, function () {
			// console.log(arguments.length)
		});

		// Reset player's velocity
		activateControls();

		// Check Player take star:
		game.physics.arcade.overlap(player, stars, collectStar, null, this);

		// Check Player hit Enemy
		game.physics.arcade.overlap(player, enemy, collisionHandler, null, this);

		handleEnemyBoundsCollision();
	}
};

// Add state:
game.state.add('GameState', GameState);
// Launch game:
game.state.start('GameState');

function activateControls() {
	player.body.velocity.x = 0;
	if (cursors.left.isDown) {
		player.body.velocity.x = -150;
		player.animations.play('left');
		checkRunJumpFactor(cursors.left.repeats)
	} else if (cursors.right.isDown) {
		player.body.velocity.x = 150;
		player.animations.play('right');
		checkRunJumpFactor(cursors.right.repeats);
	// Stopped Running
	} else {
		player.animations.stop();
		player.frame = 4;
		runJumpFactor = 0;
	}
	// Allow player to jump if touching ground
	handlePlayerJump();
}

function checkRunJumpFactor(directionRepeats) {
	// Check for runJumpFactor
	if (directionRepeats === 30) {
		runJumpFactor = 100;
	}
}

function handlePlayerJump() {
	var jumpAccelMultiplier = 0;
	// Jump
	if (cursors.up.isDown && player.body.touching.down) {
		// Basic Jump...
		bounceUp();
	// Dive down
	} else if (cursors.down.isDown) {
		player.body.velocity.y = 250;
		runJumpFactor = 0;
	}
}

function collectStar(player, star) {
	// Remove star from screen for now:
	star.kill();
	// Add & update score
	score += 10;
	scoreText.text = "Score:" + score;
}

function collisionHandler(player, enemy) {
	// Top Collision of Enemy:
	handleTopCollision(player, enemy);
	// Side Collision of Enemy:
	handleHorizontalCollision(player, enemy);
}

function handleHorizontalCollision(sprite1, sprite2) {
	let sprite1X = Math.floor(sprite1.body.position.x);
	let sprite2X = Math.floor(sprite2.body.position.x);
	// console.log('enemy', isEnemyDead, 'colliding with body', sprite2X - sprite1X)
	// Example: Enemy-sprite2 colliding with Player-Sprite1, collision from LEFT or RIGHT
	if ((sprite2X - sprite1X) === 30 || (sprite2X - sprite1X) === 29 && isEnemyDead) {
			// console.log('colliding with body from left');
			// Currently not working
			// tween.start();
	} else if ((sprite2X - sprite1X) === -30 || (sprite2X - sprite1X) === -29 && isEnemyDead){
			// console.log('colliding with body from right');
			// Currently not working
			// console.log('e pos x', enemy.position.x);
			// tween.start();
	}
}

function handleTopCollision(sprite1, sprite2) {
	let sprite1Y = Math.floor(player.body.position.y);
	let sprite2Y = Math.floor(enemy.body.position.y);

	if (isEnemyDead === false) {
		// Check if touching ground(not to kill mid-air)
		// Example: Player-sprite1 colliding with Enemy-sprite1 from the top part of sprite1.
		if (sprite1Y < sprite2Y && (sprite2Y - sprite1Y > 40 && sprite2.body.touching.down)) {
			resetEnemy(sprite2);
		}
	}
}

function resetEnemy(sprite) {
	// Only if touching platform / ground:
	if (sprite.body.touching.down) {
		isEnemyDead = true;
		sprite.body.velocity.y = 0;
		sprite.body.velocity.x = 0;
		sprite.animations.stop();
		sprite.frame = 4;
		sprite.angle += 90;
		// let body fall to the ground before positioning it
		game.time.events.add(750, () => {
			sprite.body.gravity = 0;
			// Remove Physics of body - move it to deadEnemies Group
			deadEnemies.add(enemy);
		});
	}
	// bounce up after kill
	bounceUp(sprite);

	// Create new Enemy:
	enemyCount++;
	isEnemyDead = false;

	enemy = createBaddieForGroup(enemies, 100, 50);
	enemy.animations.play('right')

	// game.time.events.repeat(1500, enemyCount, () => {
	// 	enemy = createBaddieForGroup(enemies, 100, 50);
	// 	enemy.animations.play('right')
	// });
}

function bounceUp() {
	player.body.velocity.x = 0;
	player.body.velocity.y = (-300 -runJumpFactor);
	runJumpFactor = 0;
	// console.log('zeroize RJF in bounceUp')
}

function handleEnemyBoundsCollision() {
	// Check Enemy hit bounds
	if (enemy.position.x === 768) {
		// console.log('enemy collided right')
		enemy.animations.stop();
		enemy.body.velocity.x = enemyVeloLeftX;
		enemy.animations.play('left');
	} else if (enemy.position.x === 0) {
		// console.log('enemy collided left')
		enemy.animations.stop();
		enemy.body.velocity.x = enemyVeloRightX;
		enemy.animations.play('right');
	}
}

function createPlayer() {
	// The Player & settings
	player = game.add.sprite(32, game.world.height - 150, 'dude');

	// Enable Physics on Player
	game.physics.arcade.enable(player);
	// Player Physics Properties. slight bounce
	player.body.bounce.y = 0.2;

	player.body.gravity.y = 300;

	player.body.collideWorldBounds = true;

	// Two animations - walk left/right
	// add(animationName, frames_array, frames_sec, loopBoolean)
	player.animations.add('left', [0, 1, 2, 3], 10, true);
	player.animations.add('right', [5, 6, 7, 8], 10, true);
	player.animations.add('idle', [4], true);
}

function createEnemiesGroup() {
	enemies = game.add.group();
	enemies.enableBody = true;
	enemies.physicsBodyType = Phaser.Physics.ARCADE;

	// Create one enemy for now
	let baddie = createBaddieForGroup(enemies, 100, 50);
	baddie.animations.play('right');
}

function createDeadEnemiesGroup() {
	deadEnemies = game.add.group();
}

function createBaddieForGroup(group, x, y) {
	enemy = group.create(x, y, 'baddie');
	enemy.body.gravity.y = 100;
	enemy.body.collideWorldBounds = true;
	enemy.body.velocity.setTo(100, 50);

	enemy.animations.add('left', [0, 1, 2, 3], 10, true);
	enemy.animations.add('right', [5, 6, 7, 8], 10, true);

	return enemy
}

function createStars() {
	stars = game.add.group();

	stars.enableBody = true;

	// Create 12 Stars:
	for (var i = 0; i < 12; i++) {
		// add star
		var star = stars.create(i * 70, 0, 'star');
		// gravity
		star.body.gravity.y = 100;
		// Random bounce value
		star.body.bounce.y = 0.7 + Math.random() * 0.2;
	}
}

function createLedges() {
	// Create two ledges
	var ledge = platforms.create(400, 400, 'ground')

	ledge.body.immovable = true;

	ledge = platforms.create(-150, 250, 'ground');

	ledge.body.immovable = true;
}

function createGround() {
	// The platforms group
	platforms = game.add.group();
	// Enable Physics for any object in this group
	platforms.enableBody = true;

	// Creating the ground
	var ground = platforms.create(0, game.world.height - 64, 'ground');
	// Scale it to fit with of game:
	ground.scale.setTo(2, 2);
	// Stops ground from falling when jumping on it.
	ground.body.immovable = true;
}