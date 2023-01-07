function initProfiles() {
    loadProfiles();
}

function loadProfiles() {

    const app = Storage.get("app");
    const profiles = app.profiles;

    var id = new URLSearchParams(window.location.search).get("id"); //lo que va después del "?" (la lista de parametros de get)

    if (id == null) { //si no hay id no hay perfiles(nadie pidió editarlo por eso no hay)
        // Modo agregar perfil
        if (profiles.length === app.players) { // Si es la cantidad de app.player(en este caso  es 2) 

            window.location = "index.html"; // te redirije al home
        } else {
            document.getElementById("btn-save").onclick = () => { //configura el btn-save para que guarde como un nuevo id
                saveProfile(profiles.length);
            }
        }
    } else {
        // Modo editar perfil
        const profile = profiles[id]; //el current profile, lo agarramos cn el id
        editProfile(profile, id);
    }
}

function editProfile(profile, id) { //cargamos los datos existentes y los remplazamos
    document.getElementById("name").value = profile.name;
    document.getElementById("nick").value = profile.nick;
    document.getElementById("color").value = profile.color;
    document.getElementById("photo").src = "data:image/jpeg;base64," + profile.photo;
    document.getElementById("photo-preview").src = "data:image/jpeg;base64," + profile.photo;

    document.getElementById("btn-save").onclick = () => {
        saveProfile(id, true);
    }
}

function saveProfile(pos, editMode = false) {
    const app = Storage.get("app");
    if (valido(app, pos)) {
        const profile = editMode ? app.profiles[pos] : {};
        profile.name = document.getElementById("name").value;
        profile.nick = document.getElementById("nick").value;
        profile.color = document.getElementById("color").value;
        profile.photo = document.getElementById("photo").src.replace("data:image/jpeg;base64,", "");
        if (!editMode) {
            profile.scores = {
                tateti: 0,
                generala: 0,
                memotest: 0,
                total: 0
            };
        }
        app.profiles[pos] = profile;
        Storage.put("app", app);
        window.location = "perfiles.html";
    }

}

function valido(app, who) {

    let nombre = document.getElementById("name").value;

    //Si el nombre está vacío
    if (nombre === "") {

        document.getElementById("mensaje").innerHTML = "El nombre está vacio.<br>Escriba un nombre";
        document.getElementById("cartel").classList.remove("nodisp");

        // alert("El nombre esta vacio");
        return false;
    }

    let nick = document.getElementById("nick").value;
    if (nick === "") {

        document.getElementById("mensaje-apodo-vacio").innerHTML = "El apodo está vacio.<br>Escriba un apodo";
        document.getElementById("cartel-apodo-vacio").classList.remove("nodisp");

        // alert("El apodo esta vacio");
        return false;
    }

    if (nick.length > 8) {

        document.getElementById("mensaje-apodo-largo").innerHTML = "El apodo es muy largo.<br>Elija uno más corto";
        document.getElementById("cartel-apodo-largo").classList.remove("nodisp");


        // alert("El nick es muy largo");
        return false;
    }
    let color = document.getElementById("color").value;

    for (let i = 0; i < app.profiles.length; i++) {
        const colorOtro = app.profiles[i].color;

        if (color == colorOtro && who != i) {

            document.getElementById("mensaje-color-repetido").innerHTML = "Ese color ya fue seleccionado. <br> Seleccione otro";
            document.getElementById("cartel-color-repetido").classList.remove("nodisp");

            // alert("Ese color ya fue seleccionado!");
            return false;
        }
    }


    // NOTAS
    // si el color que elijo ya fue seleccionado me tiene que volver al que yo ya tenía.
    // que me deshabilite el boton cuando ya no tengo tiros
    // cambiar color azul
    // alert q no sean alert
    // q t pregunte si queres tAchar un juego aunq ya tengas otro


    return true;
}

function takePicture() {
    navigator.camera.getPicture(imageData => {
        var imagen = "data:image/jpeg;base64," + imageData;
        document.getElementById("photo").src = imagen;
        document.getElementById("photo-preview").src = imagen;
    }, error => {
        console.error("No se puede tomar la foto", error);
    },
        {
            destinationType: device.platform === "browser" ? Camera.DestinationType.FILE_URI : Camera.DestinationType.DATA_URL
        });
}

function totalScore() {

    const thead = document.querySelector("#ranking thead");
    thead.innerHTML = null;
    const tr = document.createElement("tr")


    const thPlayer = document.createElement("th");
    thPlayer.appendChild(document.createTextNode("Jugador"));
    thPlayer.classList.add("headtable");
    tr.appendChild(thPlayer);

    const thPlayer2 = document.createElement("th");
    thPlayer2.appendChild(document.createTextNode("Ta-Te-Ti"));
    thPlayer2.classList.add("headtable");
    tr.appendChild(thPlayer2);

    const thPlayer3 = document.createElement("th");
    thPlayer3.appendChild(document.createTextNode("Generala"));
    thPlayer3.classList.add("headtable");
    tr.appendChild(thPlayer3);

    const thPlayer4 = document.createElement("th");
    thPlayer4.appendChild(document.createTextNode("Memo-Test"));
    thPlayer4.classList.add("headtable");
    tr.appendChild(thPlayer4);

    thead.appendChild(tr);


    //dibu cuerpo (tbody)
    const tbody = document.querySelector("#ranking tbody");
    tbody.innerHTML = null;

    const app = Storage.get("app");


    for (let i = 0; i < app.profiles.length; i++) {
        const tr = document.createElement("tr");
        let tdGame = document.createElement("td");
        tdGame.appendChild(document.createTextNode(app.profiles[i].nick));
        tdGame.classList.add("celdatable");
        tr.appendChild(tdGame);

        tdGame = document.createElement("td");
        tdGame.appendChild(document.createTextNode(app.profiles[i].scores.tateti));
        tdGame.classList.add("celdatable");
        tr.appendChild(tdGame);

        tdGame = document.createElement("td");
        tdGame.appendChild(document.createTextNode(app.profiles[i].scores.generala));
        tdGame.classList.add("celdatable");
        tr.appendChild(tdGame);

        tdGame = document.createElement("td");
        // tdGame.appendChild(document.createTextNode(app.profiles[i].scores.generala + app.profiles[i].scores.tateti));
        tdGame.appendChild(document.createTextNode(app.profiles[i].scores.memotest));
        tdGame.classList.add("celdatable");
        tr.appendChild(tdGame);

        tr.style.color = app.profiles[i].color;
        tbody.appendChild(tr);
    }

}

function totales() {

    const app = Storage.get("app");
    const profiles = app.profiles;

    let total = profiles[0].scores.generala + profiles[0].scores.tateti + profiles[0].scores.juego;
    let total2 = profiles[1].scores.generala + profiles[1].scores.tateti + profiles[1].scores.juego;

    document.getElementById("totales1").innerHTML = "Total de " + profiles[0].nick + ": " + profiles[0].scores.total;
    document.getElementById("totales2").innerHTML = "Total de " + profiles[1].nick + ": " + profiles[1].scores.total;

}

function closeVacio() {
    document.getElementById("cartel").classList.add("nodisp");
}

function closeApodoVacio() {
    document.getElementById("cartel-apodo-vacio").classList.add("nodisp");
}

function closeApodoLargo() {
    document.getElementById("cartel-apodo-largo").classList.add("nodisp");
}

function closeColorRepetido() {
    document.getElementById("cartel-color-repetido").classList.add("nodisp");
}



