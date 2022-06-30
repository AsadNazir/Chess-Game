let gotItBtn= document.querySelector("#Got_it");

gotItBtn.addEventListener("click", modalBoxPopUp);


function modalBoxPopUp()
{
    let modalBox=document.querySelector(".modalBox");
    let mainWebsite=document.querySelector(".mainWebsite");
    
    mainWebsite.style.filter=`blur(0px)`;
    modalBox.style.top=`-1000px`;
}


function modalBoxPopUpText(message, title)
{
    let modalText=document.querySelector(".modalBox>p");
    modalText.innerHTML=`<h1>${title} !</h1> simple Chess Game Following are the few rules
    <p>
        ${message}
    </p>`
}

export {modalBoxPopUp, modalBoxPopUpText ,pawnPromotionPopUp};
