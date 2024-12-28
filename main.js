


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
let bullets = [];
let enemySprites = [];
let bulletSprites = [];

//Wave //time, enemytype, amount
class Wave {
    constructor(intervalTime, eType0, eType1, eType2, eType3)
    {
        this.intervalTime = intervalTime;
        this.eType = [eType0, eType1, eType2, eType3];

        //this.eAmount = [eAmount0, eAmount1, eAmount2, eAmount3];
        //this.timesBetween = [4];
        //this.eType.forEach((piece,index) => 
        //    { this.timesBetween[index] = time/this.eAmount[index]; });        
    }
    
    //wave ends when? all dead? (or offscreen)
}

let waves = []; //array of waves, first this one than that one

let wave0 = new Wave(0.3,    0,      20,     10,     0);
let wave1 = new Wave(0.25,   10,     30,     20,     0);
let wave2 = new Wave(0.22,   10,     10,     20,     10);

waves.push(wave0);
waves.push(wave1);
waves.push(wave2);

let currentWave = 0;
let newWave = true;

let enemySpawnsToGo = [4];

class BulletTemplate{
    constructor(damage, speed, sightRef)
    {
        this.damage = damage;
        this.speed = speed;
        this.sightRef = sightRef;
    }
}
let bulletTemplates = [];
let templateLaser = new BulletTemplate(     10,  700,    0);
let templateRedBall = new BulletTemplate(   10,  400,    1);

bulletTemplates.push(templateLaser);
bulletTemplates.push(templateRedBall);

//Bullets
class Bullet{
    constructor(scene, posX, posY, dirX, dirY, type)
    {
        this.scene = scene;
        this.posX = posX;
        this.posY = posY;
        this.dirX = dirX;
        this.dirY = dirY;
        this.type = type;
        this.spriteRef;
        this.speed = 700.0; //comes from type in the future

        this.spriteRef = this.scene.add.image(posX, posY + shipMouseOffset - 15, bulletSprites[bulletTemplates[type].sightRef]);
        
        this.spriteRef.setScale(0.6);
    }
    destroy()
    {
        this.spriteRef.destroy();
        this.spriteRef = null;
    }
}

//Enemies
//movepattern: go x seconds y way then go z seconds a way etc.
class EnemyMovementPattern {
    constructor(time0, dir0, time1, dir1, time2, dir2, time3, dir3)
    {
        this.time = [time0, time1, time2, time3];
        this.dir = [dir0, dir1, dir2, dir3];
    }
}

let enemyMovementPatterns = [];
mp0 = new EnemyMovementPattern(1.0, 0.0,     1.0, 0.0,    1.0, 0.0,    1.0, 0.0);
mp1 = new EnemyMovementPattern(1.0, 0.0,     0.5, 0.5,    1.0, 0.0,    1.0, 0.0);
mp2 = new EnemyMovementPattern(1.2, 0.0,     0.7, -0.3,   2.0, 0.0,    0.7, 0.3);
enemyMovementPatterns.push(mp0);
enemyMovementPatterns.push(mp1);
enemyMovementPatterns.push(mp2);

class EnemyTemplate {
    constructor(health, moveSpeed, sightRef, scale, movePattern, shootPattern)
    {
        this.health = health;
        this.moveSpeed = moveSpeed;
        this.sightRef = sightRef;
        this.scale = scale;
        this.movePattern = movePattern;
        this.shootPattern = shootPattern;
        
    }
};

purpleEnemy = new EnemyTemplate(    30.0,   200,    0,  0.5,    1,  1);
redEnemy = new EnemyTemplate(       20.0,   300,    1,  0.4,    1,  0);
greenEnemy = new EnemyTemplate(     30.0,   250,    2,  0.4,    0,  0);
blueEnemy = new EnemyTemplate(      40.0,   150,    3,  0.6,    2,  1);

let enemytemplates = [];
enemytemplates.push(purpleEnemy);
enemytemplates.push(redEnemy);
enemytemplates.push(greenEnemy);
enemytemplates.push(blueEnemy);

class Enemy {
    constructor(scene, x, y, enemyTemplate)
    {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.health = enemyTemplate.health;
        this.moveSpeed = enemyTemplate.moveSpeed;
        this.sightRef = enemyTemplate.sightRef;
        this.scale = enemyTemplate.scale;
        this.movePattern = enemyTemplate.movePattern;
        this.shootPattern = enemyTemplate.shootPattern;
        this.shootCoolDown = 1.0;
        this.shootTimer = 0.0;
        this.spriteRef;
        this.active = true;
        
        this.currentMove = 0;
        this.moveTimer = 999.0;

        this.spriteRef = this.scene.add.image(x, y, enemySprites[this.sightRef]);
        this.spriteRef.setScale(this.scale);
    }
    //update(deltaTime): movement and shoot
    //destroy
};
let enemies = [];
let enemyCoolDownTime = 0.3;
let enemyCoolDownTimer = 2.0;

let gameTime = 0.0;

let background;

//config ship
let currentPosition = glMatrix.vec2.fromValues(300,300);
let targetDir = glMatrix.vec2.create();
let shipMouseOffset = -50;
let gunCoolDown = 0.1;
let gunCoolDownTimer = 0.0;

let playerSpeed = 600.0;

let score =0;

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
    destroy()
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
                particle.destroy();
                this.thepool.splice(particleIndex,1);
            }
        });
    }

}

function preload() {    

    this.load.image('blue', 'assets/blue.png');
    this.load.image('pso', 'assets/pso.png');
    
    const bulletKeys = ['lb1', 'lr1'];
    bulletKeys.forEach(key => {
        this.load.image(key, `assets/${key}.png`);
        bulletSprites.push(key); // Dynamically add the key
    });
    

    this.load.image('star3', 'assets/star3.png');    

    // Dynamically load enemy sprites
    const enemyKeys = ['eb1', 'eb2', 'eb3', 'eb4'];
    enemyKeys.forEach(key => {
        this.load.image(key, `assets/${key}.png`);
        enemySprites.push(key); // Dynamically add the key
    });
}

