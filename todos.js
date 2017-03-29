// *** Current ***
// TODO - everytime an enemy is killed = create ++ enemies - this way increasing the difficulty :)

// *** Backlog ***

// ** Logic **
// TODO - add Debug logic text
// TODO - handle enemy collision with player horizontally --> knockback player for now visually.
// TODO - handle game over - finish collecting stars.
// TODO - enable double jump mid-air?
// TODO - make enemy body moveable and move it if you collide with it left / right. make it move and bounce on x axis. - bodies jumping all over.
// TODO - handle hurting the player when enemey comes by right / left
// TODO - enlarge map to also support revealing of new sections and more monsters / challanges / jumping over holes etc. (within this level for now)

// ** Design / Art **
// TODO - show effect that shows the jump has runJumpFactor --> some visual effect.
// TODO - chane player sprite to something I will make.
// TODO - change background to something I will make.
// TODO - change platforms to something I will make.

// *** DONE ***
// DONE - spawn ++ enemy when enemy is killed and let the body stay.
// DONE - all this enter to function - handleEnemyKill();
// DONE - refactor all create code packs to functions:
// 		createGround();
// 		createLedges();
// 		createPlayer();
// 		createEnemy();
// 		createStars();
// DONE - improve the jump - Add more force to jump(higher fix velocity) when the jump is after a few pixels moved in the x axis position of body.
// DONE - packed up enemyBoundsCollision in a function
// DONE - help enemy get down when clicking down.
// DONE - player bounce up when killing the enemy, re-useable func
// DONE - put all controls in activateControls(sprite) function