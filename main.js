
//Chess Class
class ChessBoard {

    //Private Data Members
    #boxes;
    #Array2DOfChess;
    #grabbedPiece;
    #isPieceGrabbed;
    #turnArr;
    #turn;
    #temp2D


    constructor() {
        this.#boxes = document.querySelectorAll(".chessBoxes");
        this.#Array2DOfChess=[];
        this.FillTheBoard();
        this.#isPieceGrabbed=false;
        this.grabThePiece();
        this.#turnArr=["White", "Black"];
        this.#turn=0;
    
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
    grabThePiece =()=>
    {
        
        //Intializing the Grabbed Piece by garbage
        this.#grabbedPiece= new ChessPiece(null,-1,-1,'none', 'none');

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
                        
                        if(this.#Array2DOfChess[i][j].piece.dataset.color !='none' && this.#Array2DOfChess[i][j].color == this.#turnArr[this.#turn])
                        {
                            this.#grabbedPiece = new ChessPiece(this.#Array2DOfChess[i][j].piece, i ,j,this.#Array2DOfChess[i][j].color,this.#Array2DOfChess[i][j].type); 

                            for (let k = 0; k < 8; k++) {
                            for (let l = 0; l < 8; l++) {
                            
                             if(k==i && l==j) continue;
                            this.#Array2DOfChess[k][l].piece.classList.remove("selectedChessPiece");
                            }
                            
                        }
                        

                        //This is to highlight all legal moves
                        this.#highlighting();

                        //Adding Class of selected Chess Piece so it is shown
                        this.#grabbedPiece.piece.classList.add("selectedChessPiece");
                        this.#isPieceGrabbed=true;

                        

                    }
                    }

                    //If a player decides to place the piece back
                    else if(this.#grabbedPiece.piece== this.#Array2DOfChess[i][j].piece)
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
                    else
                    {
                        if(this.#grabbedPiece.color != this.#Array2DOfChess[i][j].color)
                        {
                          
                            //destination
                            let pos = new Cordiante(i,j);
                           if(this.#legalMove(i,j) && !this.#selfCheck(pos))
                           {
                                
                               //placing the Piece on DOM
                                this.#placePiece(i,j);
                               
                                //Emptying the Temporary Grabbed Piece
                                this.#grabbedPiece = new ChessPiece(null,-1,-1, 'none', 'none');

                                //Changing turns over here
                                this.#turn++;
                                if(this.#turn>=2) this.#turn= this.#turn %2;

                                //Changing turn in header over here
                                let turnHeading= document.querySelector(".heading >span");
                                turnHeading.textContent=this.#turnArr[this.#turn];

                                //Checking for stale mate or check mate
                                if(!this.#isAnyMoveAvailable())
                                {
                                    //Changing turn for Checking checkmate
                                    this.#turn++;
                                    if(this.#turn>=2) this.#turn= this.#turn %2;

                                    if(this.#checkBy())
                                    {
                                        setTimeout(function()
                                        {
                                            alert("Checkmate");
                                        },300)
                                       
                                    }

                                    //Changing turn for Checking Stale Mate
                                    else
                                    {
                                        setTimeout(function()
                                        {
                                            alert("Stale Mate");
                                        },300);
                                    }
                                }
                                
                                

                                //Rmoving the Highlighting when player moved the piece 
                                this.#unhighlight();
                                
                           };
            
                        }
                }
                }
                )

            }
            
        }
    }


    //Placing th piece on the DOM
    #placePiece =(i,j)=>
    {

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
            if(this.#Array2DOfChess[pos.r][c].piece.dataset.color != 'none') return false;
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
            if(this.#Array2DOfChess[r][pos.c].piece.dataset.color != 'none') return false;
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
        return ((Dr==1 || Dr==0) && (Dc==0 || Dc==1));
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
                    return((this.#grabbedPiece.position.r-pos.r ==1 ||this.#grabbedPiece.position.r-pos.r ==2) && this.#Array2DOfChess[pos.r][pos.c].color=="none")
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
                    return((this.#grabbedPiece.position.r-pos.r ==-1 ||this.#grabbedPiece.position.r-pos.r ==-2) && this.#Array2DOfChess[pos.r][pos.c].color=="none")
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
                    flag= true;
                }
                
            }
            
        }
        
       
        //Restoring the previous content of grabbedPiece
        this.#grabbedPiece.piece=tempGrabPiece.piece,
        this.#grabbedPiece.position=tempGrabPiece.position,
        this.#grabbedPiece.color=tempGrabPiece.color, 
        this.#grabbedPiece.type=tempGrabPiece.type;
        
      return flag;
    }

    //Self Check to find if any move of the player puts its king in Check or not and prevent it 
    //Stops the player from taking that move if it puts its king in Check
    #selfCheck=(pos)=>
    {

        console.log("Self Check called");
        //Creating a Temporary Array to hold the Pieces
        this.#temp2D=[];
        

        //Filling temp Array
        let tempArr=[];
        for (let i = 0; i < 8; i++) {
            
          for (let j = 0; j < 8; j++) {
            
            let tempPiece = new ChessPiece(this.#Array2DOfChess[i][j].piece, i ,j,this.#Array2DOfChess[i][j].color,this.#Array2DOfChess[i][j].type);
            tempArr.push(tempPiece);
          }

          this.#temp2D.push(tempArr);

          tempArr=[];
        }

        //Changing the turn before Check By
        this.#turn = (this.#turn+1)%2;
        

        //Placing logically our piece on the destination
        //To see if it puts our King in Check or not
        if(this.#grabbedPiece.color != this.#Array2DOfChess[pos.r][pos.c].color)
        {
            this.#Array2DOfChess[pos.r][pos.c].position=pos;
            this.#Array2DOfChess[pos.r][pos.c].type=this.#grabbedPiece.type;
            this.#Array2DOfChess[pos.r][pos.c].piece=this.#grabbedPiece.piece;
            this.#Array2DOfChess[pos.r][pos.c].color=this.#grabbedPiece.color;
        }

        //Also Emptying the source 
        //So that our piece only exists on place on board
        this.#Array2DOfChess[this.#grabbedPiece.position.r][this.#grabbedPiece.position.c].type="none";
        //this.#Array2DOfChess[this.#grabbedPiece.position.r][this.#grabbedPiece.position.r].piece="none";
        this.#Array2DOfChess[this.#grabbedPiece.position.r][this.#grabbedPiece.position.c].color="none";
        
        //Storing check By results
        let check=this.#checkBy();


        //Changing back turn
        this.#turn = (this.#turn+1)%2;

        this.#Array2DOfChess=[];
        
        //Filling back the original 2D array
        tempArr=[];
        for (let i = 0; i < 8; i++) {
            
            for (let j = 0; j < 8; j++) {
            
            let tempPiece = new ChessPiece(this.#temp2D[i][j].piece, i ,j,this.#temp2D[i][j].color,this.#temp2D[i][j].type);
            tempArr.push(tempPiece);
            }

        this.#Array2DOfChess.push(tempArr);

          tempArr=[];
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
                        flag = true;
                        break;
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
        
       
        return flag;
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

//Starting the new Game  
newGame = new ChessBoard();