
//Chess Class
class ChessBoard {

    //Private Data Members
    #boxes;
    #Array2DOfChess;
    #grabbedPiece;
    #isPieceGrabbed;
    #turnArr;
    #turn;

    constructor() {
        this.#boxes = document.querySelectorAll(".chessBoxes");
        this.#Array2DOfChess=[];
        this.FillTheBoard();
        this.#isPieceGrabbed=false;
        this.grabThePiece();
        this.#turnArr=["White", "Black"];
        this.#turn=0;

        this.#selfCheck();
    }

    //Just to fill the board
    FillTheBoard = () => {
        let turn = 0;
        for (let i = 0; i < this.#boxes.length; i++) {

            let id = ['lightBlue', 'darkBlue']
            if (i % 8 == 0) {
                turn++;
            }

            this.#boxes[i].className += " " + id[turn % 2];
            turn++;

        }

        // This is to fill the 2D ARray of Chess
        let tempArr=[];
        for (let i = 0; i < this.#boxes.length; i++) {
            
            if(i%8==0 && i!=0)
            {
                this.#Array2DOfChess.push(tempArr);
                tempArr=[];
            }
            tempArr.push(this.#boxes[i]);

        }
        this.#Array2DOfChess.push(tempArr);

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
            
               this.#Array2DOfChess[i][j].addEventListener("click",()=>
               {

                //If the Piece is not Grabbed then only it will grab it
                   if(this.#isPieceGrabbed==false)
                      {
                        
                        if(this.#Array2DOfChess[i][j].dataset.color !='none' && this.#Array2DOfChess[i][j].dataset.color == this.#turnArr[this.#turn])
                        {
                            this.#grabbedPiece = new ChessPiece(this.#Array2DOfChess[i][j], i ,j,this.#Array2DOfChess[i][j].dataset.color,this.#Array2DOfChess[i][j].dataset.piece); 

                            for (let k = 0; k < 8; k++) {
                            for (let l = 0; l < 8; l++) {
                            
                             if(k==i && l==j) continue;
                            this.#Array2DOfChess[k][l].classList.remove("selectedChessPiece");
                            }
                            
                        }
                        

                        //This is to highlight all legal moves
                        this.#highlighting();

                        //Adding Class of selected Chess Piece so it is shown
                        this.#grabbedPiece.piece.classList.add("selectedChessPiece");
                        this.#isPieceGrabbed=true;

                        //Changing the Data-sets For Emptying the cell;
                        this.#Array2DOfChess[i][j].dataset.color ='none';
                        this.#Array2DOfChess[i][j].dataset.piece ='none';

                    }
                    }

                    //If a player decides to place the piece back
                    else if(this.#grabbedPiece.piece== this.#Array2DOfChess[i][j])
                    {   
                        //Ungrabbing the Piece
                        this.#isPieceGrabbed=false;

                        //Changing the style for piece
                        this.#grabbedPiece.piece.classList.remove("selectedChessPiece");

                        //Setting the data-sets
                        this.#Array2DOfChess[i][j].dataset.color = this.#grabbedPiece.color;
                        this.#Array2DOfChess[i][j].dataset.piece = this.#grabbedPiece.type;

                        //Emptying the Grabbed Piece Temporary Object
                        this.#grabbedPiece = new ChessPiece(null,-1,-1);

                         //Rmoving the Highlighting when player placed The piece back 
                        this.#unhighlight();

                    }

                    // IF player Moves the piece
                    else
                    {
                        if(this.#grabbedPiece.color != this.#Array2DOfChess[i][j].dataset.color)
                        {
                            //destination
                           if(this.#legalMove(i,j))
                           {
                                this.#placePiece(i,j);

                                console.log(this.#checkBy());

                                //Emptying the Temporary Grabbed Piece
                                this.#grabbedPiece = new ChessPiece(null,-1,-1, 'none', 'none');
                                this.#turn++;
                                if(this.#turn>=2) this.#turn= this.#turn %2;
                                let turnHeading= document.querySelector(".heading >span");
                                turnHeading.textContent=this.#turnArr[this.#turn];

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


    //Utitility Functions
    #placePiece =(i,j)=>
    {

        // Processing over here
        this.#Array2DOfChess[i][j].innerHTML=this.#grabbedPiece.piece.innerHTML;
        this.#grabbedPiece.piece.innerHTML="";
        
        //Unselecting the Grabbed Piece
        this.#grabbedPiece.piece.classList.toggle("selectedChessPiece");

        //Setting the data Sets of the Destination Place
        this.#Array2DOfChess[i][j].dataset.color = this.#grabbedPiece.color;
        this.#Array2DOfChess[i][j].dataset.piece = this.#grabbedPiece.type;

        this.#isPieceGrabbed=false;
    }
    
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
            if(this.#Array2DOfChess[pos.r][c].dataset.color != 'none') return false;
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
            if(this.#Array2DOfChess[r][pos.c].dataset.color != 'none') return false;
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
            
                if(this.#Array2DOfChess[row+l][column+l].dataset.color != 'none') return false;
            }
            return true; 
        }
        
        else if(this.#grabbedPiece.position.c>pos.c && this.#grabbedPiece.position.r>pos.r)
        {
        for (let l = 1; l <AbsDiff; l++) {
            
            
            if(this.#Array2DOfChess[row-l][column-l].dataset.color != 'none') return false;
        }
        return true; 
        }

        else if(this.#grabbedPiece.position.c<pos.c && this.#grabbedPiece.position.r>pos.r)
        {
        for (let l = 1; l <AbsDiff; l++) {
            
            if(this.#Array2DOfChess[row-l][column+l].dataset.color != 'none') return false;
        }
        return true; 
        }

        else
        {
        for (let l = 1; l <AbsDiff; l++) {
            
            // console.log(this.#Array2DOfChess[row-l][column+l]);
            if(this.#Array2DOfChess[row+l][column-l].dataset.color != 'none') return false;
        }
        return true; 
        }

        return true; 
    }


    // Moves over here
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
            
            if(this.#grabbedPiece.position.r==6)
            {
                if(this.#grabbedPiece.position.c==pos.c)
                {
                    return((this.#grabbedPiece.position.r-pos.r ==1 ||this.#grabbedPiece.position.r-pos.r ==2))
                }
                else
                {
                    if(Math.abs(this.#grabbedPiece.position.c-pos.c)==1)
                    { 
                        return((this.#grabbedPiece.position.r-pos.r ==1) && this.#Array2DOfChess[pos.r][pos.c].dataset.color=='Black')
                    }

                    return false;
                }
            }
            else
            {
                if(this.#grabbedPiece.position.c==pos.c)
                {
                    return((this.#grabbedPiece.position.r-pos.r ==1));
                }
                else
                {
                    if(Math.abs(this.#grabbedPiece.position.c-pos.c)==1)
                    { 
                        return((this.#grabbedPiece.position.r-pos.r ==1 ) && this.#Array2DOfChess[pos.r][pos.c].dataset.color=='Black')
                    }

                    return false;
                }
            }
        }

        // For Black Ones
        else
        {
            if(this.#grabbedPiece.position.r==1)
            {   if(this.#grabbedPiece.position.c==pos.c)
                {
                    return((this.#grabbedPiece.position.r-pos.r ==-1 ||this.#grabbedPiece.position.r-pos.r ==-2))
                }
                else
                {
                    if(Math.abs(this.#grabbedPiece.position.c-pos.c)==1)
                    { 
                        return((this.#grabbedPiece.position.r-pos.r ==-1) && this.#Array2DOfChess[pos.r][pos.c].dataset.color=='White')
                    }

                    return false;
                }
            }

            else
            {
                if(this.#grabbedPiece.position.c==pos.c)
                {
                    return((this.#grabbedPiece.position.r-pos.r ==-1));
                }
                else
                {
                    if(Math.abs(this.#grabbedPiece.position.c-pos.c)==1)
                    { 
                        return((this.#grabbedPiece.position.r-pos.r ==-1) && this.#Array2DOfChess[pos.r][pos.c].dataset.color=='White')
                    }

                    return false;
                }
            }
        }

    }

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
    #unhighlight=()=>
    {
      let source=  this.#grabbedPiece.position;

      for (let l = 0; l < 8; l++) {
        for (let m = 0; m < 8; m++) {
            
            if( this.#Array2DOfChess[l][m].classList.contains("highlight"))
            {
                this.#Array2DOfChess[l][m].classList.remove("highlight");
            }
            
        }
        
      }
    }
    #highlighting=()=>
    {
      let source=  this.#grabbedPiece.position;

      for (let l = 0; l < 8; l++) {
        for (let m = 0; m < 8; m++) {
            
            if(this.#legalMove(l,m) && this.#Array2DOfChess[l][m].dataset.color != this.#turnArr[this.#turn])
            {
                this.#Array2DOfChess[l][m].classList.add("highlight");
            }
            
        }
        
      }
    }

    #checkBy=()=>
    {
        let pos;

    // finding the king
      for (let l = 0; l < 8; l++) {
        for (let m = 0; m < 8; m++) {
            
            if(this.#Array2DOfChess[l][m].dataset.color != this.#turnArr[this.#turn] && this.#Array2DOfChess[l][m].dataset.piece=="King")
            {
                pos=new Cordiante(l,m);
                break;
            }
            
        }
        
      }

      console.log(this.#Array2DOfChess[pos.r][pos.c]);
      //Checking the King IS checked or not
      for (let l = 0; l < 8; l++) {
        for (let m = 0; m < 8; m++) {
            
            this.#grabbedPiece = new ChessPiece(this.#Array2DOfChess[l][m], l ,m,this.#Array2DOfChess[l][m].dataset.color,this.#Array2DOfChess[l][m].dataset.piece);

            // console.log(this.#grabbedPiece);
            if(this.#Array2DOfChess[l][m].dataset.color==this.#turnArr[this.#turn] && this.#legalMove(pos.r, pos.c))
            {
                
                return true;
            }
            
        }
        
      }

      return false;
    }

    #selfCheck=()=>
    {
        let temp2DArr= new Array(this.#Array2DOfChess);
        console.log(temp2DArr);
    }
}

// Chess Piece
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