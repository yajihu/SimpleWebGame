
By Yaji Hu    
   Yejing Li 

Date: 2018.3.08

Written with Mac10.13.1 and Win 10 systems
Tested by Google Chrome browser
Reference: Code from tutorials and lecture notes from Dr.Louis Nel.

1)To run the website, firstly you need to switch to A3 directory.
  Secondly you need to type  "node server.js" in command lines.

2)When the cmd finishes the debugging, you can copy the url link
  shown up as http://localhost:3000/assignment3.html to browse the web.

3)Having opened the website, you will see a game interface on the 
  600*1200 canvas board. The board is separated 2 halves by a line.
  You will notice that there are two paddles on each side for two users.
  Moreover, the user names are shown on the top of the game interface,
  Below which the scores for two users are shown as well.

4)Then look at the bottom of the website, you will see a user login 
  Text field. You need to enter your user name then you can play your
  Game.

5)Having entered the name, the little grey ball begins to move. While 
  It moves, it bounces back if it collides with the border of the canvas
  area and the two paddles( as written in handlerTimer function.)

6)If the moving grey ball collides the left corner or the right corner
  (A red straight box on the left and right side), player 1 and player 2
  Will get points respectively.

7)Notice the middle of the canvas area. There is a line set as a border 
  for two paddles. Each paddle cannot enter the area as separated by the
  line.
  
8)Once player login the game, the submit button is no longer valid in 
  case the duplicate submission. If there are two player login to the 
  game,the third submission will receive an alert "Full Player". 
  If one of the player close the window, thats a disconnection, 
  all other page will receive an alert "One Player Left".
  And the leaving player side will reset(Player name, scores reset).
  If one player leave, then other browsers are allow to become the new 
  player by submit his username.

9)All pages opened at the beginning should synchronize prefectly, 
  pages opened after the game start will show the default page,
  but will synchronize once one of the player makes the move.
