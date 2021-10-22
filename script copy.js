let featureBlock = document.getElementById('feature')
let resultBlock = document.getElementById('result')
let resultTxtBlock = document.getElementById('result-txt')


function toggleResult(textRead){
    // feature.style.display = "none";
    resultBlock.style.display = "block";
    resultTxtBlock.textContent = "";
    window.location='#result' 

}

function toggleResult2(textNode){
    resultTxtBlock.appendChild(textNode);
}
let txtForm = document.forms['text-form']
txtForm.addEventListener('submit',(event)=>{
    event.preventDefault();
    let textRead = event.target['text'].value;
    toggleResult(textRead)
    checkGrammer(textRead);
    txtForm.reset();


})

let fileForm = document.forms['file-form']
fileForm.addEventListener('submit',(event)=>{
    event.preventDefault();

    let inputFile = event.target.file.files[0];
    if(inputFile && inputFile.type==="text/plain"){

        let textRead = '';

        let fReader= new FileReader()
        fReader.readAsText(inputFile);

        fReader.onload = function() {
            textRead=fReader.result;
            toggleResult(textRead)
            checkGrammer(textRead);
        };
        
        fReader.onerror = function() {
            textRead=fReader.error;
            toggleResult(textRead)
          };

    }
    fileForm.reset();

})

function checkGrammer(textRead){
    let token = textRead.split(/\s/)
    token.forEach(word=>{
        if(word){

            checkWordError(word).then((result)=>{
                let errors = result.response.errors[0];
                let span = document.createElement('span');
                span.textContent = word+" ";
                function fnReq(event){
                    showSuggestion(event.target,errors.better,fnReq)
                }
                if(errors){
                    span.className ="error"
                    span.addEventListener('click',fnReq)
                }
                toggleResult2(span)
            })
        }
    })
}
//  FETCH // 
async function checkWordError(word){
    let result = await fetch("https://api.textgears.com/grammar?key=ZRaEbOVSBVDg7b9B&language=en-GB&text="+word).catch(err => {
        console.error(err);
    });
    result = await result.json();
    return result;  
}

function showSuggestion(target,suggestion,fnReq) {
    console.log('Target: ',target);
    target.appendChild(createPopUp(suggestion,fnReq));
}
function createPopUp(arr,fnReq) {
    let PopUpDiv = document.createElement('div')
    PopUpDiv.className='popUp';

    let pops = document.querySelectorAll('.popUp') || [];
    pops.forEach((e)=>{
        e.remove();
    })

    arr.forEach(a=>{
        let newSpan= document.createElement('li');
        newSpan.textContent=" "+a+" ";
        PopUpDiv.appendChild(newSpan);
        newSpan.addEventListener('click',(event)=>{
            event.stopPropagation();
            console.log(event.target);
            let correctText = event.target.textContent;
            let parrentTarget = event.target.parentNode.parentNode;
            parrentTarget.className="";
            parrentTarget.textContent=correctText;
            parrentTarget.removeEventListener('click',fnReq)
            console.log(parrentTarget)
        },0)
    })
    return PopUpDiv;
}