
const config = {
    type: Phaser.AUTO,
    width: 600,
    height: 900,
    backgroundColor: '#3498db', // Set to a light blue color
    scene: {
        preload,
        create,
        update,
    },
    scale: {
        mode: Phaser.Scale.FIT, // Ensures the game fits within the available space
        autoCenter: Phaser.Scale.CENTER_BOTH, // Centers the game on the screen
    }
};

// Variables to manage game state

//input
isMouseDown = false;

let clickText;
let turnText;
let extraText;
let isClicked = false;

let clickedBools = Array(9).fill(false);
let clickableSpaces = [];

playerChoice = 0;

xTurn = true;

gameStatus = 1;

let xMouse = 0.0;
let yMouse = 0.0;

//stuffs
let gamePieces = [];
let bullets = [];

let enemySprites = [];

//Waves
let Wave0 = {
    waveTime: 10.0,

}

//Enemies

//movepattern: go x seconds y way then go z seconds a way etc.
class EnemyMovementPattern {
    constructor(time0, dir0, time1, dir1, time2, dir2)
    {
        this.time = [time0, time1, time2];
        this.dir = [dir0, dir1, dir2];
        //this.time1 = time1;
        //this.dir1 = dir1;
        //this.time2 = time2;
        //this.dir2 = dir2;
    }
}

let enemyMovementPatterns = [];
mp1 = new EnemyMovementPattern(1.0,0.0, 0.5,0.5, 1.0,0.0);
enemyMovementPatterns.push(mp1);

class EnemyTemplate {
    constructor(health, moveSpeed, sightRef, movePattern)
    {
        this.health = health;
        this.moveSpeed = moveSpeed;
        this.sightRef = sightRef;
        this.movePattern = movePattern;
    }
};

redEnemy = new EnemyTemplate(10.0,3,0,0);
blueEnemy = new EnemyTemplate(20.0,5,1,0);
yellowEnemy = new EnemyTemplate(30.0,4,2,0);

class Enemy {
    constructor(x, y, enemyTemplate)
    {
        this.x = x;
        this.y = y;
        this.health = enemyTemplate.health;
        this.moveSpeed = enemyTemplate.moveSpeed;
        this.sightRef = enemyTemplate.sightRef;
        this.movePattern = enemyTemplate.movePattern;
        this.spriteRef;
        this.active = true;
        
        this.currentMove = 0;
        this.moveTimer = 999.0;
    }
    //update(deltaTime): movement and shoot
    //Destroy
};
let enemies = [];
let enemyCoolDownTime = 0.3;
let enemyCoolDownTimer = 2.0;
let enemyMoveSpeed = 3;
let gameTime = 0.0;
let currentWave = 0;

let background;

//config ship
let shipMouseOffset = -30;
let gunCoolDown = 0.1;
let gunCoolDownTimer = 0.0;

let score =0;

const colors = [
    0xec7d45,
    0x887a8b,
    0xa38390,
    0x6c96b4,
    0x622d7b,
    0x77be4a,
    0x4b9384,
    0x287660,
    0x88aa06
];

class Particle{
    constructor(x, y, dirX, dirY, speed, lifeTime) {
        this.x = x;
        this.y = y;
        this.dirX = dirX;
        this.dirY = dirY;
        this.speed = speed;
        this.lifeTime = lifeTime;
        this.totalLifeTime = lifeTime;
        this.size = 0.05;
        this.growth = 1.0;
        this.imageRef = null;        
    }
    Destroy()
    {
        this.imageRef.destroy();
        this.imageRef = null;
    }
}

function GetRandomminusplus()
{
    let randomNumber = Math.random();
    return (randomNumber*2) -1;
}

class ExplosionMgr {
    constructor(scene, poolSize) {
        this.scene = scene;
        this.scene.poolSize = poolSize;        
    }

    thepool =[];

    CreateExplosion(x, y){
        for (let i=0; i<30; i++)
        {            
            let newParticle = new Particle(x,y, GetRandomminusplus(), GetRandomminusplus(), 100*GetRandomminusplus(), (GetRandomminusplus()/2)+0.5);
            newParticle.imageRef = this.scene.add.image(x, y, 'star3')
            
            this.thepool.push(newParticle);
        }
    }

