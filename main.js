var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });


function preload() {
	game.load.image('sky', 'assets/sky.png');
	game.load.image('ground', 'assets/platform.png');
	game.load.image('star', 'assets/star.png');
	game.load.spritesheet('dude', 'assets/dude.png', 32, 48);
	game.load.spritesheet('baddie', 'assets/dude.png', 32, 48);
}

var platforms, stars, cursors, player, enemy, scoreText, score = 0;
var direction;

function create() {


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
	player.animations.add('left', [0, 1, 2, 3], 10, true);
	player.animations.add('right', [5, 6, 7, 8], 10, true);

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
	for( var i = 0; i < 12; i++) {
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
}

function update() {
	// Collide player & platforms / & stars, enemy & platforms, stars & platforms
	game.physics.arcade.collide(player, platforms, function() {
		// console.log("player collided with platforms")
	});
	game.physics.arcade.collide(stars, platforms);
	game.physics.arcade.collide(enemy, platforms, function() {
		// console.log(arguments.length)
	});



	// Reset player's velocity
	player.body.velocity.x = 0;

	if(cursors.left.isDown) {
		player.body.velocity.x = -150;
		player.animations.play('left');
	} else if (cursors.right.isDown) {
		player.body.velocity.x = 150;
		player.animations.play('right');
	} else {
		player.animations.stop();
		player.frame = 4;
	}

	// Allow player to jump if touching ground
	if (cursors.up.isDown && player.body.touching.down) {
		player.body.velocity.y = -350;
	}

	// Check Player take star:
	game.physics.arcade.overlap(player, stars, collectStar, null, this);


	// Check Enemy hit bounds
	var enemyVeloX = 100;
	var enemyBounceVeloY = 100;
	var enemyBounceVeloX = 30;
	// console.log('enemy position x', enemy.position.x);
	if (enemy.position.x === 768) {
		// console.log('enemy collided left')
		wallBounce(enemyBounceVeloX, enemyBounceVeloY, enemyVeloX, direction, 250);
	} else if (enemy.position.x === 0) {
		// console.log('enemy collided right')
		enemyVeloX = -enemyVeloX;
		enemyBounceVeloX = -enemyBounceVeloX;
		wallBounce(enemyBounceVeloX, enemyBounceVeloY, enemyVeloX, direction, 250);
	}
}

function wallBounce(bounceVeloX, bounceVeloY, veloX, direction, duration) {
	// console.log('bouncevelox', bounceVeloX, 'bounceveloy', bounceVeloY, 'direction', direction)
	enemy.body.velocity.y = -(bounceVeloY);
	enemy.body.velocity.x = -(bounceVeloX);
	enemy.animations.stop();
	enemy.frame = 4;
	setTimeout(() => {
		enemy.body.velocity.y = bounceVeloY;
		enemy.body.velocity.x = -(veloX);
		if (direction === 'left') {
			enemy.animations.play('left');
		} else {
			enemy.animations.play('right');
		}
	}, duration)
}

function collectStar(player, star) {
	// Remove star from screen for now:
	star.kill();
	// Add & update score
	score += 10;
	scoreText.text = "Score:" + score;
}