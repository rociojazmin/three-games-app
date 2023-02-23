const ICONS = [
    'fas fa-star',
    'fas fa-star-and-crescent',
    'fab fa-old-republic',
    'fab fa-galactic-republic',
    'fas fa-sun',
    'fas fa-stroopwafel',
    'fas fa-dice',
    'fas fa-chess-knight',
    'fas fa-chess',
    'fas fa-dice-d20',
    'fas fa-star-of-life',
];

const CARD_STATE_COVERED = 0;
const CARD_STATE_SELECTED = 1;
const CARD_STATE_UNCOVERED = 2;

let game = {
    players: -1,
    profiles: null,
    currentPlayer: undefined,
    scores: [],

    board: [],
}

function winnerSound() {
    const audioElement = new Audio("../../audio/claps-winner.mp3");
    audioElement.play();
}

function popUp() {
    document.getElementById("cartel-sonido").classList.remove("nodisp");
}

function resetGameState() {
    game = {
        players: -1,
        profiles: null,
        currentPlayer: undefined,
        scores: [],

        board: [],
    }
}

function loadProfiles() {
    const app = Storage.get("app");
    game.players = app.players;
    game.profiles = app.profiles;
}


function init(cardsNumber) {
    resetGameState();
    document.getElementById("cartel-ganador").classList.add("nodisp");
    // Players
    loadProfiles();
    game.currentPlayer = -1;
    changePlayer();
    for (let i = 0; i < game.players; i++) {
        game.scores.push(0);
    }

    // Board
    const iconsNumber = cardsNumber / 2;
    const iconsToUse = ICONS.slice(0, iconsNumber); //selecciono la cantidad necesaria de iconos
    iconsToUse.push(...iconsToUse);
    iconsToUse.sort(() => Math.random() - 0.5); //mezclamos

    for (let i = 0; i < iconsToUse.length; i++) {
        game.board.push({
            icon: iconsToUse[i],
            state: CARD_STATE_COVERED
        });
    }
}


function draw() {
    let cardsDom = [];
    for (let i = 0; i < game.board.length; i++) {
        let card = game.board[i];
        cardsDom.push(`
        <div class="area-tarjeta" onclick="onCardClick(${i})">
            <div class="tarjeta" id="tarjeta${i}">
                <div class="cara trasera" id="trasera${i}">
                    <i class="${card.icon}"></i>
                </div>
                <div class="cara superior">
                    <i class="fa-solid fa-question"></i>
                </div>
            </div>
        </div>        
        `);
    }

    document.getElementById("tablero").innerHTML = cardsDom.join(" "); //convertimos el array en string
}


function onCardClick(i) {
    console.log(`onCardClick ${i}`);
    let card = game.board[i];
    if (card.state === CARD_STATE_COVERED) {
        selectCard(i);
    }
}

function selectCard(i) {
    let cardDom = document.getElementById("tarjeta" + i);
    cardDom.style.transform = "rotateY(180deg)";
    game.board[i].state = CARD_STATE_SELECTED;

    let selected = cardsIdsByState(CARD_STATE_SELECTED);
    if (selected.length == 2) {
        let card0 = game.board[selected[0]];
        let card1 = game.board[selected[1]];
        if (card0.icon == card1.icon) {
            game.board[selected[0]].state = CARD_STATE_UNCOVERED;
            game.board[selected[1]].state = CARD_STATE_UNCOVERED;

            let trasera0 = document.getElementById("trasera" + selected[0]);
            let trasera1 = document.getElementById("trasera" + selected[1]);

            trasera0.style.background = game.profiles[game.currentPlayer].color;
            trasera1.style.background = game.profiles[game.currentPlayer].color;

            game.scores[game.currentPlayer]++;
            checkEndGame();
        } else {
            deselectAll();
            changePlayer();
        }
    }

    console.log(game.board);
}

function deselectAll() {
    for (let i = 0; i < game.board.length; i++) {
        const card = game.board[i];
        if (card.state === CARD_STATE_SELECTED) {
            deselect(i);
        }
    }
}

function deselect(i) {
    setTimeout(() => {
        let tarjeta1 = document.getElementById("tarjeta" + i)
        tarjeta1.style.transform = "rotateY(0deg)";
        game.board[i].state = CARD_STATE_COVERED;
    }, 500);
}

function cardsIdsByState(state) {
    let ret = [];
    for (let i = 0; i < game.board.length; i++) {
        const card = game.board[i];
        if (card.state === state) {
            ret.push(i);
        }
    }
    return ret;
}

function changePlayer() {
    game.currentPlayer++;
    if (game.currentPlayer === game.players) {
        game.currentPlayer = 0;
    }
    document.getElementById("turno").innerHTML = game.profiles[game.currentPlayer].nick;
}

function checkEndGame() {
    let covered = cardsIdsByState(CARD_STATE_COVERED);
    if (covered == 0) {
        // El juego se termino
        if (sound) {
            winnerSound();
        }

        let { winner, score } = whoWon();

        document.getElementById("ganador").innerHTML = "¡Ganó " + game.profiles[winner].nick + " con " + score + " puntos!";
        document.getElementById("cartel-ganador").classList.remove("nodisp");

        console.log(`Gano ${winner} con ${score} puntos!!!!!1111`);
        totalGameScore(winner);
    }
}


function whoWon() {
    let who = -1;
    let score = -1;
    for (let player = 0; player < game.players; player++) {
        if (game.scores[player] > score) {
            score = game.scores[player];
            who = player;
        }
    }
    return { winner: who, score: score };

}

function totalGameScore(winnerid) {
    let app = Storage.get("app");
    app.profiles[winnerid].scores.memotest += 20;
    app.profiles[winnerid].scores.total += 20;
    Storage.put("app", app);
}

