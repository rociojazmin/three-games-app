const Storage = {
    put: (key, obj) => {
        var ret = JSON.stringify(obj)
        localStorage.setItem(key, ret);
        return ret;
    },
    get: key => {
        const value = localStorage.getItem(key);
        return value !== null ? JSON.parse(value) : null;
    },
    del: key => {
        localStorage.removeItem(key);
    },
    kill: () => {
        localStorage.clear()
    }
}

function backMenu() {
    window.location.href = "../home.html";
}

function backToMenu() {
    window.location.href = "../../home.html";
}

function facil() {
    window.location.href = "../html/index-facil.html";
}

function medio() {
    window.location.href = "../html/index-medio.html";
}

function dificil() {
    window.location.href = "../index.html";
}

let sound = true;

function turnOnSound() {
    sound = true;
    document.getElementById("cartel-sonido").classList.add("nodisp");
}

function turnOffSound() {
    sound = false;
    document.getElementById("cartel-sonido").classList.add("nodisp");
}