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

var CurrentKillerPos = []; // 0-9, 0-9
var CurrentUserPos = []; // 0-9, 0-9
var CurrentFuel = 0;
var CurrentUserScore = 0;
var CurrentComputerScore = 0;
var CurrentRound = 0;
var FuelCount = 0;



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

var HINT_MOVE_OUT_OF_RANGE = "Out of range! Move fails...";
var HINT_MOVE_OUT_OF_RANGE_T = 1503;

var HINT_MOVE_TO_OBSTACLE = "Come across obstacles! Move fails...";
var HINT_MOVE_TO_OBSTACLE_T = 1504;

var HINT_MOVE_TO_KILL = "Kill position! Move fails...";
var HINT_MOVE_TO_KILL_T = 1505;

var HINT_FUEL_GET1 = "Fuels + ";
var HINT_FUEL_GET2 = ", Scores + ";
var HINT_FUEL_GET_T = 1001;

var HINT_FUEL_LOSE = "Fuels - 1";
var HINT_FUEL_LOSE_T = 501;

var HINT_KILLER_SCORE_GET = "Killer Scores +";
var HINT_KILLER_SCORE_GET_T = 401;



/************************************************************
 * GridMap stores the grid status
 *
 * 0      means empty
 * -1     means killer/killers
 * -2     means user
 * 1-9    means fuels
 * 1000   means obstacle
 ************************************************************/

var VAL_OBSTACLE = 1e3;

var GridMap = new Array(10);

var IsRunning = -2;
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
    if (IsRunning < -1) {
        showAlert("Setup first here by clicking!", 2000);
        setupInit();
    }
    else if(IsRunning < 0) {
        clearTimeouts();
        showAlert("Game Starts! Please move your submarine.", 1500);
        playInit();
    }
    else if(IsRunning < 1){
        finalOutput();
    }
    else {
        clearSettings();
        showAlert("Setup first here by clicking!", 2000);
        setupInit();
    }
}

function clearTimeouts() {
    // remove all timeouts
    var highestTimeoutId = setTimeout("null");
    for (var i = 0 ; i < highestTimeoutId ; i++) {
        clearTimeout(i);
    }
}

function clearSettings() {
    while(cField.firstChild){
        cField.removeChild(cField.firstChild);
    }
    CurrentKillerPos = []; // 0-9, 0-9
    CurrentUserPos = []; // 0-9, 0-9
    CurrentFuel = 0;
    CurrentUserScore = 0;
    CurrentComputerScore = 0;
    CurrentRound = 0;
    FuelCount = 0;

    SelectedLeft = 0;
    SelectedTop = 0;
}

// play init
function playInit() {
    // game running flag
    IsRunning = 0;

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
    // remove the listener
    window.removeEventListener("keydown", controlSubmarine);

    switch (event.key){
        case "a":
            updateUserPosition(-1, 0);
            break;
        case "w":
            updateUserPosition(0, -1);
            break;
        case "d":
            updateUserPosition(1, 0);
            break;
        case "x":
            updateUserPosition(0, 1);
            break;
        default:
            showHint(HINT_CONTROL_KEYS, HINT_CONTROL_KEYS_T);
            window.addEventListener("keydown", controlSubmarine);
            break;
    }
}

// object move update
function updateUserPosition(xShiftVal, yShiftVal) {

    var estimatedPosX = CurrentUserPos[0] + xShiftVal;
    var estimatedPosY = CurrentUserPos[1] + yShiftVal;

    if (estimatedPosX < 0 || estimatedPosX >9 || estimatedPosY < 0 || estimatedPosY > 9){
        showHint(HINT_MOVE_OUT_OF_RANGE, HINT_MOVE_OUT_OF_RANGE_T);
        // window.addEventListener("keydown", controlSubmarine);
    }
    else if (GridMap[estimatedPosX][estimatedPosY] == VAL_OBSTACLE){
        showHint(HINT_MOVE_TO_OBSTACLE, HINT_MOVE_TO_OBSTACLE_T);
        // window.addEventListener("keydown", controlSubmarine);
    }
    else if (GridMap[estimatedPosX][estimatedPosY] == -1){
        showHint(HINT_MOVE_TO_KILL, HINT_MOVE_TO_KILL_T);
        // window.addEventListener("keydown", controlSubmarine);
    }
    else{
        moveUser(xShiftVal, yShiftVal);
    }
}

