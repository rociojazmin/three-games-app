//const NUMBER_OF_PLAYERS = 2;
const DICE_SIZE = 70;
const DOT_RADIUS = 0.1 * DICE_SIZE;
const AT_QUARTER = 0.25 * DICE_SIZE;
const AT_HALF = 0.5 * DICE_SIZE;
const AT_3QUARTER = 0.75 * DICE_SIZE;

const GAME_NAMES = ["1", "2", "3", "4", "5", "6", "Escalera", "Full", "Póker", "Generala", "Doble generala", "TOTAL"];

let game = {
    players: 2, // Cantidad de jugadores 
    playedRounds: 0,
    turn: 1, // Jugador actual
    scores: [], //Puntaje de los jugadores
    moves: 0, // Cantidad de tiros que le queda al jugador actual
    dices: [0, 0, 0, 0, 0], // Estado de los 5 dados (cubilete + mesa) 
    selection: [false, false, false, false, false],
    profiles: null,
};

function initGame() {
    document.getElementById("cartel").classList.add("nodisp");
    game.turn = 1;
    // inicializar tablero de puntos - con el 0 vamos a reemplazar que se lo tacho
    for (let player = 0; player < game.players; player++) {
        game.scores[player] = [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 0];
        // game.scores[player] = [-1, 2, 13, 39, 34, 43, 93, 40, 30, 43, 23, 42]; puntaje de mentirita
        // game.playedRounds = 10; puntaje de mentirita
    }

    loadProfiles();

    initDicesPlay();
    showScores();
}

function loadProfiles() {
    const app = Storage.get("app");
    game.players = app.players; // en este caso son iguales pero la idea es pensar en si hay mas jugadores
    game.profiles = app.profiles;
}

function whoWon() {
    let who = -1;
    let score = -1;
    for (let player = 0; player < game.players; player++) {
        if (game.scores[player][11] > score) {
            score = game.scores[player][11];
            who = player;
        }
    }
    return { winner: who, score: score };
}

function computeNumberScore(theNumber) {
    let theScore = 0;
    for (let i = 0; i < game.dices.length; i++) {
        if (game.dices[i] === theNumber) {
            theScore += theNumber;

        }

    }
    return theScore;
}

function doScore(whichGame) {
    switch (whichGame) {
        case 6:
            if (esEscalera()) {
                let theScore = game.moves === 1 ? 25 : 20;
                game.scores[game.turn - 1][6] = theScore;
                game.scores[game.turn - 1][11] += theScore;
                doPlayerSwitchAndEndGameIfINeeded()
            } else {
                tachar(6);
            }
            break;
        case 7:
            if (esFull()) {
                let theScore = game.moves === 1 ? 35 : 30; // le asigna a theScore los puntos, si hizo full en el primer movimiento tiene 35 y si hizo en el movimiento 2 o 3 tiene 30
                game.scores[game.turn - 1][7] = theScore; // primero busca el jugador actual y después suma los puntos  en la casilla 7 de la tabla(la de full)
                game.scores[game.turn - 1][11] += theScore; // primero busca el jugador actual y después suma los puntos  en la casilla 11 de la tabla(la de total)
                doPlayerSwitchAndEndGameIfINeeded();
            } else {
                tachar(7); //Verifica si es 0 y lo tacha
            }
            break;
        case 8:
            if (esPoker()) {
                let theScore = game.moves === 1 ? 45 : 40;
                game.scores[game.turn - 1][8] = theScore;
                game.scores[game.turn - 1][11] += theScore;
                doPlayerSwitchAndEndGameIfINeeded();
            } else {
                tachar(8);
            }
            break;
        case 9:
            console.log(esGenerala());
            if (esGenerala()) {
                let theScore = game.moves === 1 ? 55 : 50;
                game.scores[game.turn - 1][9] = theScore;
                game.scores[game.turn - 1][11] += theScore;
                doPlayerSwitchAndEndGameIfINeeded();
            } else {
                if (game.scores[game.turn - 1][10] === 0) {
                    tachar(9);
                } else {
                    document.getElementById("anotate").innerHTML = "¡Primero debe tacharse la doble!";
                    document.getElementById("anotarse").classList.remove("nodisp");
                    // alert("Primero debe tacharse la doble!");
                }
            }
            break;
        case 10:
            if (esGenerala()) {
                if (hasScore(9)) {
                    let theScore = game.moves === 1 ? 105 : 100;
                    game.scores[game.turn - 1][10] = theScore;
                    game.scores[game.turn - 1][11] += theScore;
                    doPlayerSwitchAndEndGameIfINeeded();
                } else {
                    document.getElementById("anotate").innerHTML = "¡Primero debe anotarse la generala!";
                    document.getElementById("anotarse").classList.remove("nodisp");
                    // alert("Primero debe anotarse la generala!");
                }
            } else {
                tachar(10);
            }
            break;
        default:
            let theScore = computeNumberScore(whichGame + 1);
            if (theScore > 0) {
                game.scores[game.turn - 1][whichGame] = theScore;
                game.scores[game.turn - 1][11] += theScore;
                doPlayerSwitchAndEndGameIfINeeded();
            } else {
                tachar(whichGame);
            }
    }

}