    Update(deltaTime)
    {
        this.thepool.forEach((particle, particleIndex) => {
            particle.lifeTime -= deltaTime;

            let progress = (particle.lifeTime/particle.totalLifeTime); //goes from 1 to 0

            particle.imageRef.x += particle.dirX * particle.speed * deltaTime; //particle itself isn't moving which is fine
            particle.imageRef.y += particle.dirY * particle.speed * deltaTime + 100 * deltaTime;

            particle.size = particle.size + (particle.growth * deltaTime);            
            particle.imageRef.setScale(particle.size);
            
            
            if(progress < 0.5) { particle.imageRef.setAlpha(progress*2); } //after half lifetime start fade

            let progressStep = 100 - (progress *100);
            //console.log('progress: ' + progress);
            let newColor;
            if (progress < 50)
            {
                newColor = Phaser.Display.Color.Interpolate.ColorWithColor(
                        { r: 255, g: 70, b: 10 }, // Rood
                        { r: 250, g: 220, b: 90 },     // Geel
                        50,                          // Steps
                        progressStep                  // Current step
                        );
            } else
            {
                newColor = Phaser.Display.Color.Interpolate.ColorWithColor(
                    { r: 250, g: 220, b: 90 }, // Geel 
                    { r: 0, g: 0, b: 0 },     // Zwart 
                    50,                          // Steps
                    progressStep-50                  // Current step
                    );
            }


            particle.imageRef.setTint(Phaser.Display.Color.GetColor(newColor.r, newColor.g, newColor.b));

            if (particle.lifeTime < 0)
            {
                particle.Destroy();
                this.thepool.splice(particleIndex,1);
            }
        });
    }

}

function preload() {    

    this.load.image('blue', 'assets/blue.png');
    this.load.image('pso', 'assets/pso.png');
    
    this.load.image('lb1', 'assets/lb1.png');
    this.load.image('star3', 'assets/star3.png');    

    // Dynamically load enemy sprites
    const enemyKeys = ['eb1', 'eb2', 'eb3', 'eb4']; // Example keys for enemy sprites
    enemyKeys.forEach(key => {
        this.load.image(key, `assets/${key}.png`);
        enemySprites.push(key); // Dynamically add the key
    });
}

function create() {


    background = this.add.tileSprite(300, 450, 600, 900, 'blue');
    
    newPiece = this.add.image(xMouse, yMouse, 'pso');
    newPiece.setScale(0.4);
    
    gamePieces.push(newPiece);

    this.input.on('pointerdown', (pointer) => {
        isMouseDown = true;
        
    });
    
    this.input.on('pointerup', () => {
        isMouseDown = false;
    });

    explosionManager = new ExplosionMgr(this, 100);

     //mouse coords
    
    this.topText = this.add.text(10, 10, 'X: 0, Y: 0', {
        fontSize: '20px',
        fill: '#ffffff',
    });

    
    this.input.on('pointermove', (pointer) => {
        //topText.setText(`X: ${pointer.x}, Y: ${pointer.y}`);
        xMouse = pointer.x; yMouse = pointer.y;
    }); 
   
}

