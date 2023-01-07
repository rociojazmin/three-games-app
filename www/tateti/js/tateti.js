//encapsulamos todo en 1 objeto juego
let game;

function initGame() {
    game = {
        board: [
            ["", "", ""],
            ["", "", ""],
            ["", "", ""]
        ],
        jugadas: 0,
        turno: tirarMoneda(),
        puedeSeguir: true,
        profiles: null
    };
    loadProfiles();
    draw();

}

function loadProfiles() {
    const app = Storage.get("app");
    game.profiles = {
        "O": app.profiles[0],
        "X": app.profiles[1],
    }
}

// tablero:
//   0  |  1 | 2
// 0 ["", "", ""],
// 1 ["", "", ""],
// 2 ["", "", ""]


/* ESTA FUNCION CREA LA TABLA DESDE CERO, LA VACIA Y LA LLENA
function draw() {
    // traigo la tabla
    const table = document.querySelector("table");
    // cada vez que la creo la vacio
    table.innerHTML = null;

    // este for recorre cada una de las filas 
    for(let r = 0; r < board.length ; r++) {
        //genero un tr para cada fila
        const tr = document.createElement("tr");
        for(let c=0; c < board[r].length; c++) {
            const td = document.createElement("td");
            td.appendChild(document.createTextNode(board[r][c]));
            tr.appendChild(td);
        }
        table.appendChild(tr);
    }
    
}*/
function draw() {
    const app = Storage.get("app")
    //Ocultar o mostrar el cartel
    if (game.puedeSeguir) {
        document.getElementById("cartel").classList.add("nodisp");
    }
    //Turno
    console.log(game.turno);
    console.log(game.profiles);
    console.log(game.profiles[game.turno]);
    document.getElementById("turno").innerHTML = game.profiles[game.turno].nick;


    //Tablero
    for (let r = 0; r < game.board.length; r++) {

        for (let c = 0; c < game.board[r].length; c++) {
            // Acá adentro escribo lo que hago por cada columna

            // En este punto, r es la fila actual y c la columna actual

            // Traeme de la r+1 fila y la c+1 columna la celda donde tengo que escribir
            const cell = document.querySelector("table tr:nth-of-type(" + (r + 1) + ") td:nth-of-type(" + (c + 1) + ") ");

            // Borro el contenido que ya estaba escrito
            cell.innerHTML = null;

            // Escribo lo que haya en esa celda
            const textNode = document.createTextNode(game.board[r][c]);

            // Le cambio el color al textNode segun lo que tiene.
            const aux = (game.board[r][c] === "X") ? 0 : 1;
            const whichColor = app.profiles[aux].color;

            cell.style.color = whichColor;
            cell.appendChild(textNode);
        }
    }
};



function play(r, c) {
    if (game.puedeSeguir && game.board[r][c] === "") {
        game.jugadas++;
        game.board[r][c] = game.turno;
        if (wonDiagonal(game.turno) || wonHorizontal(game.turno) || wonVertical(game.turno)) {
            won();
        } else if (game.jugadas === 9) {
            deuce();
        } else {
            game.turno = game.turno === "X" ? "O" : "X";
            draw();
        }
    }
};



function wonDiagonal() {
    return (game.board[0][0] === game.turno && game.board[1][1] === game.turno && game.board[2][2] === game.turno) ||
        (game.board[0][2] === game.turno && game.board[1][1] === game.turno && game.board[2][0] === game.turno);
}

function wonVertical() {
    return (game.board[0][0] === game.turno && game.board[1][0] === game.turno && game.board[2][0] === game.turno) ||
        (game.board[0][1] === game.turno && game.board[1][1] === game.turno && game.board[2][1] === game.turno) ||
        (game.board[0][2] === game.turno && game.board[1][2] === game.turno && game.board[2][2] === game.turno)
}

function wonHorizontal() {
    return (game.board[0][0] === game.turno && game.board[0][1] === game.turno && game.board[0][2] === game.turno) ||
        (game.board[1][0] === game.turno && game.board[1][1] === game.turno && game.board[1][2] === game.turno) ||
        (game.board[2][0] === game.turno && game.board[2][1] === game.turno && game.board[2][2] === game.turno)
}


function tirarMoneda() {
    return (Math.random() > 0.5) ? "X" : "O";
}

function winnerSound() {
    const audioElement = new Audio("../../audio/claps-winner.mp3");
    audioElement.play();
}

function popUp() {
    document.getElementById("cartel-sonido").classList.remove("nodisp");
}

function won() {
    game.puedeSeguir = false;
    draw();

    if (sound) {
        winnerSound();
    }

    document.getElementById("mensaje").innerHTML = "¡" + game.profiles[game.turno].nick + " gana!";
    document.getElementById("cartel").classList.remove("nodisp");

    // let winnerid;
    // if (game.turno == "X") {
    //     winnerid = 0;
    // } else {
    //     winnerid = 1;
    // }
    let winnerid = game.turno == "X" ? 1 : 0; // si winnerid es X va a ser 0(player 1) sino 1(player 2)
    totalGameScore(winnerid); //también podría ser: totalGameScore(game.turno == "X" ? 0 : 1;);
}

function totalGameScore(winnerid) {
    let app = Storage.get("app");
    app.profiles[winnerid].scores.tateti += 10;
    app.profiles[winnerid].scores.total += 10;
    Storage.put("app", app);
}

function deuce() {
    game.puedeSeguir = false;
    draw();
    document.getElementById("mensaje").innerHTML = "¡Empate!";
    document.getElementById("cartel").classList.remove("nodisp");
}