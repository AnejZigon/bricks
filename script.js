var x = 400; 
var y = 500;
var dx = 3.2;  
var dy = -3.2;
var r = 12; // Večja žogica za boljši učinek
var ctx;
var WIDTH;
var HEIGHT;
var paddlex;
var paddleh = 12;
var paddlew = 110;
var intervalId;
var rightDown = false;
var leftDown = false;

// Slike
var ballImg;
var zombieImg;

// Nastavitve opek (Zombijev)
var bricks;
var NROWS = 4;      
var NCOLS = 8;      
var BRICKWIDTH;
var BRICKHEIGHT = 65; // Dovolj visoko, da se zombi vidi cel
var PADDING = 4;     

var tocke = 0;
var sekunde = 0;
var start = false;

function init() {
    var canvas = $('#canvas')[0];
    ctx = canvas.getContext("2d");
    WIDTH = canvas.width;
    HEIGHT = canvas.height;
    
    BRICKWIDTH = (WIDTH / NCOLS) - PADDING;
    paddlex = WIDTH / 2 - paddlew / 2;
    
    ballImg = document.getElementById("zogica"); 
    zombieImg = document.getElementById("zombie"); 
	gameBgImg = document.getElementById("igralnobg");

    init_bricks();
    
    $(document).keydown(onKeyDown);
    $(document).keyup(onKeyUp);
    
    //setInterval(updateTimer, 1000);
    //intervalId = setInterval(draw, 10);
	drawStatic();
}

function drawStatic() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    if (gameBgImg) ctx.drawImage(gameBgImg, 0, 0, WIDTH, HEIGHT);
    if (ballImg) ctx.drawImage(ballImg, x - r, y - r, r * 2, r * 2);
    ctx.fillStyle = "#ff4500";
    ctx.beginPath();
    ctx.roundRect(paddlex, HEIGHT - paddleh - 5, paddlew, paddleh, 6);
    ctx.fill();
    // Nariši še zombije
    for (var i = 0; i < NROWS; i++) {
        for (var j = 0; j < NCOLS; j++) {
            if (bricks[i][j] == 1) {
                ctx.drawImage(zombieImg, (j * (BRICKWIDTH + PADDING)) + PADDING/2, (i * (BRICKHEIGHT + PADDING)) + PADDING/2, BRICKWIDTH, BRICKHEIGHT);
            }
        }
    }
}

function init_bricks() {
    bricks = new Array(NROWS);
    for (var i = 0; i < NROWS; i++) {
        bricks[i] = new Array(NCOLS);
        for (var j = 0; j < NCOLS; j++) {
            bricks[i][j] = 1;
        }
    }
}

function onKeyDown(evt) {
    if (evt.keyCode == 39) rightDown = true;
    else if (evt.keyCode == 37) leftDown = true;
}

function onKeyUp(evt) {
    if (evt.keyCode == 39) rightDown = false;
    else if (evt.keyCode == 37) leftDown = false;
}

function updateTimer() {
    if (start) {
        sekunde++;
        var sekundeI = ((sekunde % 60) > 9) ? (sekunde % 60) : "0" + (sekunde % 60);
        var minuteI = (Math.floor(sekunde / 60) > 9) ? Math.floor(sekunde / 60) : "0" + Math.floor(sekunde / 60);
        $("#cas").html(minuteI + ":" + sekundeI);
    }
}

function draw() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    
	//igralno okno bg
	if (gameBgImg) {
        ctx.drawImage(gameBgImg, 0, 0, WIDTH, HEIGHT);
    }
	
    // Žogica (Slika)
    if (ballImg) {
        ctx.drawImage(ballImg, x - r, y - r, r * 2, r * 2);
    }

    // Ploščica
    if (rightDown && (paddlex + paddlew) < WIDTH) paddlex += 9;
    else if (leftDown && paddlex > 0) paddlex -= 9;
    ctx.fillStyle = "#ff4500";
    ctx.beginPath();
    ctx.roundRect(paddlex, HEIGHT - paddleh-5, paddlew, paddleh, 6);
    ctx.fill();

    // Zombiji (Opeke)
    for (var i = 0; i < NROWS; i++) {
        for (var j = 0; j < NCOLS; j++) {
            if (bricks[i][j] == 1) {
                ctx.drawImage(
                    zombieImg, 
                    (j * (BRICKWIDTH + PADDING)) + PADDING/2, 
                    (i * (BRICKHEIGHT + PADDING)) + PADDING/2, 
                    BRICKWIDTH, 
                    BRICKHEIGHT
                );
            }
        }
    }
	

    // Detekcija trkov
    var rowheight = BRICKHEIGHT + PADDING;
    var colwidth = BRICKWIDTH + PADDING;
    var row = Math.floor(y / rowheight);
    var col = Math.floor(x / colwidth);

    if (y < NROWS * rowheight && row >= 0 && col >= 0 && bricks[row][col] == 1) {
        dy = -dy;
        bricks[row][col] = 0;
        tocke++;
        $("#tocke").html(tocke);
        
        if(tocke === NROWS * NCOLS) {
            prikaziKonec(true);
        }
    }

    // Odboji od sten
    if (x + dx > WIDTH - r || x + dx < r) dx = -dx;
    if (y + dy < r) dy = -dy;
    else if (y + dy > HEIGHT - r) {
        if (x > paddlex && x < paddlex + paddlew) {
            start = true;
            // Dinamičen odboj glede na mesto zadetka na ploščici
            dx = 10 * ((x - (paddlex + paddlew / 2)) / paddlew);
            dy = -dy;
        } else {
            prikaziKonec(false);
        }
    }

    x += dx;
    y += dy;
}

$(document).ready(function() {
    init();
});

$(document).ready(function() {
    var modal = document.getElementById("navodila-modal");
    var btn = document.getElementById("navodila-btn");
    var span = document.getElementsByClassName("zapri")[0];

    // Odpri navodila
    btn.onclick = function() {
        modal.style.display = "block";
    }

    // Zapri na X
    span.onclick = function() {
        modal.style.display = "none";
    }

    // Zapri s klikom izven okna
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
	$("#start-btn").click(function() {
        if (!intervalId) { // Prepreči večkratni zagon
            intervalId = setInterval(draw, 10);
            setInterval(updateTimer, 1000);
            $(this).addClass("skrit"); // Skrij gumb, ko se igra začne
        }
    });
});

function prikaziKonec(zmaga) {
    // Ustavi igro
    clearInterval(intervalId);
    start = false;

    // Pridobi podatke
    var cas = $("#cas").text();
    var modal = $("#konec-modal");

    // Nastavi besedilo glede na rezultat
    if (zmaga) {
        $("#konec-naslov").text("ČESTITAMO!").css("color", "#27ae60");
        $("#konec-sporocilo").text("Uničili ste vse zombije in rešili svet!");
    } else {
        $("#konec-naslov").text("PORAZ!").css("color", "#ff4500");
        $("#konec-sporocilo").text("Nisi uspel rešiti sveta pred zombiji.");
    }

    // Izpiši statistiko
    $("#koncne-tocke").text(tocke);
    $("#koncni-cas").text(cas);

    // Prikaži modal
    modal.css("display", "block");
}

// Logika za gumb "Igraj ponovno"
$(document).ready(function() {
    $("#restart-btn").click(function() {
        location.reload(); // Ponovno naloži igro
    });
    
    // ... tvoja ostala koda za start-btn in navodila ...
});