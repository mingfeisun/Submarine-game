var cButton = document.getElementById("button");
var cField = document.getElementById("field");
var nRounds = document.getElementById("rounds");
var nScoreUser = document.getElementById("score_user");
var nScoreComputer = document.getElementById("score_computer");
var nRemainingFuel = document.getElementById("remaining_fuel");

var CurrentKillerPos = [];
var CurrentUserPos = [];
var CurrentFuel = 0;
var CurrentUserScore = 0;
var CurrentComputerScore = 0;
var CurrentRound = 0;

var SelectedLeft = 0;
var SelectedTop = 0;

var OBSTACLE = 1e3;

var HINT_SETUP = "type 1 - 9 to place a fuel cell," +
                 "o to place an obstacle, " +
                 "u to place your submarine, " +
                 "k to place a robotic killer, " +
                 "ESC to cancel.";

var ALERT_OCCUPIED = "This place has already been set!";
var ALERT_ALREADY_SET = "Your submarine has already been set!";
var ALERT_PLACE_KEYS = "Only 1-9, o, u, k, ESC are allowed";
var ALERT_CONTROL_KEYS = "a-->left, w-->up, d-->right, x-->down";

var GridMap = new Array(10);
for (var i = 0; i < 10; i++){
    GridMap[i] = new Array(10);
    GridMap[i].fill(0);
}

window.document.onload = init();

function init() {
    cButton.innerHTML = "START";
    nRounds.innerHTML = "0";
    nScoreUser.innerHTML = "0";
    nScoreComputer.innerHTML = "0";
    nRemainingFuel.innerHTML = "0";
    cButton.addEventListener("click", buttonClick);
}

function buttonClick() {
    if (CurrentKillerPos.length == 0 || CurrentUserPos.length == 0) {
        document.getElementById("start_hint").innerHTML = "Setup first here by clicking!";
        cField.setAttribute("class", "cursorPointer");
        cField.addEventListener("click", fieldClickClear);
    } else {

        playInit();
        CurrentRound = 1;
        CurrentFuel = 10;
        CurrentUserScore = 0;
        CurrentComputerScore = 0;
        updateStatus();

        return;
    }
}

function playInit() {
    // update button
    cButton.innerHTML = "STOP";

    // remove all listeners
    cField.removeAttribute("class");
    cField.removeEventListener("click", fieldClickClear);
    cField.removeEventListener("click", fieldClick());
    cField.removeEventListener("mousemove", fieldMouseOver);
    window.removeEventListener("keydown", placeObject);

    // remove bordered divs
    removeBorderDiv();

    // reset SelectedLeft & SelectedTop
    SelectedLeft = CurrentUserPos[0]*64;
    SelectedTop = CurrentUserPos[1]*64;

    // show message
    document.getElementById("start_hint").innerHTML = "Game Starts Now!";
    setTimeout(function () {
        document.getElementById("start_hint").innerHTML = "";
    }, 1500);

    // add listeners for keydown
    window.addEventListener("keydown", controlSubmarine);
}

function controlSubmarine(event) {
    switch (event.key){
        case "a":
            updatePosition(-1, 0);
            break;
        case "w":
            updatePosition(0, -1);
            break;
        case "d":
            updatePosition(1, 0);
            break;
        case "x":
            updatePosition(0, 1);
            break;
        default:
            createHintDiv(ALERT_CONTROL_KEYS);
            setTimeout(function () {
                createHintDiv("");
            }, 1500);
            break;
    }
}

function updatePosition(xVal, yVal) {
    var hasMoved = false;
}

function updateStatus() {
    nScoreUser.innerHTML = CurrentUserScore;
    nScoreComputer.innerHTML = CurrentComputerScore;
    nRounds.innerHTML = CurrentRound;
    nRemainingFuel.innerHTML = CurrentFuel
}

function fieldClickClear() {
    document.getElementById("start_hint").innerHTML = ""; // clear all texts
    cField.removeEventListener("click", fieldClickClear);
    cField.addEventListener("click", fieldClick);
    cField.addEventListener("mousemove", fieldMouseOver);
    return;
}