function update(time, delta) {    

    let deltaTime = delta/1000 ;

    gameTime += deltaTime;

    background.tilePositionY -= 2;

    gamePieces.forEach(piece => {
        // Update the coordinates directly
        piece.x = xMouse;
        piece.y = yMouse + shipMouseOffset;
    });

    bullets.forEach((piece,index) => {
        // Update the coordinates directly
        
        piece.y -=10;
        if (piece.y <5)
        {
            bullets.splice(index, 1);
            piece.destroy();
        }
    });

    //make bullets
    gunCoolDownTimer -= deltaTime;
    if (isMouseDown && gunCoolDownTimer < 0)
        {
            gunCoolDownTimer = gunCoolDown;
            newPiece = this.add.image(xMouse, yMouse-60, 'lb1');
                newPiece.setScale(0.6);
                bullets.push(newPiece);
        }

    //waves of enemies: x many of this type, y many of that type, spread out over z time?
    
    // amount, type

    
    // create enemies
    enemyCoolDownTimer -= deltaTime;
    if (enemyCoolDownTimer < 0)
    {
        enemyCoolDownTimer = enemyCoolDownTime;
        let randomNumber = Math.random();
        let newX = randomNumber*500 + 50;
        //newEnemy = new Enemy(newX,10, 100.0, enemyMoveSpeed, 0);
        //newEnemy = new Enemy(newX,10, RedEnemy.health, enemyMoveSpeed, RedEnemy.spriteRef); //careful
        
        randomNumber = Math.random();
        if (randomNumber < 0.3) { newEnemy = new Enemy(newX,10, redEnemy); }
        else if (randomNumber > 0.3 && randomNumber < 0.6) { newEnemy = new Enemy(newX,10, blueEnemy); }
        else { newEnemy = new Enemy(newX,10, yellowEnemy);}
        
        //console.log("delta" + deltaTime);
        newEnemy.spriteRef = this.add.image(newEnemy.x, newEnemy.y, enemySprites[newEnemy.sightRef]);
        newEnemy.spriteRef.setScale(0.4);

        enemies.push(newEnemy);
        //console.log("enemy made");
    }
    //move enemies
    /*enemies.forEach((piece,index) => {
        // Update the coordinates directly
        
        piece.y += piece.moveSpeed;
        piece.spriteRef.y = piece.y;
        
        //clean up at end
        if (piece.y > 850) {piece.spriteRef.destroy(); enemies.splice(index, 1);}
    });*/
    
    enemies.forEach((piece,index) => {
        //console.log(piece.movePattern);
        
        if (piece.moveTimer > 100) { piece.moveTimer = enemyMovementPatterns[piece.movePattern].time[0];} //set inital timer
        //countdown movement timer
        piece.moveTimer -= deltaTime;
        //change current movement
        if (piece.moveTimer < 0.0 && piece.currentMove <2) { piece.currentMove += 1; piece.moveTimer = enemyMovementPatterns[piece.movePattern].time[piece.currentMove];}
        //execute current movement
        let xMove = enemyMovementPatterns[piece.movePattern].dir[piece.currentMove];
        let yMove = 1- Math.abs(xMove);
        piece.y += piece.moveSpeed * yMove ;
        //console.log(piece.moveSpeed, yMove, deltaTime, piece.y);
        piece.x += piece.moveSpeed * xMove;
        
        piece.spriteRef.x = piece.x;
        piece.spriteRef.y = piece.y;
        //clean up at end
        if (piece.y > 850) {piece.spriteRef.destroy(); enemies.splice(index, 1);}
    });
    
    //collision
    bullets.forEach((bullet, bulletIndex) => {
        enemies.forEach((enemy, enemyIndex) =>{
            let distance = Phaser.Math.Distance.Between(bullet.x, bullet.y, enemy.x, enemy.y);
            //console.log(distance);
            if (distance < 20) //hit
            {
                explosionManager.CreateExplosion(enemy.x, enemy.y);
                enemy.spriteRef.destroy(); enemies.splice(enemyIndex, 1); //double code booo
                bullet.destroy(); bullets.splice(bulletIndex, 1);
                score+=1;
            }
        }) 
    });

    //Updates
    explosionManager.Update(deltaTime);

    this.topText.setText('score: ' + score + ' time: ' + gameTime.toFixed(1) );


    //progress
    if (gameTime > 10)
    {
        enemyCoolDownTime = 0.2;
        enemyMoveSpeed = 4;
    } else if (gameTime > 20)
    {
        enemyCoolDownTime = 0.1;
        enemyMoveSpeed = 6;
    }


    //console.log('this many bullets: ' + bullets.length)
    //console.log('this many enemies: ' + enemies.length)


    // Example: Change background color over time (optional)
    //if (Math.random() > 0.99) {
    //    this.cameras.main.setBackgroundColor(Phaser.Display.Color.RandomRGB());
    //}

}

new Phaser.Game(config);