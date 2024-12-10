
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

class Enemy {
    constructor(x, y, health, ref)
    {
        this.x = x;
        this.y = y;
        this.health = health;
        this.sightRef = ref;
        this.spriteRef;
        this.active = true;    
    }
    
};
let enemies = [];
let enemyCoolDownTime = 0.3;
let enemyCoolDownTimer = 2.0;

let background;

//config ship
let shipMouseOffset = -30;
let gunCoolDown = 0.1;
let gunCoolDownTimer = 0.0;

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
    constructor(x, y, dirX, dirY, speed) {
        this.x = x;
        this.y = y;
        this.dirX = dirX;
        this.dirY = dirY;
        this.speed = speed;
        this.lifeTime = 1.0;
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
        for (let i=0; i<10; i++)
        {            
            let newParticle = new Particle(x,y, GetRandomminusplus(), GetRandomminusplus(), 200*GetRandomminusplus());
            newParticle.imageRef = this.scene.add.image(x, y, 'star3')
            
            this.thepool.push(newParticle);
        }
    }

    Update(deltaTime)
    {
        this.thepool.forEach((particle, particleIndex) => {
            particle.lifeTime -= deltaTime;
            particle.imageRef.x += particle.dirX * particle.speed * deltaTime; //particle itself isn't moving which is fine
            particle.imageRef.y += particle.dirY * particle.speed * deltaTime;
            particle.size = particle.size + (particle.growth * deltaTime);
            particle.imageRef.setScale(particle.size)
            console.log('size: ' + particle.size);
            if (particle.lifeTime < 0)
            {
                particle.Destroy();
                this.thepool.splice(particleIndex,1);
            }
        });
    }

}

function packBooleans(bools) {
    if (bools.length > 18) {
        throw new Error("Too many booleans; only 18 can be packed.");
    }

    let packed = 0;
    for (let i = 0; i < bools.length; i++) {
        if (bools[i]) {
            packed |= (1 << i); // Set the bit at position i
        }
    }
    return packed >>> 0; // Ensure the result is treated as unsigned
}



function preload() {    

    this.load.image('blue', 'assets/blue.png');
    this.load.image('pso', 'assets/pso.png');
    this.load.image('eb1', 'assets/eb1.png');
    this.load.image('lb1', 'assets/lb1.png');
    this.load.image('star3', 'assets/star3.png');

   
}

function create() {

    
    //mouse coords
    
    let coordText = this.add.text(10, 10, 'X: 0, Y: 0', {
        fontSize: '20px',
        fill: '#ffffff',
    });

    
    this.input.on('pointermove', (pointer) => {
        coordText.setText(`X: ${pointer.x}, Y: ${pointer.y}`);
        xMouse = pointer.x; yMouse = pointer.y;
    }); 
   
    
    this.add.image(300, 300, 'grid');

    

    const rows = 3;
    const cols = 3;
    const zoneWidth = 200;
    const zoneHeight = 200;
    const startX = 100;
    const startY = 100;
    const spacing = 200;

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            let x = startX + col * spacing;
            let y = startY + row * spacing;

            let zone = this.add.zone(x, y, zoneWidth, zoneHeight)
                .setInteractive()
                .on('pointerdown', () => {
                    
                    //console.log(`Zone at row ${row + 1}, col ${col + 1} clicked!`);
                    isClicked = true;
                    playerChoice = row*3+col;
                    //clickText.setText('Zone ' + playerChoice + ' Clicked!');
                });               
                
            clickableSpaces.push(zone);        
            
        }
    }

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

    // Add text to indicate instructions or feedback
    

    //extraText = this.add.text(300, 350, 'extext', {
    //    fontSize: '20px',
    //    fill: '#ffffff',
    //});
}

function update(time, delta) {    

    let deltaTime = delta/1000 ;

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
            newPiece = this.add.image(xMouse, yMouse-40, 'lb1');
                newPiece.setScale(0.6);
                bullets.push(newPiece);
        }

    // create enemies
    enemyCoolDownTimer -= deltaTime;
    if (enemyCoolDownTimer < 0)
    {
        enemyCoolDownTimer = enemyCoolDownTime;
        let randomNumber = Math.random();
        let newX = randomNumber*500 + 50;
        newEnemy = new Enemy(newX,10, 100.0, 0);
        
        //console.log("delta" + deltaTime);
        newEnemy.spriteRef = this.add.image(newEnemy.x, newEnemy.y, 'eb1');
        newEnemy.spriteRef.setScale(0.4);

        enemies.push(newEnemy);
        console.log("enemy made");
    }
    //move enemies
    enemies.forEach((piece,index) => {
        // Update the coordinates directly
        
        piece.y += 3;
        piece.spriteRef.y +=3;
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
                
            }
        }) 
    });

    //Updates
    explosionManager.Update(deltaTime);

    //console.log('this many bullets: ' + bullets.length)
    //console.log('this many enemies: ' + enemies.length)


    // Example: Change background color over time (optional)
    //if (Math.random() > 0.99) {
    //    this.cameras.main.setBackgroundColor(Phaser.Display.Color.RandomRGB());
    //}

}

new Phaser.Game(config);
