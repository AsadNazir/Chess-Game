
import { modalBoxPopUp as MBP } from "./modalBox.js";

//Chess Class
class ChessBoard {

    //Private Data Members
    #boxes;
    #Array2DOfChess;
    #grabbedPiece;
    #isPieceGrabbed;
    #turnArr;
    #turn;
    #sound;
    #oldKing
    #iskingMoved
    #isRookedMoved
    #originalBoard
    constructor() {
        //getting the DOM elements in the boxes array
        //1D Array of DOM elements
        this.#boxes = document.querySelectorAll(".chessBoxes");

        //2D Array of the same above Boxes Verion
        //2D Array of Objects of Chess with all the properties
        this.#Array2DOfChess=[];

        //Name says it basically makes a 2D array of chess Boxes easier to work with
        //Also makes the board on the screen
        this.FillTheBoard();

        //Logically and virtually holding the Chess Piece selected by thr user
        //Chess piece shown in Black box stored in it as an Chess Piece Objecet
        //See the constructor below for Chess Piece
        //Every Detail can be accessed of the selected Piece with this data Member
        //Intializing the Grabbed Piece by garbage
        this.#grabbedPiece= new ChessPiece(null,-1,-1,'none', 'none');

        //A varibale to know when the Piece is selected or not
        this.#isPieceGrabbed=false;

        //All the Main functionality for Moving the Piece
        this.grabThePiece();

        //An Array to just display whose Turn is it
        this.#turnArr=["White", "Black"];

        //Turn to keep track of turns ODD and EVEN (White and Black Respectively)
        this.#turn=0;

        //Just a Click Sound when a piece is placed
        this.#sound= new Audio("./chessPieceSound.mp3");

        //A varibale used to store the old Kings Position as Cordinate Objects
        //Used in kingIsIndanger Function to Remove and Add Red Box for Check
        this.#oldKing= new Cordiante(-1,-1);

        //For Castling to see if king has moved or not
        this.#iskingMoved= [false,false];
        
        //For Castling to see if Rooks have moved or not
        this.#isRookedMoved= [[false,false],[false,false]];

        //To save the state of the borad as it is first loaded to Reset it 
        //Just for Reset Function
        this.#originalBoard=document.querySelector(".chessBoard").innerHTML;
    }