function moveUser(xVal, yVal) {
    var userDiv = document.getElementById("user");

    var stepsX = 0;
    var stepsY = 0;
    if (xVal != 0 ){
        stepsX = xVal * 1; // set moving steps to 4;
    }
    if (yVal != 0 ){
        stepsY = yVal * 1; // set moving steps to 4;
    }

    var currentX = parseInt(userDiv.style.left.split("px")[0]);
    var currentY = parseInt(userDiv.style.top.split("px")[0]);
    var targetX = (CurrentUserPos[0] + xVal);
    var targetY = (CurrentUserPos[1] + yVal);

    var fuelDiv = null;
    if (GridMap[targetX][targetY] > 0 && GridMap[targetX][targetY] < 10){
        fuelDiv = document.getElementById("fuel"+targetX+targetY);
        fuelDiv.style.opacity = 1;
    }

    showHint(HINT_FUEL_LOSE, HINT_FUEL_LOSE_T);
    CurrentFuel -= 1;
    updateStatus();

    movit();

    function movit() {
        var offOpa = 0.05;
        if (currentX != targetX*64 || currentY != targetY*64){
            currentX += stepsX;
            currentY += stepsY;
            userDiv.style.left = currentX + "px";
            userDiv.style.top = currentY + "px";
            if (fuelDiv != null && parseFloat(fuelDiv.style.opacity) > 0){
                fuelDiv.style.opacity = parseFloat(fuelDiv.style.opacity) - offOpa;
            }
            setTimeout(movit, 20);
        }
        else{
            GridMap[CurrentUserPos[0]][CurrentUserPos[1]] = 0;

            CurrentUserPos[0] = targetX;
            CurrentUserPos[1] = targetY;

            SelectedLeft = CurrentUserPos[0]*64;
            SelectedTop = CurrentUserPos[1]*64;

            if (fuelDiv != null){
                // remove the div
                cField.removeChild(fuelDiv);

                // update the gridmap
                var addFuel = GridMap[targetX][targetY];

                showHint(HINT_FUEL_GET1 + addFuel + HINT_FUEL_GET2 + addFuel, HINT_FUEL_GET_T);
                CurrentFuel += parseInt(addFuel);
                CurrentUserScore += parseInt(addFuel);

                FuelCount -= 1;
                if (FuelCount == 0){
                    updateStatus();
                    finalOutput();
                    return;
                }
            }
            GridMap[targetX][targetY] = -2;

            updateStatus();
            if (CurrentFuel == 0){
                finalOutput();
                return;
            }

            updateKillerPosition();
            window.addEventListener("keydown", controlSubmarine);
        }
    }
}


function finalOutput() {
    // game over flag
    IsRunning = 1;

    window.removeEventListener("keydown", controlSubmarine);

    cButton.innerHTML = "START";

    var finalRes = "";
    if (CurrentUserScore > CurrentComputerScore){
        finalRes = "WIN ^o^ !";
    }
    else{
        finalRes = "LOSE !"
    }
    showAlert("Game Over! You " + finalRes, 5000);
}


function updateKillerPosition() {
    for (var i = 0; i < CurrentKillerPos.length/2; i++){
        var killerX = CurrentKillerPos[2*i];
        var killerY = CurrentKillerPos[2*i+1];

        var offsetX = Infinity;
        var offsetY = Infinity;

        // find any fuels or user nearby, select the maximum fuel or user
        var maxFuel = 0;
        var emptyCount = 0;
        var lastX = Infinity;
        var lastY = Infinity;
        for (var j = -1; j <= 1; j++){
            if (killerX + j < 0 || killerX + j > 9){
                continue;
            }
            for (var k = -1; k <= 1; k++){
                if (killerY + k < 0 || killerY + k > 9){
                    continue;
                }
                if (GridMap[killerX + j][killerY + k] >= 0 && GridMap[killerX + j][killerY + k] < VAL_OBSTACLE){
                    emptyCount += 1;
                    lastX = j; lastY = k;
                }

                if (GridMap[killerX + j][killerY + k] == -2){
                    offsetX = j;
                    offsetY = k;
                    maxFuel = -1;
                    break;
                }
                if (GridMap[killerX + j][killerY + k] > maxFuel && GridMap[killerX + j][killerY + k] < VAL_OBSTACLE){
                    maxFuel = GridMap[killerX + j][killerY + k];
                    offsetX = j;
                    offsetY = k;
                }
            }
            if (maxFuel == -1){
                break;
            }
        }

        // no empty spaces for this killer to move
        if (emptyCount == 0){
            continue;
        }

        // no fuels found, uniformly pick an empty position
        if (offsetX == Infinity || offsetY == Infinity){
            for (var j = -1; j <= 1; j++){
                if (killerX + j < 0 || killerX + j > 9){
                    continue;
                }
                for (var k = -1; k <= 1; k++){
                    if (killerY + k < 0 || killerY + k > 9){
                        continue;
                    }
                    if (GridMap[killerX + j][killerY + k] >= 0 && GridMap[killerX + j][killerY + k] < VAL_OBSTACLE && Math.random() >= (1- 1/emptyCount)){
                        offsetX = j;
                        offsetY = k;
                        break;
                    }
                }
                if (offsetX != -10 && offsetY != -10){
                    break;
                }
            }
        }

        // randomly selection fails
        if (offsetX == Infinity || offsetY == Infinity){
            offsetX = lastX; offsetY = lastY;
        }

        moveKiller(i, killerX, killerY, offsetX, offsetY);
    }
}

