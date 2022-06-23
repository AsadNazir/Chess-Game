
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
                            this.#grabbedPiece = new ChessPiece(this.#Array2DOfChess[i][j], i ,j,this.#Array2DOfChess[i][j].dataset.color,this.#Array2DOfChess[i][j].dataset.Piece); 

                            for (let k = 0; k < 8; k++) {
                            for (let l = 0; l < 8; l++) {
                            
                             if(k==i && l==j) continue;
                            this.#Array2DOfChess[k][l].classList.remove("selectedChessPiece");
                            }
                        
                        }

                        //Adding Class of selected Chess Piece so it is shown
                        this.#grabbedPiece.piece.classList.add("selectedChessPiece");
                        this.#isPieceGrabbed=true;

                        //Remove
                        // console.log(1);
                        // console.log(this.#Array2DOfChess[i][j].dataset.color);

                        //Changing the Data-sets For Emptying the cell;
                        this.#Array2DOfChess[i][j].dataset.color ='none';
                        this.#Array2DOfChess[i][j].dataset.Piece ='none';

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
                        this.#Array2DOfChess[i][j].dataset.Piece = this.#grabbedPiece.type;

                        //Emptying the Grabbed Piece Temporary Object
                        this.#grabbedPiece = new ChessPiece(null,-1,-1);

                    }

                    // IF player Moves the piece
                    else
                    {
                        if(this.#grabbedPiece.color != this.#Array2DOfChess[i][j].dataset.color)
                        {
                        
                        //This is Just for Testing the Utiltity Functions
                        let pos= new Cordiante(i,j);
                        this.#isPieceGrabbed=false;
                        console.log(this.#isDiogonalClear(pos));
                        //-------------------------------------

                       // Processing over here
                        this.#Array2DOfChess[i][j].innerHTML=this.#grabbedPiece.piece.innerHTML;
                        this.#grabbedPiece.piece.innerHTML="";
                        
                        //Unselecting the Grabbed Piece
                        this.#grabbedPiece.piece.classList.toggle("selectedChessPiece");

                        //Setting the data Sets of the Destination Place
                        this.#Array2DOfChess[i][j].dataset.color = this.#grabbedPiece.color;
                        this.#Array2DOfChess[i][j].dataset.Piece = this.#grabbedPiece.type;


                        //Emptying the Temporary Grabbed Piece
                        this.#grabbedPiece = new ChessPiece(null,-1,-1, 'none', 'none');
                        this.#turn++;
                        if(this.#turn>=2) this.#turn= this.#turn %2;
                        
                        }
                }
                }
                )

            }
            
        }
    }


    //Utitility Functions


    
    
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
        return (Math.abs(this.#grabbedPiece.position.c-pos.c) == Math.abs(this.#grabbedPiece.position.c-pos.c) );
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


}


//Chess Piece Constructor
function ChessPiece(piece,x,y,color,type)
{
    this.piece=piece;
    this.position = new Cordiante(x,y);
    this.color=color;
    this.type=type;
}

//Coordinate X and Y Constructor
function Cordiante(y,x)
{
    this.r=y;
    this.c=x;

}

//Starting the new Game 
newGame = new ChessBoard();