    //Just to fill the board
    FillTheBoard = () => {
        let turn = 0;

        //Color The boxes
        for (let i = 0; i < this.#boxes.length; i++) {

            let id = ['lightBlue', 'darkBlue']
            if (i % 8 == 0) {
                turn++;
            }

            this.#boxes[i].className += " " + id[turn % 2];
            turn++;

        }

        // This is to fill the 2D Array of Chess
        let tempArr=[];
        for (let i = 0; i < 8; i++) {
            
          for (let j = 0; j < 8; j++) {
            
            let tempPiece = new ChessPiece(this.#boxes[i*8 +j], i ,j,this.#boxes[i*8 +j].dataset.color,this.#boxes[i*8 +j].dataset.piece);
              tempArr.push(tempPiece);
          }

          this.#Array2DOfChess.push(tempArr);

          tempArr=[];
        }
       
    }

    //Main Grabbing the piece Logic over here
    //Most of the private Function are Called here
    //This is the main Function then runs the board
    grabThePiece =()=>
    {

        //Outer For loops for just adding event listners
        for (let i = 0; i < 8; i++) 
        {
           for (let j = 0; j < 8; j++) 
           {
            
               this.#Array2DOfChess[i][j].piece.addEventListener("click",()=>
               {

                //If the Piece is not Grabbed then only it will grab it
                   if(this.#isPieceGrabbed==false)
                      {
                        //Check to ensure it selects the Correct color and Box
                        if(this.#Array2DOfChess[i][j].piece.dataset.color !='none' && this.#Array2DOfChess[i][j].color == this.#turnArr[this.#turn])
                        {
                            this.#grabbedPiece = new ChessPiece(this.#Array2DOfChess[i][j].piece, i ,j,this.#Array2DOfChess[i][j].color,this.#Array2DOfChess[i][j].type); 

                            for (let k = 0; k < 8; k++) {
                            for (let l = 0; l < 8; l++) {
                            
                             if(k==i && l==j) continue;
                            this.#Array2DOfChess[k][l].piece.classList.remove("selectedChessPiece");
                            }
                            
                        }
                        
                        //Adding Class of selected Chess Piece so it is shown
                        this.#grabbedPiece.piece.classList.add("selectedChessPiece");

                        //This is to highlight all legal moves
                        this.#highlighting();

                        //Setting the Flag true over here after piece is selected
                        this.#isPieceGrabbed=true;  

                    }
                    }

                    //If a player decides to place the piece back
                    //It matches the DOM object of both grabbed Piece and destination
                    //If same then enter it meaning player is unselecting th piece
                    else if(this.#grabbedPiece.piece=== this.#Array2DOfChess[i][j].piece)
                    {   
                        //Ungrabbing the Piece
                        this.#isPieceGrabbed=false;

                        //Changing the style for piece
                        this.#grabbedPiece.piece.classList.remove("selectedChessPiece");

                        //Setting the data-sets
                        this.#Array2DOfChess[i][j].piece.dataset.color = this.#grabbedPiece.color;
                        this.#Array2DOfChess[i][j].piece.dataset.piece = this.#grabbedPiece.type;

                        //Emptying the Grabbed Piece Temporary Object
                        this.#grabbedPiece = new ChessPiece(null,-1,-1);

                         //Rmoving the Highlighting when player placed The piece back 
                        this.#unhighlight();

                    }

                    // IF player Moves the piece
                    //The Main Logic for almost everythhing after placing and During Placing
                    //Study it carefully
                    else
                    {
                        //Check to ensure you dont put onto ur own piece 
                        if(this.#grabbedPiece.color != this.#Array2DOfChess[i][j].color)
                        {
                          
                            //destination
                            let pos = new Cordiante(i,j);

                           if(this.#legalMove(i,j) && !this.#selfCheck(pos))
                           {
                                //Implementing casling by checking if its possible or not
                                if(this.#isCastling(pos))
                                {
                                    this.#castling(pos);
                                }

                               //placing the Piece on DOM
                                this.#placePiece(i,j);

                                //Checking for pawn promotion
                                this.#pawnPromotion();

                                //To highlight if king is in danger
                                this.#kingIsInDanger();
                                

                                //Checking if King has Been Moved for castling
                                if(this.#grabbedPiece.type=="King")
                                {
                                    this.#iskingMoved[this.#turn]=true;
                                }

                                

                                
                                

                                //Changing turns over here
                                this.#turn++;
                                if(this.#turn>=2) this.#turn= this.#turn %2;
                                
                                //Changing turn in header over here
                                let turnHeading= document.querySelector(".turn >span");
                                turnHeading.textContent=this.#turnArr[this.#turn];
                                
                                
                                
                                //Checking for stale mate or check mate
                                if(!this.#isAnyMoveAvailable())
                                {
                                    //Changing turn for Checking checkmate
                                    this.#turn++;
                                    if(this.#turn>=2) this.#turn= this.#turn %2;

                                    if(this.#checkBy())
                                    {
                                        setTimeout(()=>
                                        {
                                            alert("Checkmate");
                                            this.reset();
                                        },300)
                                    }

                                    //Changing turn for Checking Stale Mate
                                    else
                                    {
                                        setTimeout(()=>
                                        {
                                            alert("Stale Mate");
                                            this.reset();
                                        },300);
                                    }
                                }
                                
                                //Removing the Highlighting when player moved the piece 
                                this.#unhighlight();
                                this.#sound.play();

                                //Emptying the Temporary Grabbed Piece
                                this.#grabbedPiece = new ChessPiece(null,-1,-1, 'none', 'none');
                                this.#isPieceGrabbed=false;
                           };
            
                        }
                }
                }
                )

            }
            
        }
    }

    #isRookMovedCheck =(i,j)=>
    {
        if(this.#grabbedPiece.type=="Rook")
        {
            if(this.#grabbedPiece.position.c==0 || j==0)
            {
                
                this.#isRookedMoved[this.#turn][0]=true;
               
            }
            else
            {
                this.#isRookedMoved[this.#turn][1]=true;
            }

        }

        else if(this.#Array2DOfChess[i][j].type=="Rook"){
            if(j==0)
            {
                
                this.#isRookedMoved[(this.#turn+1)%2][0]=true;
               
            }
            else
            {
                this.#isRookedMoved[(this.#turn+1)%2][1]=true;
            }
        }
    }

    //Placing th piece on the DOM
    #placePiece =(i,j)=>
    {
        //Rook Check over if it is moved or killed
        //Checkign if Rooks have been moved or not for Castling
      this.#isRookMovedCheck(i,j);
        // Processing over here

        this.#Array2DOfChess[i][j].piece.innerHTML=this.#grabbedPiece.piece.innerHTML;
        this.#grabbedPiece.piece.innerHTML="";

        this.#grabbedPiece.piece.dataset.piece="none";
        this.#grabbedPiece.piece.dataset.color="none";

        this.#Array2DOfChess[this.#grabbedPiece.position.r][this.#grabbedPiece.position.c].color = "none";
        this.#Array2DOfChess[this.#grabbedPiece.position.r][this.#grabbedPiece.position.c].type = "none";
       
        
        //Unselecting the Grabbed Piece
        this.#grabbedPiece.piece.classList.toggle("selectedChessPiece");

        //Setting the data Sets of the Destination Place
        this.#Array2DOfChess[i][j].piece.dataset.color = this.#grabbedPiece.color;
        this.#Array2DOfChess[i][j].color = this.#grabbedPiece.color;

        this.#Array2DOfChess[i][j].type = this.#grabbedPiece.type;
        this.#Array2DOfChess[i][j].piece.dataset.piece = this.#grabbedPiece.type;

        this.#isPieceGrabbed=false;
    }
    
    //Utulity Functions---------------------------------------
    //These Function just check our paths to the destination are empty or clear or not
    //Simple logics yet used everywhere
    //Checking Paths Diagonal horizontal vertical
    #isHorizontalPath= (pos)=>
    {
       return this.#grabbedPiece.position.r==pos.r;
    }

    #isVerticalPath= (pos)=>
    {
       return this.#grabbedPiece.position.c==pos.c;
    }

    #isDiognal(pos)
    {
        return (Math.abs(this.#grabbedPiece.position.c-pos.c) == Math.abs(this.#grabbedPiece.position.r-pos.r) );
    }

    #isHorizontalClear(pos)
    {
        let chotiC;
        let bariC;

        if(this.#grabbedPiece.position.c<pos.c) 
        {
            chotiC= this.#grabbedPiece.position.c;
            bariC=pos.c;
        }
        else
        {
            bariC= this.#grabbedPiece.position.c;
            chotiC=pos.c;
        }

        for(let c=chotiC+1; c<bariC; c++)
        {
            if(this.#Array2DOfChess[pos.r][c].color != 'none') return false;
        }

        return true;
    }


    #isVerticalClear=(pos)=>
    {
        let chotiR;
        let bariR;

        if(this.#grabbedPiece.position.r<pos.r) 
        {
            chotiR= this.#grabbedPiece.position.r;
            bariR=pos.r;
        }
        else
        {
            bariR= this.#grabbedPiece.position.r;
            chotiR=pos.r;
        }

        for(let r=chotiR+1; r<bariR; r++)
        {
            if(this.#Array2DOfChess[r][pos.c].color != 'none') return false;
        }

        return true;
    }
    #isDiogonalClear=(pos)=>
    {
        let row = this.#grabbedPiece.position.r;
        let column = this.#grabbedPiece.position.c;
        let AbsDiff= Math.abs(this.#grabbedPiece.position.c-pos.c);

        if(this.#grabbedPiece.position.c<pos.c && this.#grabbedPiece.position.r<pos.r)
        {
            for (let l = 1; l <AbsDiff; l++) {
            
                if(this.#Array2DOfChess[row+l][column+l].color != 'none') return false;
            }
            return true; 
        }
        
        else if(this.#grabbedPiece.position.c>pos.c && this.#grabbedPiece.position.r>pos.r)
        {
        for (let l = 1; l <AbsDiff; l++) {
            
            
            if(this.#Array2DOfChess[row-l][column-l].color != 'none') return false;
        }
        return true; 
        }

        else if(this.#grabbedPiece.position.c<pos.c && this.#grabbedPiece.position.r>pos.r)
        {
        for (let l = 1; l <AbsDiff; l++) {
            
            if(this.#Array2DOfChess[row-l][column+l].color != 'none') return false;
        }
        return true; 
        }

        else
        {
        for (let l = 1; l <AbsDiff; l++) {
            
            
            if(this.#Array2DOfChess[row+l][column-l].color != 'none') return false;
        }
        return true; 
        }

        return true; 
    }


    // Pieces Moves over here
    #rookMove=(pos)=>
    {
        return ((this.#isHorizontalPath(pos) && this.#isHorizontalClear(pos)) || (this.#isVerticalPath(pos) && this.#isVerticalClear(pos))); 
    }

    #bishopMove=(pos)=>
    {
        return (this.#isDiognal(pos) && this.#isDiogonalClear(pos));
    }

    #queenMove = (pos)=>
    {
        return (this.#rookMove(pos) || this.#bishopMove(pos));
    }

    #knightMove = (pos)=>
    {
        let Dr=Math.abs(this.#grabbedPiece.position.r-pos.r);
        let Dc=Math.abs(this.#grabbedPiece.position.c-pos.c);
        return ((Dr==2 && Dc==1) || (Dc==2 && Dr==1));
    }

    #kingMove = (pos)=>
    {
       
        let Dr=Math.abs(this.#grabbedPiece.position.r-pos.r);
        let Dc=Math.abs(this.#grabbedPiece.position.c-pos.c);
        return (((Dr==1 || Dr==0) && (Dc==0 || Dc==1)) || (Dr==0 && this.#isCastling(pos)));
    }

    #pawnMove =(pos)=>
    {
        // For white pawns
        if(this.#grabbedPiece.color=="White" )
        {
            
            //For vertical Moves only in their initial Position
            if(this.#grabbedPiece.position.r==6)
            {
                if(this.#grabbedPiece.position.c==pos.c)
                {
                    return((this.#grabbedPiece.position.r-pos.r ==1 ||this.#grabbedPiece.position.r-pos.r ==2) && this.#Array2DOfChess[pos.r][pos.c].color=="none" && this.#isVerticalClear(pos))
                }

                //Else is for Diogonal Kill Move in intial position
                //Only Allowed If there is enemy Piece of immediate Diogonal
                else
                {
                    if(Math.abs(this.#grabbedPiece.position.c-pos.c)==1)
                    { 
                        return((this.#grabbedPiece.position.r-pos.r ==1) && this.#Array2DOfChess[pos.r][pos.c].color=='Black')
                    }

                    return false;
                }
            }
            else
            {
                //vertical moving after Initial Postion
                if(this.#grabbedPiece.position.c==pos.c)
                {
                    return((this.#grabbedPiece.position.r-pos.r ==1) && this.#Array2DOfChess[pos.r][pos.c].color=="none");
                }

                //Else is for Diogonal Kill Move in position other than intial
                //Only Allowed If there is enemy Piece of immediate Diogonal
                else
                {
                    if(Math.abs(this.#grabbedPiece.position.c-pos.c)==1)
                    { 
                        return((this.#grabbedPiece.position.r-pos.r ==1 ) && this.#Array2DOfChess[pos.r][pos.c].color=='Black')
                    }

                    return false;
                }
            }
        }

        // For Black Ones
        else
        {
            //For vertical Moves only in their initial Position
            if(this.#grabbedPiece.position.r==1)
            {   if(this.#grabbedPiece.position.c==pos.c)
                {
                    return((this.#grabbedPiece.position.r-pos.r ==-1 ||this.#grabbedPiece.position.r-pos.r ==-2) && this.#Array2DOfChess[pos.r][pos.c].color=="none" &&this.#isVerticalClear(pos))
                }

                //Else is for Diogonal Kill Move in intial position
                //Only Allowed If there is enemy Piece of immediate Diogonal
                else
                {
                    if(Math.abs(this.#grabbedPiece.position.c-pos.c)==1)
                    { 
                        return((this.#grabbedPiece.position.r-pos.r ==-1) && this.#Array2DOfChess[pos.r][pos.c].color=='White')
                    }

                    return false;
                }
            }

            else
            {
                if(this.#grabbedPiece.position.c==pos.c)
                {
                    return((this.#grabbedPiece.position.r-pos.r ==-1) && this.#Array2DOfChess[pos.r][pos.c].color=="none");
                }
                else
                {
                    if(Math.abs(this.#grabbedPiece.position.c-pos.c)==1)
                    { 
                        return((this.#grabbedPiece.position.r-pos.r ==-1) && this.#Array2DOfChess[pos.r][pos.c].color=='White')
                    }

                    return false;
                }
            }
        }

    }

    //Pawn Promotion 
    #pawnPromotion()
    {
        let row=0;
        if(this.#turnArr[this.#turn]=="Black") row= 7;

        for (let l = 0; l < 8; l++) {
            if(this.#Array2DOfChess[row][l].type=="Pawn")
            {
                let pos = this.#Array2DOfChess[row][l];

                let modalbox=document.querySelector(".modalBox");
                modalbox.innerHTML=`  <h1>Pawn Promotion</h1>
            <div class="PawnPromo">
                <img src="./Images/Queen_Black.svg" alt="">
                <img src="./Images/Bishpos_Black.svg" alt="">
                <img src="./Images/Rook_Black.svg" alt="">
                <img src="./Images/knight_Black.svg" alt="">
            </div>`


            let modalBox=document.querySelector(".modalBox");
            let mainWebsite=document.querySelector(".mainWebsite");
    
            mainWebsite.style.filter=`blur(10px)`;
            modalBox.style.top=`50%`;


            let images=document.querySelectorAll(".modalBox img");

            for (let i = 0; i < 4; i++) {
                images[i].addEventListener("click", ()=>
                {
                    if(i==0)
                    { 
                        this.#Array2DOfChess[row][l].piece.innerHTML=`<img src="./Images/Queen_${this.#Array2DOfChess[row][l].color}.svg" alt="">`;
                        this.#Array2DOfChess[row][l].piece.dataset.piece="Queen";
                        this.#Array2DOfChess[row][l].type='Queen';
                    }   
                    else if(i==1) 
                    {
                        this.#Array2DOfChess[row][l].piece.innerHTML=`<img src="./Images/Bishpos_${this.#Array2DOfChess[row][l].color}.svg" alt="">`
                        this.#Array2DOfChess[row][l].piece.dataset.piece="Bishops";
                        this.#Array2DOfChess[row][l].type="Bishops";
                       
                    }
                    else if(i==2) 
                    {
                        this.#Array2DOfChess[row][l].piece.innerHTML=`<img src="./Images/Rook_${this.#Array2DOfChess[row][l].color}.svg" alt="">`;
                        this.#Array2DOfChess[row][l].piece.dataset.piece="Rook";
                        this.#Array2DOfChess[row][l].type="Rook";
                       
                    }
                    else if(i==3)
                    {
                        this.#Array2DOfChess[row][l].piece.innerHTML=`<img src="./Images/knight_${this.#Array2DOfChess[row][l].color}.svg" alt="">`;
                        this.#Array2DOfChess[row][l].piece.dataset.piece="Knight";
                        this.#Array2DOfChess[row][l].type="Knight";
                    }

                    MBP();
                    
                })  
            
            }


   
    }
            
        }
        this.#kingIsInDanger();
    }

    //Function for Checking legal Move for any Piece held in this.#grabbedPiece
    
    #legalMove=(i,j)=>
    {
        let pos = new Cordiante(i,j);

        if(this.#grabbedPiece.type=="Queen" && this.#queenMove(pos))
        {
           return true;
        }

        else if(this.#grabbedPiece.type=="Rook" && this.#rookMove(pos))
        {
            return true;
        }

        else if(this.#grabbedPiece.type=="Bishop" && this.#bishopMove(pos))
        {
            return true;
        }

        else if(this.#grabbedPiece.type=="Knight" && this.#knightMove(pos))
        {
            return true;
        }
        else if(this.#grabbedPiece.type=="King" && this.#kingMove(pos))
        {
            return true;
        }
       
        else if(this.#grabbedPiece.type=="Pawn" && this.#pawnMove(pos))
        {                         
            return true;
        }

        return false;
    }

    //To un highligth the Box that were highlighted
    #unhighlight=()=>
    {

      let source=  this.#grabbedPiece.position;

      for (let l = 0; l < 8; l++) {
        for (let m = 0; m < 8; m++) {
            
            if( this.#Array2DOfChess[l][m].piece.classList.contains("highlight"))
            {
                this.#Array2DOfChess[l][m].piece.classList.remove("highlight");
            }
            
        }
        
      }
    }

    //Function to highlight the legal move boxes
    #highlighting=()=>
    {

      for (let l = 0; l < 8; l++) {
        for (let m = 0; m < 8; m++) {
            
            if(this.#legalMove(l,m) && this.#Array2DOfChess[l][m].color != this.#turnArr[this.#turn] && !this.#selfCheck(new Cordiante(l,m)))
            {
                this.#Array2DOfChess[l][m].piece.classList.add("highlight");
            }
            
        }
        
      }
    }

    //Fucntion to find king used in self check checkby and and to red Highlight the king 
    #findKing=()=>
    {
    
        let pos;
        for (let l = 0; l < 8; l++) {
            for (let m = 0; m < 8; m++) {
                
                if(this.#Array2DOfChess[l][m].color != this.#turnArr[this.#turn] && this.#Array2DOfChess[l][m].type=="King")
                {
                    pos=new Cordiante(l,m);
                    break;
                }
                
            }
            
        }

        return pos;
    }

    //to find if Your King is in check or not and prevent the Player from takign that move
    //Used in Self Check and Also to find Check Mate
    #checkBy=()=>
    {
       
        let pos;
        let tempGrabPiece= new ChessPiece (this.#grabbedPiece.piece,this.#grabbedPiece.position.r,this.#grabbedPiece.position.c,this.#grabbedPiece.color, this.#grabbedPiece.type);
        let flag=false;
        
        pos=this.#findKing();
        
        //Checking the King IS checked or not
        for (let l = 0; l < 8; l++) {
            for (let m = 0; m < 8; m++) {
                
                this.#grabbedPiece = new ChessPiece(this.#Array2DOfChess[l][m].piece, l ,m,this.#Array2DOfChess[l][m].color,this.#Array2DOfChess[l][m].type);
                
                
                if(this.#Array2DOfChess[l][m].color==this.#turnArr[this.#turn] && this.#legalMove(pos.r, pos.c))
                {
                    //Restoring the previous content of grabbedPiece
                    this.#grabbedPiece.piece=tempGrabPiece.piece,
                    this.#grabbedPiece.position=tempGrabPiece.position,
                    this.#grabbedPiece.color=tempGrabPiece.color, 
                    this.#grabbedPiece.type=tempGrabPiece.type;

                    return true;
                }
                
            }
            
        }
        
       
        
        //Restoring the previous content of grabbedPiece
        this.#grabbedPiece.piece=tempGrabPiece.piece,
        this.#grabbedPiece.position=tempGrabPiece.position,
        this.#grabbedPiece.color=tempGrabPiece.color, 
        this.#grabbedPiece.type=tempGrabPiece.type;
       
      return false;
    }

    //Self Check to find if any move of the player puts its king in Check or not and prevent it 
    //Stops the player from taking that move if it puts its king in Check
    #selfCheck=(pos)=>
    {

        //Creating a Temporary Array to hold the Pieces
        const temp2D=JSON.parse(JSON.stringify(this.#Array2DOfChess));

        

        //Changing the turn before Check By
        this.#turn = (this.#turn+1)%2;
        

        //Placing logically our piece on the destination
        //To see if it puts our King in Check or not

        if(this.#grabbedPiece.color != this.#Array2DOfChess[pos.r][pos.c].color)
        {
            this.#Array2DOfChess[pos.r][pos.c].position=pos;
            this.#Array2DOfChess[pos.r][pos.c].type=this.#grabbedPiece.type;
            // this.#Array2DOfChess[pos.r][pos.c].piece=this.#grabbedPiece.piece;
            this.#Array2DOfChess[pos.r][pos.c].color=this.#grabbedPiece.color;

            //Also Emptying the source 
            //So that our piece only exists on place on board
            this.#Array2DOfChess[this.#grabbedPiece.position.r][this.#grabbedPiece.position.c].type="none";
            // this.#Array2DOfChess[this.#grabbedPiece.position.r][this.#grabbedPiece.position.r].piece=null;
            this.#Array2DOfChess[this.#grabbedPiece.position.r][this.#grabbedPiece.position.c].color="none";
        
        }

       
        //Storing check By results
        let check=this.#checkBy();


        //Changing back turn
        this.#turn = (this.#turn+1)%2;

        this.#Array2DOfChess= temp2D;

        for (let i = 0; i < 8; i++) {
            
          for (let j = 0; j < 8; j++) {
            
            this.#Array2DOfChess[i][j].piece=this.#boxes[i*8 +j];
        
          }

        }
        
        return check;
    }

    //Just to Check if any piece of the player has any legal move left or not 
    //Used to see if Stale Mate or not
    #isAnyMoveAvailable=()=>
    {
 
        //This is a temporary grab piece
        let tempGrabPiece= new ChessPiece (this.#grabbedPiece.piece,this.#grabbedPiece.position.r,this.#grabbedPiece.position.c,this.#grabbedPiece.color, this.#grabbedPiece.type);
        let flag=false;

        for (let sr = 0; sr < 8; sr++) {
            for (let sc = 0; sc < 8; sc++) {
                for (let dr = 0; dr < 8; dr++) {
                    for (let dc = 0; dc < 8; dc++) {
                        
                    //Changing the source Grabbed Piece   
                    this.#grabbedPiece = new ChessPiece(this.#Array2DOfChess[sr][sc].piece, sr ,sc,this.#Array2DOfChess[sr][sc].color,this.#Array2DOfChess[sr][sc].type);

                    //Checking by sending each piece to the each legal move box on the borad
                    //Even if there is a single move for any single piece available it will flag true 
                    if(this.#Array2DOfChess[sr][sc].color==this.#turnArr[this.#turn] && this.#legalMove(dr, dc) && this.#grabbedPiece.color != this.#Array2DOfChess[dr][dc].color && !this.#selfCheck(new Cordiante (dr, dc)) )
                    {
                         //Setting The Grabbed  Piece back to normal Position
                        this.#grabbedPiece.piece=tempGrabPiece.piece,
                        this.#grabbedPiece.position=tempGrabPiece.position,
                        this.#grabbedPiece.color=tempGrabPiece.color, 
                        this.#grabbedPiece.type=tempGrabPiece.type;
                        return true;
                    }

                       
                    }
                    
                }
                
            }
            
        }

        
       
        //Setting The Grabbed  Piece back to normal Position
        this.#grabbedPiece.piece=tempGrabPiece.piece,
        this.#grabbedPiece.position=tempGrabPiece.position,
        this.#grabbedPiece.color=tempGrabPiece.color, 
        this.#grabbedPiece.type=tempGrabPiece.type;
       
        return false;
    }

    //Just to check if the king is danger and put a red box on it
    #kingIsInDanger=()=>
    {
        if(this.#checkBy())
        {
            let kingPos= this.#findKing();
            this.#Array2DOfChess[kingPos.r][kingPos.c].piece.classList.add("redBox");
            this.#oldKing=kingPos;
        }

        else if(this.#oldKing.r!=-1 && this.#oldKing.c!=-1)
        {
           
            this.#Array2DOfChess[this.#oldKing.r][this.#oldKing.c].piece.classList.remove("redBox");
            this.#oldKing.c=this.#oldKing.r=-1;
        }
    }

    //Checking castling 
    #isCastling=(pos)=>
    {
        //Column Difference for checking left and right
        let col=this.#grabbedPiece.position.c-pos.c;
        let tempPosRight= new Cordiante(pos.r,pos.c-1);
        let tempPosleft= new Cordiante(pos.r,pos.c+1);
       
       
        //For blacks
        if(this.#turnArr[this.#turn]=='Black' && this.#grabbedPiece.type=="King")
        {
            if(!this.#iskingMoved[1])
            {
              
                //Moving right
                //Horizontal Clear takes the position of the Rooks
                if(col==-2 && !this.#selfCheck(tempPosRight) && this.#isHorizontalClear(new Cordiante(0,7)) )
                {
                 
                  if(!this.#isRookedMoved[1][1])
                  {
                    return true;
                  }
                }
                //Moving left
                //Horizontal Clear takes the position of the Rooks
               else if(col==2 && !this.#selfCheck(tempPosleft) && this.#isHorizontalClear(new Cordiante(0,0)))
                {
              
                  if(!this.#isRookedMoved[1][0])
                  {
                    return true;
                  }
                }
            }
        }

        //For white
        
        else if(this.#grabbedPiece.type=="King")
        {
            if(this.#isHorizontalClear(pos) && !this.#iskingMoved[0] )
            {
                //Moving right
                //Horizontal Clear takes the position of the Rooks
                if(col==-2 && !this.#selfCheck(tempPosRight) && this.#isHorizontalClear(new Cordiante(7,7)))
                {
                  if(!this.#isRookedMoved[0][1])
                  {
                    return true;
                  }
                }

                //Moving left
                //Horizontal Clear takes the position of the Rooks
               else if(col==2 && !this.#selfCheck(tempPosleft) && this.#isHorizontalClear(new Cordiante(7,0)))
                {
                  
                  if(!this.#isRookedMoved[0][0])
                  {
                    return true;
                  }
                }
            }
        }

     
        return false;
    }

    //Implementing castling
    #castling=(pos)=>
    {
         //Column Difference for checking left and right
         let col=this.#grabbedPiece.position.c-pos.c;
         let tempPosRight= new Cordiante(pos.r,pos.c-1);
         let tempPosleft= new Cordiante(pos.r,pos.c+1);
 
         //For blacks
         if(this.#turnArr[this.#turn]=='Black'  && this.#grabbedPiece.type=="King")
         {
           
             if(!this.#iskingMoved[1])
             {
                 //Moving right
                 //Horizontal Clear takes the position of the Rooks
                 if(col==-2 && !this.#selfCheck(tempPosRight) && this.#isHorizontalClear(new Cordiante(0,7)))
                 {
                   if(!this.#isRookedMoved[1][1])
                   {
                    this.#swap(0,7,0,5);
                   }
                 }

                //Moving left
                //Horizontal Clear takes the position of the Rooks
                else if(col==2 & !this.#selfCheck(tempPosleft) && this.#isHorizontalClear(new Cordiante(0,0)))
                 {
                   if(!this.#isRookedMoved[1][0])
                   {
                    this.#swap(0,0,0,3);
                   }
                 }
             }
         }
 
         //For white
         else if(this.#grabbedPiece.type=="King")
         {
             if(!this.#iskingMoved[0])
             {
                 //Moving right
                 //Horizontal Clear takes the position of the Rooks
                 if(col==-2 && !this.#selfCheck(tempPosRight)&& this.#isHorizontalClear(new Cordiante(7,7)))
                 {
                   if(!this.#isRookedMoved[0][1])
                   {
                    this.#swap(7,7,7,5);
                   }
                 }

                 //Moving left
                 //Horizontal Clear takes the position of the Rooks
                else if(col==2 && !this.#selfCheck(tempPosleft)&& this.#isHorizontalClear(new Cordiante(7,0)))
                 {
                   if(!this.#isRookedMoved[0][0])
                   {
                    this.#swap(7,0,7,3);
                   }
                 }
             }
         }
    }

    //this is just a utility function to perform swapping in castling function 
    //To move rook and king 
    #swap=(sr,sc,dr,dc)=>
    {
        //Swapping the inner HTML
        let tempEle=this.#Array2DOfChess[sr][sc].piece.innerHTML;
        this.#Array2DOfChess[sr][sc].piece.innerHTML=this.#Array2DOfChess[dr][dc].piece.innerHTML;
        this.#Array2DOfChess[dr][dc].piece.innerHTML=tempEle;

        this.#Array2DOfChess[sr][sc].piece.dataset.color="none";
        this.#Array2DOfChess[sr][sc].piece.dataset.piece="none";
        this.#Array2DOfChess[dr][dc].piece.dataset.color=this.#turnArr[this.#turn];
        this.#Array2DOfChess[dr][dc].piece.dataset.piece="Rook";

        //Swapping the whole Element
        let anotherTemp=this.#Array2DOfChess[sr][sc];
        this.#Array2DOfChess[sr][sc]=this.#Array2DOfChess[dr][dc];
        this.#Array2DOfChess[dr][dc]=anotherTemp;

    }

    reset=()=>
    {
        document.querySelector(".chessBoard").innerHTML=this.#originalBoard;
        this.#boxes = document.querySelectorAll(".chessBoxes");
        this.#Array2DOfChess=[];
        this.FillTheBoard();
        this.#isPieceGrabbed=false;
        this.grabThePiece();
        this.#turn=0;
        this.#oldKing= new Cordiante(-1,-1);
        this.#iskingMoved= [false,false];
        this.#isRookedMoved= [[false,false],[false,false]];
        this.#originalBoard=document.querySelector(".chessBoard").innerHTML;

    }
}

// Chess Piece constructor
function ChessPiece(piece,x,y,color,Type)
{
    this.piece=piece;
    this.position = new Cordiante(x,y);
    this.color=color;
    this.type=Type;
}


//Coordinate X and Y Constructor
function Cordiante(y,x)
{
    this.r=y;
    this.c=x;
}

export {ChessBoard};