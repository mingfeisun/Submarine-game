/************************************************************
 * Elements in HTML
 ************************************************************/

var cButton = document.getElementById("button");
var cField = document.getElementById("field");
var cWrapGame = document.getElementById("wrapgame");
var nRounds = document.getElementById("rounds");
var nScoreUser = document.getElementById("score_user");
var nScoreComputer = document.getElementById("score_computer");
var nRemainingFuel = document.getElementById("remaining_fuel");



/************************************************************
 * The status when playing
 ************************************************************/

var CurrentKillerPos = [];
var CurrentUserPos = [];
var CurrentFuel = 0;
var CurrentUserScore = 0;
var CurrentComputerScore = 0;
var CurrentRound = 0;



/************************************************************
 * The position of selected grid
 ************************************************************/

var SelectedLeft = 0;
var SelectedTop = 0;



/************************************************************
 * Definitions for Hint Strings
 * The Time Durations are also used as the unique ID
 ************************************************************/

var HINT_SETUP = "type 1 - 9 to place a fuel cell," +
                 "o to place an obstacle, " +
                 "u to place your submarine, " +
                 "k to place a robotic killer, " +
                 "ESC to cancel.";
var HINT_SETUP_T = 15000;

var HINT_OCCUPIED = "This place has already been set!";
var HINT_OCCUPIED_T = 1501;

var HINT_ALREADY_SET = "Your submarine has already been set!";
var HINT_ALREADY_SET_T = 1502;

var HINT_PLACE_KEYS = "Only 1-9, o, u, k, ESC are allowed";
var HINT_PLACE_KEYS_T = 1999;

var HINT_CONTROL_KEYS = "a-->left, w-->up, d-->right, x-->down";
var HINT_CONTROL_KEYS_T = 2000;



/************************************************************
 * GridMap stores the grid status
 *
 * 0    means empty
 * -1   means occupied
 * 1-9  means fuels
 * 1000 means obstacle
 ************************************************************/

var OBSTACLE = 1e3;

var GridMap = new Array(10);
for (var i = 0; i < 10; i++){
    GridMap[i] = new Array(10);
    GridMap[i].fill(0);
}

window.document.onload = init();



/************************************************************
 * Functions Starts Here
 ************************************************************/

// system init
function init() {
    cButton.innerHTML = "START";
    nRounds.innerHTML = "0";
    nScoreUser.innerHTML = "0";
    nScoreComputer.innerHTML = "0";
    nRemainingFuel.innerHTML = "0";
    cButton.addEventListener("click", buttonClick);
}

// button click callback
function buttonClick() {
    if (CurrentKillerPos.length == 0 || CurrentUserPos.length == 0) {
        showAlert("Setup first here by clicking!", 2000);
        setupInit();
    }
    else {
        showAlert("Game starts Now!", 1500);
        playInit();
    }
}

// play init
function playInit() {
    // update button
    cButton.innerHTML = "STOP";

    // update status
    CurrentRound = 1;
    CurrentFuel = 10;
    CurrentUserScore = 0;
    CurrentComputerScore = 0;
    updateStatus();

    // remove all listeners
    cField.removeAttribute("class");
    cField.removeEventListener("click", fieldClick());
    cField.removeEventListener("mousemove", fieldMouseOver);
    window.removeEventListener("keydown", fieldConfig);

    // remove bordered divs
    removeBorderDiv();

    // reset SelectedLeft & SelectedTop
    SelectedLeft = CurrentUserPos[0]*64;
    SelectedTop = CurrentUserPos[1]*64;

    // add listeners for keydown
    window.addEventListener("keydown", controlSubmarine);
}

// user submarine key control
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
            showHint(HINT_CONTROL_KEYS, HINT_CONTROL_KEYS_T);
            break;
    }
}

// object move update
function updatePosition(xVal, yVal) {
    var hasMoved = false;
}

// update playing info
function updateStatus() {
    nScoreUser.innerHTML = CurrentUserScore;
    nScoreComputer.innerHTML = CurrentComputerScore;
    nRounds.innerHTML = CurrentRound;
    nRemainingFuel.innerHTML = CurrentFuel
}

// setup init
function setupInit() {
    cField.setAttribute("class", "cursorPointer");
    cField.addEventListener("click", fieldClick);
    cField.addEventListener("mousemove", fieldMouseOver);
}

// field click callback
function fieldClick() {
    var selectedDiv = document.getElementById("selected");

    SelectedLeft = parseInt(selectedDiv.style.left.split("px")[0]);
    SelectedTop = parseInt(selectedDiv.style.top.split("px")[0]);

    // check whether it's already been set
    if (GridMap[SelectedLeft/64][SelectedTop/64] != 0){
        showHint(HINT_OCCUPIED, HINT_OCCUPIED_T);
        return;
    }

    cField.removeEventListener("mousemove", fieldMouseOver);
    cField.removeEventListener("click", fieldClick);

    selectedDiv.style.borderColor = "red";

    // create a hint window
    showHint(HINT_SETUP, HINT_SETUP_T);
    window.addEventListener("keydown", fieldConfig);
}

// show alert info in the field
function showAlert(msg, duration) {
    var alertDiv = document.createElement("DIV");
    var alertText = document.createTextNode(msg);
    alertDiv.appendChild(alertText);
    alertDiv.setAttribute("class", "alerting");
    alertDiv.setAttribute("id", "alert");
    cWrapGame.appendChild(alertDiv);

    setTimeout(function () {
        var alertDiv = document.getElementById("alert");
        cWrapGame.removeChild(alertDiv);
    }, duration);
}

// show hint info over the field
function showHint(msg, duration){
    // check existing div and mark it
    // var child = document.getElementById("hint");
    // var affixID = "";
    // if (child != null){
    //     affixID = duration; // for overlay effect
    // }

    var hintDiv = document.createElement("DIV");
    var hintText = document.createTextNode(msg);
    hintDiv.appendChild(hintText);
    hintDiv.setAttribute("class", "hintdiv");
    hintDiv.setAttribute("id", "hint"+duration);

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

    setTimeout(function () {
        var hintDiv = document.getElementById("hint"+duration);
        cField.removeChild(hintDiv);
    }, duration);
}

// configure the playing field
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
                    showHint(HINT_ALREADY_SET, HINT_ALREADY_SET_T);
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
                showHint(HINT_PLACE_KEYS, HINT_PLACE_KEYS_T);
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

// remove alert info div and selected div
function removeBorderDiv() {
    var child = document.getElementById("hint"+HINT_SETUP_T);
    if (child != null ){
        cField.removeChild(child);
    }
    child = document.getElementById("hint"+HINT_ALREADY_SET_T);
    if (child != null ){
        cField.removeChild(child);
    }
    child = document.getElementById("hint"+HINT_CONTROL_KEYS_T);
    if (child != null ){
        cField.removeChild(child);
    }
    child = document.getElementById("hint"+HINT_PLACE_KEYS_T);
    if (child != null ){
        cField.removeChild(child);
    }
    child = document.getElementById("hint"+HINT_OCCUPIED_T);
    if (child != null ){
        cField.removeChild(child);
    }

    child = document.getElementById("selected");
    if (child != null ){
        cField.removeChild(child);
    }
}

// place objects in the field grid
function placeObject(obj) {
    var objectDiv = document.createElement("DIV");
    objectDiv.setAttribute("class", "objectdiv");
    objectDiv.style.left = SelectedLeft + "px";
    objectDiv.style.top = SelectedTop + "px";
    objectDiv.style.backgroundImage = "url(images/"+obj+".png";
    cField.appendChild(objectDiv);
}

// track mouse move and select the grid it belongs to
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

