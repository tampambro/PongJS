`use strict`;

const canvas = document.getElementById(`game`);
const context = canvas.getContext(`2d`);
const grid = 15;
const paddleHeight = grid * 5;
const maxPaddleY = canvas.height - grid - paddleHeight;
const plrScore1 = document.getElementById(`scoreN1`);
const plrScore2 = document.getElementById(`scoreN2`);
const gameOverWindow = document.getElementById(`gameOver`);
const startNameplate = document.getElementById(`start`);
const wraperForScore = document.querySelector(`.wraper`);

let paddleSpeed = 6;
let ballSpeed = 5;
let requestID;

//Sounds
const leftTouchdownSound = new Audio(`sounds/touchdownForLeftField.mp3`);
const rightTouchdownSound = new Audio(`sounds/touchdownForRightField.mp3`);
const leftRebound = new Audio(`sounds/leftPaddle.mp3`);
const rightRebound = new Audio(`sounds/rightPaddle.mp3`);
const ballStart = new Audio(`sounds/ballStart.mp3`);
const victoryTrek = new Audio(`sounds/victoryTrek.mp3`);
const bottomReboundSound = new Audio(`sounds/bottomRebound.mp3`);
const topReboundSound = new Audio(`sounds/topRebound.mp3`);

const leftPaddle = {
    x: grid * 2,
    y: (canvas.height / 2) - (paddleHeight / 2),
    width: grid,
    height: paddleHeight,
    dy: 0,
};

const rightPaddle = {
    x: canvas.width - (grid * 3), //Нужно умножать именно на 3, т.к. платформа отрисовываетсья с лева на право.
    y: (canvas.height / 2) - (paddleHeight / 2),
    width: grid,
    height: paddleHeight,
    dy: 0,
};

const ball = {
    x: canvas.width / 2,
    y: canvas.width / 2,
    width: grid,
    height: grid,
    resetting: false,
    dx: ballSpeed,
    dy: -ballSpeed,
};

function collides(obj1, obj2) {
    //https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection

    return (obj1.x < obj2.x + obj2.width &&
        obj1.x + obj1.width > obj2.x &&
        obj1.y < obj2.y + obj2.height &&
        obj1.y + obj1.height > obj2.y);
};

function startGame() {
    startNameplate.style.display = `none`;
    wraperForScore.style.display = `block`;
    ballStart.play();
    requestAnimationFrame(loop);
};

function gameOver() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = 0;
    ball.dy = 0;

    gameOverWindow.style.display = `flex`;
    victoryTrek.play();
    cancelAnimationFrame(requetsId);
};

function loop() {
    requestID = requestAnimationFrame(loop);
    context.clearRect(0, 0, canvas.width, canvas.height);

    //Keep moving.
    leftPaddle.y += leftPaddle.dy;
    rightPaddle.y += rightPaddle.dy;

    //Checking top.
    if (leftPaddle.y < grid) {
        leftPaddle.y = grid;
    } else if (leftPaddle.y > maxPaddleY) {
        leftPaddle.y = maxPaddleY;
    }

    //Checking bottom.
    if (rightPaddle.y < grid) {
        rightPaddle.y = grid;
    } else if (rightPaddle.y > maxPaddleY) {
        rightPaddle.y = maxPaddleY;
    }

    //Drawing paddles.
    context.fillStyle = `rgb(10.8%, 51.3%, 89.8%)`;
    context.fillRect(leftPaddle.x, leftPaddle.y, leftPaddle.width, leftPaddle.height);
    context.fillStyle = `rgb(95.2%, 30.1%, 34.9%)`
    context.fillRect(rightPaddle.x, rightPaddle.y, rightPaddle.width, rightPaddle.height);

    //Moving of ball.
    ball.x += ball.dx;
    ball.y += ball.dy;


    if (ball.y < grid) {
        ball.y = grid;
        ball.dy *= -1;
        topReboundSound.play();
    } else if ( (ball.y + grid) > (canvas.height - grid) ) {
        ball.y = canvas.height - (grid * 2);
        ball.dy *= -1;
        bottomReboundSound.play();
    }

    //Checking touchdown.
    if ( (ball.x < 0 || ball.x > canvas.width) && (!ball.resetting) ) {
        ball.resetting = true;

        if (ball.x < 0) {
            leftTouchdownSound.play();

            ball.x = ball.x - grid;

            ball.dx = 0;
            ball.dy = 0;

            plrScore2.innerHTML = +plrScore2.innerHTML + 1;

            if (plrScore2.innerHTML == 9) {
                gameOver();
            }
        } else if (ball.x > canvas.width) {
            rightTouchdownSound.play();

            ball.dx = 0;
            ball.dy = 0;

            plrScore1.innerHTML = +plrScore1.innerHTML + 1;

            if (plrScore1.innerHTML == 9) {
                gameOver();
            }
        }

        setTimeout( () => {
            ball.resetting = false;
            ballSpeed = ballSpeed + 0.2;

            if (ball.x < 0) {
                let yDirection = (Math.floor(Math.random() * 2) === 0) ? -1 : 1;

                ball.dx = ballSpeed;
                ball.dy = ballSpeed * yDirection;
            } else if (ball.x > canvas.width) {
                let yDirection = (Math.floor(Math.random() * 2) === 0) ? -1 : 1;

                ball.dx = -ballSpeed;
                ball.dy = ballSpeed * yDirection;
            }

            ball.x = canvas.width / 2;
            ball.y = canvas.height / 2;

            ballStart.play();
        }, 1000 );
    }

    //Checking left&right Rebound.
    if ( collides(ball, leftPaddle) ) {
        leftRebound.play();
        ball.dx *= -1;
        ball.x = leftPaddle.x + leftPaddle.width;
    } else if ( collides(ball, rightPaddle) ) {
        rightRebound.play();
        ball.dx *= -1;
        ball.x = rightPaddle.x - ball.width;
    }

    //Drawing ball, boders and grid at middle.
    context.fillStyle = `yellow`;
    context.fillRect(ball.x, ball.y, ball.width, ball.height);

    context.fillStyle = `lightgrey`;
    context.fillRect(0, 0, canvas.width, grid);
    context.fillRect(0, (canvas.height - grid), canvas.width, grid);

    for (let i = grid; i < (canvas.height - grid); i += grid * 2) {
        context.fillRect( (canvas.width / 2) - (grid / 2), i, grid, grid );
    }

};

document.addEventListener( `keydown`, function(event) {
    if (event.which === 13) {
        startGame();
    }
} );

document.addEventListener( `keydown`, function(event) {
    if (event.which === 38) {
        rightPaddle.dy = -paddleSpeed;
    } else if (event.which === 40) {
        rightPaddle.dy = paddleSpeed;
    }

    if (event.which === 87) {
        leftPaddle.dy = -paddleSpeed;
    } else if (event.which === 83) {
        leftPaddle.dy = paddleSpeed;
    }
} );

document.addEventListener( `keyup`, function(event) {
    if (event.which === 38 || event.which === 40) {
        rightPaddle.dy = 0;
    }

    if (event.which === 87 || event.which === 83) {
        leftPaddle.dy = 0;
    }
} );