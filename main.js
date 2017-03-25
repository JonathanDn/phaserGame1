
// TODO - bug with bouncing
// TODO change events of end of screens X to --> collide between objects - study it. to get only 1 time event when enemy collides with it instead of more.


var platforms, stars, cursors, player, scoreText, score = 0, direction;

var enemy, enemyVeloRightX = 100, enemyVeloLeftX = -100;

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

		// The platforms group
		platforms = game.add.group();
		// Enable Physics for any object in this group
		platforms.enableBody = true;

		// Creating the gruond
		var ground = platforms.create(0, game.world.height - 64, 'ground');
		// Scale it to fit with of game:
		ground.scale.setTo(2, 2);
		// Stops ground from falling when jumping on it.
		ground.body.immovable = true;

		// Create two ledges
		var ledge = platforms.create(400, 400, 'ground')

		ledge.body.immovable = true;

		ledge = platforms.create(-150, 250, 'ground');

		ledge.body.immovable = true;

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

		enemy = game.add.sprite(50, 100, 'baddie');

		game.physics.arcade.enable(enemy);

		enemy.body.gravity.y = 100;

		enemy.animations.play('walk', 10, true);

		enemy.body.collideWorldBounds = true;

		enemy.body.velocity.y = 300;

		enemy.animations.add('left', [0, 1, 2, 3], 10, true);

		enemy.animations.add('right', [5, 6, 7, 8], 10, true);

		enemy.body.velocity.x = 100;

		direction = 'right';
		enemy.animations.play(direction);

		// Starshine
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

		// Set up score:
		scoreText = game.add.text(16, 16, 'score: 0', {fontSize: '32px', fill: '#000'});

		// Game Controls
		cursors = game.input.keyboard.createCursorKeys();
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
		activateControls(player);

		// Check Player take star:
		game.physics.arcade.overlap(player, stars, collectStar, null, this);


		// Check Player hit Enemy
		game.physics.arcade.overlap(player, enemy, collisionHandler, null, this);

		// Check Enemy hit bounds
		// console.log('enemy position x', enemy.position.x);
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
};

// Add state:
game.state.add('GameState', GameState);
// Launch game:
game.state.start('GameState');

function activateControls(sprite) {
	sprite.body.velocity.x = 0;
	if (cursors.left.isDown) {
		sprite.body.velocity.x = -150;
		sprite.animations.play('left');
	} else if (cursors.right.isDown) {
		sprite.body.velocity.x = 150;
		sprite.animations.play('right');
	} else {
		player.animations.stop();
		sprite.frame = 4;
	}
	// Allow player to jump if touching ground
	if (cursors.up.isDown && player.body.touching.down) {
		bounceUp(player);
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
	// console.log('player collided with enemy');
	// console.log('player x and y', player.position.x, player.position.y);
	// console.log('enemy x and y', enemy.position.x, enemy.position.y);
	// console.log(player.body.height)

	// Top Collision of Enemy:
	let playerY = Math.floor(player.body.position.y);
	let enemyY = Math.floor(enemy.body.position.y);
	// console.log(enemyY, '=', playerY - playerHeight);
	// To indicate player hitting enemy from above --> check if playerY is lower then enemyY
	if (playerY < enemyY && (enemyY - playerY > 40)) {
		enemy.body.velocity.x = 0;
		enemy.animations.stop();
		enemy.frame = 4;
		enemy.angle += 90;
		enemy.position.y += ((enemy.height / 2) + 5);
		enemy.enableBody = false;
		enemy.body.immovable = false;
		bounceUp(player);
		// setTimeout(() => {
		// 	// enemy.kill();
		// },1000)
		// enemy.kill();
		// console.log('py', playerY, 'eY', enemyY)
		// console.log('player collide from the top')
	}

	// Side Collision of Enemy:
	let playerX = Math.floor(player.body.position.x);
	let enemyX = Math.floor(enemy.body.position.x);
	// console.log('e/p gap', playerX - enemyX);
	if ((enemyX - playerX) === 30) {
		console.log('Enemy collided with player from right')
	} else if ((enemyX - playerX) === -30) {
		console.log('Enemy collided with player from left')
	}
}

function bounceUp(sprite) {
	sprite.body.velocity.x = 0;
	sprite.body.velocity.y = -350;
}