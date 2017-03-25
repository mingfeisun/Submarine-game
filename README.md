## Introduction
The JavaScript program implements a simple game named *submarine* which consists of three stages, setup, play and end as the snapshots show:



## Details
During the play stage the game proceeds in rounds. The game is played on a grid with 10 x 10 cells. It involves a submarine that is controlled by the user and a couple of robotic killer submarines that are controlled by the computer (that is, your program). The user and your program are the two players of the game. All submarines can move around on the grid, but while the robotic killer submarines are fueled by nuclear power that never runs out, the user's submarine only has a limited amount of fuel and needs to collect fuel cells to keep going. The robotic killer submarines hunt the user's submarine; the user's submarine tries to avoid getting caught while also collecting all the fuel cells on the grid.

### Setup stage

The game always starts in the setup stage. During that stage the user is shown the grid and can place three different types of objects on the cells of the grid:

* by clicking on a cell and typing a number between 1 and 9, a fuel cell is placed on a grid cell, the number indicates the amount of fuel in the fuel cell;
* by clicking on a cell and typing the letter "o", an obstacle is placed on a cell;
* by clicking on a cell and typing the letter "u", the user's submarine is placed on a cell.
* by clicking on a cell and typing the letter "k", a robotic killer submarine is placed on a cell.

There is no limit on the number of fuel cells, obstacles and robotic killer submarines, but there is obviously only one user's submarine. No grid cell can contain more than one object and once an object has been placed on a cell it cannot be changed. If the user tries to change the object placed on a grid cell, then an error message should be shown. If the user types a character that is not among 1 to 9, "o", "u" and "k", an error message should be shown.
In addition to the grid, the user must have a means to end the setup stage of the game, for example, via a button. If the user tries to end the setup stage of the game without placing his own submarine, then an error message should be shown and the user remains in the setup stage. Otherwise the game continues with the play stage.

### Start stage
At the start and during the play stage, the user is again shown the grid, initially with all the objects that have been placed on the grid during the setup stage, plus additional status information: The rounds played so far, the number of units of fuel available to the user's submarine, the user's score, the computer's score. Initially, zero rounds have been played, the user's submarine has 10 units of fuel, the user's and the computer's score are both zero. In addition, there must be the possibility for the user to end the play stage at any time, for example, via a button.

While in the play stage, the game proceeds in rounds, each round starting with the user's turn followed by the computer's turn. At the start of a round, the number of rounds played is increased by one, and the information shown to the user is updated.

During his/her turn, if the number of units of fuel of the user's submarine is zero at the start of the turn, then the user's submarine cannot move, a message should be shown indicating that the submarine is out of fuel and the user's turn then ends.
If the number of units of fuel of the user's submarine is greater than zero at the start of the turn, the user can attempt to move his/her submarine horizontally or vertically on the grid by typing one of four letters:

* "a" attempts to move the user's submarine one grid cell to the left,
* "d" attempts to move the user's submarine one grid cell to the right,
* "w" attempts to move the user's submarine one grid cell up,
* "x" attempts to move the user's submarine one grid cell down.

If the user types any other character, then an error message should be shown and the user has the possibility to type another character. If the attempted move would result in the user's submarine ending up outside the grid or on a cell occupied by an obstacle, then an error message should be shown, the attempt to move fails, the user's submarine does not move, the number of units of fuel available to the user's submarine does not change, and the user's turn is over. Otherwise, the attempted move is successful, the user's submarine changes cells, and the number of units of fuel available to the user's submarine reduces by one. If the user's submarine ends up on a grid cell that contains a fuel cell, then that fuel cell is removed from the grid, the value V of the fuel cell is added both to the user's score and to the number of units of fuel available to the user's submarine, and the status information is updated. If the user's submarine ends up on a cell occupied by a robotic killer submarine, then the user's submarine is destroyed, and the game proceeds to the end stage.

During the computer's turn your program attempts to move each of the robotic killer submarines in an order that allows each to move if at all possible. Unlike the user's submarine, the robotic killer submarines are not only able to move horizontally and vertically but also diagonally. Just like the user's submarine, each robotic killer submarine only moves at most one cell in a turn. If the user's submarine is in a grid cell immediately surrounding a robotic killer submarine, then that robotic killer submarine must move to the cell occupied by the user's submarine, the user's submarine is destroyed, the computer's score increases by 100, the status information is updated, and the game proceeds to the end stage. If the user's submarine is not in a grid cell immediately surrounding a robotic killer submarine, but one or more of those grid cells contains a fuel cell, then the robotic killer submarine must move to one of those fuel cells, the fuel cell is removed from the grid (thereby the computer deprives the user of fuel), the value V of the fuel cell is added to the computer's score, and the status information is updated. If none of the surrounding grid cells contains the user's submarine nor a fuel cell, then a robotic killer submarine can move to an arbitrary surrounding cell provided that this move does not take it to a grid cell that is outside the grid or occupied by an obstacle or by another robotic killer submarine. A robotic killer submarine is not allowed to stand still if it can move. However, if a robotic killer submarine cannot move at all, then the computer should simply proceed to the next robotic killer submarine. Once an attempt has been made to move each of the robotic killer submarines, the computer's turn and the current round ends, and the status information is updated.


### End stage
The play stage ends if one of the following conditions becomes true
the user ends the play stage (by pressing the button provided for that);
the user's submarine is destroyed;
there are no fuel cells left on the grid;
neither the user's submarine nor any of the robotic killer submarines is able to move.
Once the play stage has ended, the game is in the end stage. In the end stage the program determines the outcome of the game. The outcome is a win for the user if there are no robotic killer submarines left on the grid or the user's score is higher than the computer's score; the outcome is a win for the computer if the user's submarine has been destroyed or the computer's score is higher than the user's score; otherwise, the outcome is a draw. The program should display a message indicating the outcome of the game and then stop. During the end stage the program should not react to any user input or actions.

## Others