function tachar(whichGame) {
    if (isThereGame()) {
        showConfirm(function () {
            game.scores[game.turn - 1][whichGame] = 0;
            doPlayerSwitchAndEndGameIfINeeded();
            console.log("Te dio true");
        });
    } else {
        game.scores[game.turn - 1][whichGame] = 0;
        doPlayerSwitchAndEndGameIfINeeded();
    }
}

function showConfirm(onConfirm) {
    document.getElementById("mensaje-confirm-juego").innerHTML = "¿Estas seguro que deseas tachar?";
    document.getElementById("cartel-confirm-juego").classList.remove("nodisp");
    document.getElementById("que-si").onclick = function () {
        onConfirm();
        document.getElementById("cartel-confirm-juego").classList.add("nodisp");
    };
    document.getElementById("que-no").onclick = function () {
        document.getElementById("cartel-confirm-juego").classList.add("nodisp");
    };
}

function hasScore(whichGame) {
    return game.scores[game.turn - 1][whichGame] >= 0;
}

function isThereGame() {
    if (esEscalera() && !hasScore(6)) return true;
    if (esFull() && !hasScore(7)) return true;
    if (esPoker() && !hasScore(8)) return true;
    if (esGenerala() && (!hasScore(9) || !hasScore(10))) return true;
    for (let whichGame = 0; whichGame < 6; whichGame++) {
        if (computeNumberScore(whichGame + 1) > 0 && !hasScore(whichGame)) {
            return true;
        }
    }
    return false;
}

function winnerSound() {
    const audioElement = new Audio("../../audio/claps-winner.mp3");
    audioElement.play();
}

function popUp() {
    console.log("me estoy ejecutando");
    document.getElementById("cartel-sonido").classList.remove("nodisp");
}

function doPlayerSwitchAndEndGameIfINeeded() {
    showScores();
    changePlayer();
    if (game.playedRounds === 11) {
        setTimeout(() => {
            const winner = whoWon();
            if (sound) {
                winnerSound();
            }
            document.getElementById("mensaje").innerHTML = "¡Ganó " + game.profiles[winner.winner].nick + " con " + winner.score + " puntos!";
            document.getElementById("cartel").classList.remove("nodisp");
            totalGameScore(winner.winner);
        }, 1000);
    } else {
        game.dices = [0, 0, 0, 0, 0];
        showDices();
    }
}

function totalGameScore(winnerid) {
    let app = Storage.get("app");
    app.profiles[winnerid].scores.generala += 20;
    app.profiles[winnerid].scores.total += 20;
    Storage.put("app", app);
}

function showScores() {
    let app = Storage.get("app");
    Storage.put("app", app);
    //dibujar el encabezado (thead)
    const thead = document.querySelector("#scores thead");
    thead.innerHTML = null;
    const tr = document.createElement("tr");
    const thGames = document.createElement("th");
    thGames.appendChild(document.createTextNode("Jugadas"));
    tr.appendChild(thGames);
    for (let player = 0; player < game.players; player++) {

        const thPlayer = document.createElement("th");
        thPlayer.appendChild(document.createTextNode(game.profiles[player].nick)); //busca los nick de cada perfil y los pone de encabezado
        if (game.turn == player + 1) {
            // thPlayer.classList.add("currentPlayer");
            thPlayer.style.backgroundColor = app.profiles[player].color;
            thPlayer.style.color = "#000000"
        }
        thead.appendChild(thPlayer);
        tr.appendChild(thPlayer);
    }
    thead.appendChild(tr);
    //Dibujar el cuerpo (tbody) (dibujo las 12 filas)
    const tbody = document.querySelector("#scores tbody");
    tbody.innerHTML = null;
    for (let row = 0; row < 12; row++) {
        const tr = document.createElement("tr");
        const tdGame = document.createElement("th");
        tdGame.appendChild(document.createTextNode(GAME_NAMES[row]));
        tr.appendChild(tdGame);
        for (let player = 0; player < game.players; player++) {
            const tdPlayer = document.createElement("td");
            const gamesScore = game.scores[player][row];
            tdPlayer.appendChild(document.createTextNode(gamesScore < 0 ? " " : gamesScore === 0 && row != 11 ? "X" : gamesScore));
            /*tdPlayer.appendChild(document.createTextNode(game.scores[player][row])); */
            tr.appendChild(tdPlayer);
        }
        if (row < 11) {
            tr.onclick = () => {
                console.log(game.dices);
                // game.scores[game.turn - 1][row] !== -1
                if (hasScore(row)) {
                    console.log(game);
                    document.getElementById("anotado").innerHTML = "¡Ya anotó este juego, elija otro!";
                    document.getElementById("ya-anoto").classList.remove("nodisp");
                    // alert("Ya anotó este juego, elija otro!");
                } else if (!rolledDices()) {
                    document.getElementById("tira").innerHTML = "¡Primero tenes que tirar los dados!";
                    document.getElementById("tirar-dados").classList.remove("nodisp");
                    // alert("Primero tenes que tirar los dados!");
                } else {
                    doScore(row);
                }
            };
        }
        tbody.appendChild(tr);
    }
}