function create() {


    background = this.add.tileSprite(300, 450, 600, 900, 'blue');
    
    playerImageRef = this.add.image(xMouse, yMouse, 'pso');
    playerImageRef.setScale(0.4);    

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

    //player movement        
    let targetPosition = glMatrix.vec2.fromValues(xMouse, yMouse);
    glMatrix.vec2.subtract(targetDir, targetPosition, currentPosition);

    let distance = glMatrix.vec2.length(targetDir);
    if (distance < playerSpeed * deltaTime) { currentPosition[0] = xMouse; currentPosition[1] = yMouse; }
    else {
        glMatrix.vec2.normalize(targetDir, targetDir);        
        let scaledDir = glMatrix.vec2.create(); // Empty vec2 for result
        glMatrix.vec2.scale(scaledDir, targetDir, playerSpeed * deltaTime);        
        glMatrix.vec2.add(currentPosition, currentPosition, scaledDir); 
    }

    playerImageRef.x = currentPosition[0];
    playerImageRef.y = currentPosition[1] + shipMouseOffset;

    //console.log("playerx ", playerImageRef.x, " y ", playerImageRef.y); 

    //player bullets
    bullets.forEach((piece,index) => {
        // Update the coordinates directly
        
        piece.posY += piece.speed * piece.dirY * deltaTime; //warning
        piece.spriteRef.y = piece.posY;
        
        if (piece.posY <5)
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
        let newBullet = new Bullet(this, currentPosition[0], currentPosition[1] + shipMouseOffset - 15, 0, -1, 0);
        
        bullets.push(newBullet);
    }
    //console.log("bullets active:", bullets.length);
    //waves of enemies: x many of this type, y many of that type, spread out over z time?
    
    // amount, type

    
    // create enemies
    if (newWave)
    {
        newWave = false;
        for(let i =0; i < 4; i++)
        {
            enemySpawnsToGo[i] = waves[currentWave].eType[i];
        }        
    }

    enemyCoolDownTimer -= deltaTime;
    if (enemyCoolDownTimer < 0)
    {
        enemyCoolDownTimer = waves[currentWave].intervalTime;
        let randomNumber = Math.random();
        let newX = randomNumber*500 + 50;        
        
        let indexSelected = -1;

        while (indexSelected ==-1)
        {
            let randomChoice = Math.round(4 * Math.random());
            if (enemySpawnsToGo[randomChoice] != 0)
            { indexSelected = randomChoice; }
        }

        if (enemySpawnsToGo[indexSelected] > 0)
        {
            enemySpawnsToGo[indexSelected] -= 1;
            console.log(enemySpawnsToGo[indexSelected]);
            newEnemy = new Enemy(this, newX,10, enemytemplates[indexSelected]);

            enemies.push(newEnemy);
        }
    }

    //advance wave
    if (enemySpawnsToGo[0]+enemySpawnsToGo[1]+enemySpawnsToGo[2]+enemySpawnsToGo[3] ==0)
    {
        currentWave += 1;
        if (currentWave > waves.length -1) { currentWave = 0;}
        console.log( "next wave");
        newWave = true;
    }
    
    //update enemies
    enemies.forEach((piece,index) => {
        //console.log(piece.movePattern);
        
        if (piece.moveTimer > 100) { piece.moveTimer = enemyMovementPatterns[piece.movePattern].time[0];} //set inital timer
        //countdown movement timer
        piece.moveTimer -= deltaTime;
        //change current movement
        if (piece.moveTimer < 0.0 && piece.currentMove <3) { piece.currentMove += 1; piece.moveTimer = enemyMovementPatterns[piece.movePattern].time[piece.currentMove];}
        //execute current movement
        let xMove = enemyMovementPatterns[piece.movePattern].dir[piece.currentMove];
        let yMove = 1- Math.abs(xMove);
        piece.y += piece.moveSpeed * deltaTime * yMove ;
        //console.log(piece.moveSpeed, yMove, deltaTime, piece.y);
        piece.x += piece.moveSpeed * deltaTime * xMove;
        
        piece.spriteRef.x = piece.x;
        piece.spriteRef.y = piece.y;
        //clean up at end
        if (piece.y > 850) {piece.spriteRef.destroy(); enemies.splice(index, 1);}

        //shoot (for now if shootpattern=1:shoot)
        if (piece.shootPattern == 1)
        {            
            piece.shootTimer -= deltaTime;
            if (piece.shootTimer < 0)
            {
                //console.log("shoot enemy");
                piece.shootTimer = piece.shootCoolDown;
                let newBullet = new Bullet(this, piece.x, piece.y + 20, 0, 1, 0);
                
                bullets.push(newBullet);
            }
        }

    });
    
    //collision    
    bullets.forEach((bullet, bulletIndex) => {
        enemies.forEach((enemy, enemyIndex) =>{
            let distance = Phaser.Math.Distance.Between(bullet.posX, bullet.posY, enemy.x, enemy.y);
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

    this.topText.setText('score: ' + score + ' time: ' + gameTime.toFixed(1) + ' wave: ' + currentWave + ' fps: ' + (1/deltaTime).toFixed(1));

    

    //console.log('this many bullets: ' + bullets.length)
    //console.log('this many enemies: ' + enemies.length)


    // Example: Change background color over time (optional)
    //if (Math.random() > 0.99) {
    //    this.cameras.main.setBackgroundColor(Phaser.Display.Color.RandomRGB());
    //}

}

new Phaser.Game(config);