// move killer
function moveKiller(index, startX, startY, offsetX, offsetY) {
    var killerDiv = document.getElementById("killer"+startX+startY);

    var stepsX = 0;
    var stepsY = 0;
    if (offsetX != 0 ){
        stepsX = offsetX * 1; // set moving steps to 4;
    }
    if (offsetY != 0 ){
        stepsY = offsetY * 1; // set moving steps to 4;
    }

    var currentX = parseInt(killerDiv.style.left.split("px")[0]);
    var currentY = parseInt(killerDiv.style.top.split("px")[0]);
    var targetX = (startX + offsetX);
    var targetY = (startY + offsetY);

    var fuelDiv = null;
    if (GridMap[targetX][targetY] > 0 && GridMap[targetX][targetY] < 10){
        fuelDiv = document.getElementById("fuel"+targetX+targetY);
        fuelDiv.style.opacity = 1;
    }

    movit();

    function movit() {
        var offOpa = 0.05;
        if (currentX != targetX*64 || currentY != targetY*64){
            currentX += stepsX;
            currentY += stepsY;
            killerDiv.style.left = currentX + "px";
            killerDiv.style.top = currentY + "px";
            if (fuelDiv != null && parseFloat(fuelDiv.style.opacity) > 0){
                fuelDiv.style.opacity = parseFloat(fuelDiv.style.opacity) - offOpa;
            }
            setTimeout(movit, 20);
        }
        else{
            CurrentKillerPos[index*2] = targetX;
            CurrentKillerPos[index*2 + 1] = targetY;
            killerDiv.setAttribute("id", "killer"+targetX+targetY);


            CurrentRound += 1;

            if (targetX == CurrentUserPos[0] && targetY == CurrentUserPos[1]){
                CurrentComputerScore += 100;
                updateStatus();
                finalOutput();
                return;
            }

            if (fuelDiv != null){
                // remove the div
                cField.removeChild(fuelDiv);

                // update the gridmap
                var addFuel = GridMap[targetX][targetY];

                showHint(HINT_KILLER_SCORE_GET + addFuel, HINT_KILLER_SCORE_GET_T + index, targetX*64, targetY*64);
                CurrentComputerScore += parseInt(addFuel);

                FuelCount -= 1;
                if (FuelCount == 0){
                    updateStatus();
                    finalOutput();
                    return;
                }
            }

            GridMap[startX][startY] = 0;
            GridMap[targetX][targetY] = -1;

            updateStatus();
        }
    }

}

// update playing info
function updateStatus() {
    nScoreUser.innerHTML = CurrentUserScore;
    nScoreComputer.innerHTML = CurrentComputerScore;
    nRounds.innerHTML = CurrentRound;
    nRemainingFuel.innerHTML = CurrentFuel;
}

// setup init
function setupInit() {
    // game setup flag
    IsRunning = -1;

    for (var i = 0; i < 10; i++){
        GridMap[i] = new Array(10);
        GridMap[i].fill(0);
    }

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
function showHint(msg, duration, xPixel, yPixel){
    // check existing div and mark it
    // var child = document.getElementById("hint");
    // var affixID = "";
    // if (child != null){
    //     affixID = duration; // for overlay effect
    // }

    if (xPixel === undefined || yPixel === undefined){
        xPixel = SelectedLeft;
        yPixel = SelectedTop;
    }

    var hintDiv = document.createElement("DIV");
    var hintText = document.createTextNode(msg);
    hintDiv.appendChild(hintText);
    hintDiv.setAttribute("class", "hintdiv");
    hintDiv.setAttribute("id", "hint"+duration);

    var offset = xPixel;
    if (offset + 300 >= 640){
        offset = 340;
    }
    hintDiv.style.left = offset + "px";

    offset = yPixel;
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
        FuelCount += 1;
        placeObject("fuel-"+event.key);
        hasProcessed = true;
    }
    else{
        switch(event.key){
            case "Escape":
                hasProcessed = true;
                break;

            case "o":
                GridMap[SelectedLeft/64][SelectedTop/64] = VAL_OBSTACLE;
                placeObject("obstacle");
                hasProcessed = true;
                break;

            case "u":
                if (CurrentUserPos.length == 0){
                    GridMap[SelectedLeft/64][SelectedTop/64] = -2;
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
    var objectImg = document.createElement("IMG")
    objectImg.setAttribute("src", "images/"+obj+".png");

    var objectDiv = document.createElement("DIV");
    objectDiv.setAttribute("class", "objectdiv");
    if (obj == "submarine"){
        objectDiv.setAttribute("id", "user");
    }
    if (obj == "killer"){
        objectDiv.setAttribute("id", "killer" + SelectedLeft/64 + SelectedTop/64);
    }
    if (obj.split("-")[0] == "fuel"){
        objectDiv.setAttribute("id", "fuel" + SelectedLeft/64 + SelectedTop/64);
    }
    objectDiv.style.left = SelectedLeft + "px";
    objectDiv.style.top = SelectedTop + "px";
    objectDiv.appendChild(objectImg);

    // objectDiv.style.backgroundImage = "url(images/"+obj+".png";
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