function rolledDices() {
    for (let i = 0; i < game.dices.length; i++) {
        if (game.dices[i] == 0)
            return false;
    }
    return true;
}


function initDicesPlay() {
    game.moves = 0;
    game.dices = [0, 0, 0, 0, 0];
    game.selection = [false, false, false, false, false];
    // habilitar boton para tirar
    document.getElementById("btn-roll").removeAttribute("disabled");

    showScores();
}

//para tirar numeros al azar del dado entre 1 y 6 
function rollDice(i) {
    return Math.floor(Math.random() * 6) + 1;
    // return 5;  generala de mentira
    // if (i < 4) return 4; // poker de mentira
    // else return 1; // poker de mentira
}

function rollDices() {
    if (game.moves === 0) {
        game.moves++;
        for (let i = 0; i < game.dices.length; i++) {
            game.dices[i] = rollDice(i);
        }
    } else if (game.moves < 3) {
        game.moves++;
        // solo los no seleccionados
        for (let i = 0; i < game.dices.length; i++) {
            if (!game.selection[i]) {
                game.dices[i] = rollDice(i);
            }
        }
        game.selection = [false, false, false, false, false];
    }

    game.dices.sort((a, b) => a - b);
    console.info("Rolled dices. moves: %d, dices: %o", game.moves, game.dices);
    showDices();
    updateBtn();
    score();
}


// console.log("Moves left: " + game.moves);
// //ordeno de menor a mayor para que sea mas facil la deteccion de jugadas
// game.dices.sort((a, b) => a - b); // el call back de sort es una funcion que devuelva un numero mayor a cero si el primero es mayor
// showDices();
// }

const reEscalera = /12345|23456|13456/;
const reGenerala = /1{5}|2{5}|3{5}|4{5}|5{5}|6{5}/;
const rePoker = /1{4}(2|3|4|5|6)|12{4}|2{4}(3|4|5|6)|(1|2)3{4}|3{4}(4|5|6)|(1|2|3)4{4}|4{4}(5|6)|(1|2|3|4)5{4}|5{4}6|(1|2|3|4|5)6{4}/;
const reFull = /1{3}(2|3|4|5|6){2}|1{2}(2|3|4|5|6){3}|2{3}(3|4|5|6){2}|2{2}(3|4|5|6){3}|3{3}(4|5|6){2}|3{2}(4|5|6){3}|4{3}(5|6){2}|4{2}(5|6){3}|5{3}6{2}|5{2}6{3}/;

function updateBtn() {
    const btn = document.getElementById("btn-roll");
    btn.innerHTML = `¡TIRÁ LOS DADOS! (${3 - game.moves})`;
    if (game.moves === 3) {
        btn.setAttribute("disabled", "disables");
        btn.classList.add("disabled-btn");
    } else {
        btn.removeAttribute("disabled", "disables");
        btn.classList.remove("disabled-btn");
    }
}

function esEscalera() {
    return game.dices.join('').match(reEscalera) !== null;
}

function esFull() {
    return game.dices.join('').match(reFull) !== null;
}

function esPoker() {
    return game.dices.join('').match(rePoker) !== null;
}

function esGenerala() {
    return game.dices.join('').match(reGenerala) !== null;
}

function score() {
    console.log("dices: %o", game.dices);
    console.warn("anotar uno de los juegos!!!");
}

function changePlayer() {
    game.turn++;
    if (game.turn > game.players) {
        game.turn = 1;
        game.playedRounds++;
    }
    initDicesPlay();
    updateBtn();
}

