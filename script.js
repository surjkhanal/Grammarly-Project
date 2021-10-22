let featureBlock = document.getElementById('feature')
let resultBlock = document.getElementById('result')
let resultTxtBlock = document.getElementById('result-txt')
let txtForm = document.forms['text-form']
let fileForm = document.forms['file-form']



// Modify DOM
function modifyDOM(){
    resultBlock.style.display = "block";
    resultTxtBlock.textContent = "";
    window.location='#result'; 
}

// Push Result
function pushResult(textNode){
    resultTxtBlock.appendChild(textNode);
}

// Form Submit For Text // 
txtForm.addEventListener('submit',(event)=>{
    event.preventDefault();
    let textRead = event.target['text'].value;
    modifyDOM();
    checkGrammer(textRead);
    txtForm.reset();
})
// Form Submit For File // 
fileForm.addEventListener('submit',(event)=>{
    event.preventDefault();
    let inputFile = event.target.file.files[0];
    if(inputFile && inputFile.type==="text/plain"){
        let textRead = '';
        let fReader= new FileReader()
        fReader.readAsText(inputFile);
        modifyDOM();
        fReader.onload = function() {
            textRead=fReader.result;
            checkGrammer(textRead);
        };
        fReader.onerror = function() {
            textRead=fReader.error;
            pushResult(textRead)
          };
    }
    fileForm.reset();
})

async function checkGrammer(text){
    resultTxtBlock.textContent= "";

    let newLineTokens = text.split(/[\n\r]/g);

    for (let i = 0; i < newLineTokens.length; i++) {
        let newLine = newLineTokens[i];
        if(newLine==''){
            pushResult(document.createTextNode('\n'))
            continue;
        }
        let statementTokens=newLine.split('.');
        // console.log(newLine)
        // console.log(statementTokens)
        for (let i = 0; i < statementTokens.length; i++) {
            const statement = statementTokens[i];
            if(statement){
                let result = await checkWordError(statement);
                console.log(result)
                console.log(result.response.errors)
                if(result.status==false){
                    alert(result.description)
                }
                if(result.response.errors.length){
                    replaceError(statement,result.response.errors)
                }
                else{
                    pushResult(document.createTextNode(statement))
                }

                if(statementTokens.length==1){
                    continue;
                }
                pushResult(document.createTextNode('. '))
            }
        }
    }
    
}

function replaceError(text,errors){
    errList = errors.map(err=>err.bad)
    let words=text.split(' ')
    words.forEach((word,i) => {
        if(word){
            let errorIndex=errList.indexOf(word)
            if (errorIndex!==-1){
                createErrorElement(word,errors[errorIndex]);
            }else{
                pushResult(document.createTextNode(word));
            }
            if(i<words.length-1){
                pushResult(document.createTextNode(' '));
            }
        }
    })
}

function createErrorElement(word,error){
    let suggestion=error.better;
    let errorDescription=error.description;
    console.log(error)

    let span = document.createElement('span');
    span.className ="error";
    span.textContent = word;
    span.title=errorDescription['en'];

    function callabck(event){
        event.target.appendChild(createPopUp(suggestion,callabck));
    }
    span.addEventListener('click',callabck);
    pushResult(span);
}

async function checkWordError(word){
    let result = await fetch("https://api.textgears.com/grammar?key=P65r2OccQmrGNpvB&language=en-GB&text="+word).catch(err => {
        console.error(err);
    });
    result = await result.json();
    return result;  
}


function createPopUp(array,callabck) {
    let pop = document.querySelector('#popUp');
    if(pop){
        pop.remove();
    }

    let PopUpDiv = document.createElement('div')
    PopUpDiv.id='popUp';

    array.forEach(arr=>{
        let newSug= document.createElement('li');
        newSug.textContent=arr;
        PopUpDiv.appendChild(newSug);
        newSug.addEventListener('click',(event)=>{
            event.stopPropagation();
            let correctText = event.target.textContent;
            let parrentTarget = event.target.parentNode.parentNode;
            parrentTarget.className="";
            parrentTarget.textContent=correctText;
            parrentTarget.removeEventListener('click',callabck)
            // checkGrammer(resultTxtBlock.textContent);
        })
    })
    return PopUpDiv;
}