function fieldClick() {
    var selectedDiv = document.getElementById("selected");

    SelectedLeft = parseInt(selectedDiv.style.left.split("px")[0]);
    SelectedTop = parseInt(selectedDiv.style.top.split("px")[0]);

    // check whether it's already been set
    if (GridMap[SelectedLeft/64][SelectedTop/64] != 0){
        createHintDiv(ALERT_OCCUPIED);
        setTimeout(function () { createHintDiv(""); }, 2000);
        return;
    }

    cField.removeEventListener("mousemove", fieldMouseOver);
    cField.removeEventListener("click", fieldClick);

    selectedDiv.style.borderColor = "red";

    // create a hint window
    createHintDiv(HINT_SETUP);
    window.addEventListener("keydown", fieldConfig);
}

function createHintDiv(msg) {
    var child = document.getElementById("hint");
    if (child != null ){
        cField.removeChild(child);
    }

    var hintDiv = document.createElement("DIV");
    var hintText = document.createTextNode(msg);
    hintDiv.appendChild(hintText);
    hintDiv.setAttribute("class", "hintdiv");
    hintDiv.setAttribute("id", "hint");

    var offset = SelectedLeft;
    if (offset + 300 >= 640){
        offset = 340;
    }
    hintDiv.style.left = offset + "px";

    offset = SelectedTop;
    if (offset + 64 >= 640){
        offset = offset - 64;
    }
    else{
        offset = offset + 64;
    }
    hintDiv.style.top = offset + "px";
    cField.appendChild(hintDiv);
}

function fieldConfig(event) {
    var hasProcessed = false;

    // place an object
    if (event.key >= "1" && event.key <= "9"){
        GridMap[SelectedLeft/64][SelectedTop/64] = event.key;
        placeObject("fuel-"+event.key);
        hasProcessed = true;
    }
    else{
        switch(event.key){
            case "Escape":
                hasProcessed = true;
                break;

            case "o":
                GridMap[SelectedLeft/64][SelectedTop/64] = OBSTACLE;
                placeObject("obstacle");
                hasProcessed = true;
                break;

            case "u":
                if (CurrentUserPos.length == 0){
                    GridMap[SelectedLeft/64][SelectedTop/64] = -1;
                    CurrentUserPos.push(SelectedLeft/64);
                    CurrentUserPos.push(SelectedTop/64);
                    placeObject("submarine");
                    hasProcessed = true;
                }
                else{
                    createHintDiv(ALERT_ALREADY_SET);
                    setTimeout(function () { createHintDiv(HINT_SETUP); }, 2000);
                }
                break;

            case "k":
                GridMap[SelectedLeft/64][SelectedTop/64] = -1;
                CurrentKillerPos.push(SelectedLeft/64);
                CurrentKillerPos.push(SelectedTop/64);
                placeObject("killer");
                hasProcessed = true;
                break;

            default:
                createHintDiv(ALERT_PLACE_KEYS);
                setTimeout(function () { createHintDiv(HINT_SETUP); }, 2000);
                break;
        }
    }

    // Has been processed
    if (hasProcessed){
        // remove hint & selected div
        removeBorderDiv();

        // remove listener
        window.removeEventListener("keydown", fieldConfig);

        // add listeners
        cField.addEventListener("mousemove", fieldMouseOver);
        cField.addEventListener("click", fieldClick);
    }
}

function removeBorderDiv() {
    var child = document.getElementById("hint");
    if (child != null ){
        cField.removeChild(child);
    }
    child = document.getElementById("selected");
    if (child != null ){
        cField.removeChild(child);
    }
}

function placeObject(obj) {
    var imgElem = document.createElement("IMG");
    imgElem.setAttribute("src", "images/"+obj+".png");
    var objectDiv = document.createElement("DIV");
    objectDiv.setAttribute("class", "objectdiv");
    objectDiv.style.left = SelectedLeft + "px";
    objectDiv.style.top = SelectedTop + "px";
    objectDiv.appendChild(imgElem);
    cField.appendChild(objectDiv);
}

function fieldMouseOver(event) {
    var child = document.getElementById("selected");
    if (child != null){
        cField.removeChild(child);
    }

    // create a shadowing div
    var rect = cField.getBoundingClientRect();
    var xOffset = Math.floor((event.pageX - rect.left)/64) * 64;
    var yOffset = Math.floor((event.pageY - rect.top)/64) * 64;
    var borderDiv = document.createElement("DIV");
    borderDiv.setAttribute("class", "borderdiv");
    borderDiv.setAttribute("id", "selected");
    borderDiv.style.left = xOffset + "px";
    borderDiv.style.top = yOffset + "px";

    cField.appendChild(borderDiv);
}