//vamos a dibujar 1 puntito en el canvas (contexto,centro del circulo, centro del ciruculo)
function drawDot(ctx, x, y) {
    ctx.beginPath(); // empiezo a dibujar, apoyta el lapiz
    ctx.arc(x, y, DOT_RADIUS, 0, 2 * Math.PI, false); // dibujo un arco como si fuera un compas (x,y) = medio, le paso un radio , 2 PI = 360 grados para que me dibuje el circulo, false es para el sentido de orientacion del dibujo
    ctx.fillStyle = "#000000"; // el color que lo voy a llenar
    ctx.fill(); // con fill le digo que me llene para que se convierta en circulo
    ctx.closePath(); // levanta el lapiz 

}

function drawDice(cont, number) {
    let ctx = cont.getContext("2d"); // es el mismo que uso en la otra funcion , como hago un dado plano le pido un contexto de 2 dimensiones

    // Borro - dejo transparente el contexto
    ctx.clearRect(0, 0, DICE_SIZE, DICE_SIZE);

    // Creo el Dado 
    ctx.beginPath(); // apoyo el lapiz
    ctx.rect(0, 0, DICE_SIZE, DICE_SIZE); // funcion rectangulo me crea el borde, y como le doy los dos mismos parametros se hace cuadrado se unen las vertices
    ctx.fillStyle = "#ffffff"; // el color que lo voy a llenar
    ctx.fill(); // con fill le digo que me llene para que se convierta en cuadrado
    ctx.closePath(); // levanta el lapiz 

    // le pongo numeros dependiendo que dado es
    switch (number) {
        case 1:
            drawDot(ctx, AT_HALF, AT_HALF);
            break;
        case 2:
            drawDot(ctx, AT_3QUARTER, AT_QUARTER);
            drawDot(ctx, AT_QUARTER, AT_3QUARTER);
            break;
        case 3:
            drawDot(ctx, AT_HALF, AT_HALF);
            drawDot(ctx, AT_3QUARTER, AT_QUARTER);
            drawDot(ctx, AT_QUARTER, AT_3QUARTER);
            break;
        case 4:
            drawDot(ctx, AT_3QUARTER, AT_QUARTER);
            drawDot(ctx, AT_QUARTER, AT_3QUARTER);
            drawDot(ctx, AT_QUARTER, AT_QUARTER);
            drawDot(ctx, AT_3QUARTER, AT_3QUARTER);
            break;
        case 5:
            drawDot(ctx, AT_HALF, AT_HALF);
            drawDot(ctx, AT_3QUARTER, AT_QUARTER);
            drawDot(ctx, AT_QUARTER, AT_3QUARTER);
            drawDot(ctx, AT_QUARTER, AT_QUARTER);
            drawDot(ctx, AT_3QUARTER, AT_3QUARTER);
            break;
        case 6:
            drawDot(ctx, AT_3QUARTER, AT_QUARTER);
            drawDot(ctx, AT_QUARTER, AT_3QUARTER);
            drawDot(ctx, AT_QUARTER, AT_QUARTER);
            drawDot(ctx, AT_3QUARTER, AT_3QUARTER);
            drawDot(ctx, AT_QUARTER, AT_HALF);
            drawDot(ctx, AT_3QUARTER, AT_HALF);
            break;
    }
}

function showDice(whichDice, number) {
    let canvas = document.createElement("canvas");
    // dice.classList.add("dado");
    canvas.setAttribute("width", "" + DICE_SIZE);
    canvas.setAttribute("height", "" + DICE_SIZE);
    // dice.style.borderRadius = (DICE_SIZE / 100) + "em";  
    // dice.style.margin = (DICE_SIZE / 200) + "em";  
    drawDice(canvas, number);
    canvas.onclick = function () {
        console.log("click", whichDice);
        if (game.moves === 3 || game.moves === 0) {
            return;
        }
        game.selection[whichDice] = !game.selection[whichDice];
        if (game.selection[whichDice]) {
            canvas.classList.add("sel");
        } else {
            canvas.classList.remove("sel");
        }
    };
    return canvas;
}

function showDices() {
    let cont = document.getElementById("dices");
    cont.innerHTML = null;
    for (let i = 0; i < game.dices.length; i++) {
        cont.appendChild(showDice(i, game.dices[i]));
    }
}

function closeCerrar() {
    document.getElementById("ya-anoto").classList.add("nodisp");
}

function closeOkay() {
    document.getElementById("tirar-dados").classList.add("nodisp");
}

function closeEntendido() {
    document.getElementById("anotarse").classList.add("nodisp");
}

function closeDoble() {
    document.getElementById("primero-doble").classList.add("nodisp");
}

