import {Content, Message, BranchingPoint, Branch, test} from "./class.js"
import {InitConversation} from "./conversation.js"
import {ExportJson} from "./exportJson.js"

class BranchHTML{
    constructor(branch){
        this.branch = branch,
        this.parent= this.GetParent(),
        this.floor = this.GetFloor(),
        this.child = this.GetChild(),
        this.div,
        this.childsDiv
    }

    ShowInfoOnConsole(){
        console.log(this.branch, this.floor,this.child, this.parent, this.div)
    }

    GetChild(){
        let childTemp = []
        this.branch.branchingPoint.possibilities.forEach(poss => {
            childTemp.push(poss.branch)
        });
        return childTemp
    }

    GetParent(){
        let parentTemp = []
        allBranchesHTML.forEach(branch => {
            if(branch.child.includes(this.branch.id)){
                parentTemp.push(branch.branch.id)
            }
        });
        return parentTemp
    }

    static FindBranchById = (id) =>{
        let found = null
        allBranchesHTML.forEach(branch => {
            if(branch.branch.id == id ){
                found = branch
            }
        });
        return found
    }

    static FindBranchHTMLByBranch = (branch) =>{
        let found = null
        allBranchesHTML.forEach(branchHTML => {
            if(branchHTML.branch == branch ){
                found = branchHTML
            }
        });
        return found
    }

    GetFloor(){
        let floorTemp = 0
        if(this.parent.length != 0){
            this.parent.forEach(parentid => {
                let parentbranch = BranchHTML.FindBranchById(parentid)
                if(parentbranch.floor > floorTemp){
                    floorTemp = parentbranch.floor
                }
            });
            floorTemp ++
        }
        return floorTemp
    }
}



let allBranches = test();

let allBranchesHTML = []

const GetAllBranchesHTML = () => {
    allBranchesHTML = []
    allBranches.forEach(element => {
        allBranchesHTML.push(new BranchHTML(element))
    });
}

GetAllBranchesHTML()

const GenerateTree = (branches) =>{

    console.log("GenerateTree")

    let listOfBranch = []

    const CreateChildren = (branches, branch) =>{
        console.log("CreateChildren", branches)
        if(branch != null){
            let parentD = document.getElementById("branches")
                listOfBranch.push(branch.branch.id)
                let finalParentDiv
                let parentBranch = BranchHTML.FindBranchById(branch.parent[0])
                if(branch.parent.length > 1){
                    let i = 0
                    while(parentBranch.div == undefined && i < 4){
                        parentBranch = BranchHTML.FindBranchById(branch.parent[i]) 
                        i ++
                    }
                }
                if(parentBranch != null){
                    switch (parentBranch.branch.branchingPoint.type) {
                        case "choice":
                        case "test":
                            if(parentBranch.childsDiv == undefined){
                                parentBranch.childsDiv = CreateNewDiv("", parentBranch.div.parentNode, null, "floor", true, "flex-direction: column;")
                                finalParentDiv = parentBranch.childsDiv
                                
                            }
                            let div = CreateNewDiv("", parentBranch.childsDiv, null, "floor", true)
                            finalParentDiv = div
                            break;


                        default:
                            finalParentDiv = parentBranch.div.parentNode
                            break;
                    }
                }
                else{
                    finalParentDiv = CreateNewDiv("", parentD, null, "floor", true)
                }

                branch.div = CreateNewDiv(BranchToHtml(branch.branch), finalParentDiv , null, "branch", true)
                //branch.ShowInfoOnConsole()
                branch.branch.branchingPoint.possibilities.forEach(poss => {
                    if(!listOfBranch.includes(poss.branch)){
                        CreateChildren(branches, BranchHTML.FindBranchById(poss.branch))
                    }
                });
        }
    }

    CreateChildren(branches, branches[0])


}

const CreateNewDiv = (content, parent, id, classStyle, getDiv, customStyle) => {
    const div = document.createElement('div');
    if(classStyle != null) {div.className = classStyle}
    if(id != null) {div.id = id}
    if(customStyle != null) {div.style = customStyle}
    div.innerHTML = content
    if(parent != null) {parent.appendChild(div)} else{document.body.appendChild(div)}  
    if(getDiv){ return div}
}

const BranchToHtml = (branch) =>{

    const ShowAMessage = (message) =>{
        html += ` <div class="message"> <h3> Message : </h3> <label> Position du message : </label>`
        html += `
        <select class="sideChoice">
        `
        console.log(message.side)
        if(message.side){
            html += `
                <option value=0 selected="selected"> Gauche </option>
                <option value=1> Droite </option>
            `
        }
        else{
            html += `
                <option value=0> Gauche </option>
                <option value=1 selected="selected"> Droite </option>
            `
        }

        html += `</select> <h4> Contenu : </h4> <label> Type de contenue : </label>`

        html += `
        <select class="contentType">`
        switch (message.content.type) {

            case "text":
                html += `
                    <option value=""> Choissisez un type de message </option>
                    <option value="text" selected="selected"> Text </option>
                    <option value="image"> Image </option>
                `
                break;
        
            case "image":
                html += `
                    <option value=""> Choissisez un type de message </option>
                    <option value="text"> Text </option>
                    <option value="image"  selected="selected"> Image </option>
                `
                break;
        
                    
            default:
                html += `
                    <option value="" selected="selected"> Choissisez un type de message </option>
                    <option value="text"> Text </option>
                    <option value="image"> Image </option>
                `
                break;

                
        }

        html+= `</select>`

        html += `
        <div>
            <label> Contenue : </label>
            <textarea class = "contentData">${message.content.data}</textarea>
        </div>


        <div>
            <label> Heure d'envoie (en seconde) : </label>
            <input type="number" class="sendTime" value = ${message.sendTime}  ></input>
        </div>

        </div>
        `

    }

    let html = `<h2 class="branchName"> Branch : ${branch.id} </h2>`

    branch.messagesList.forEach(message => {

        ShowAMessage(message)

    });

    html += `<div class="branchingPoint"> 
                <label> Embranchement de type :  </label> 
                <select class="bpType">
     `

    switch (branch.branchingPoint.type) {
        case "choice":
            html+= `
            
                <option value="choice" selected="selected"> Choix </option>
                <option value="test"> Test </option>
                <option value="change"> Change </option>
                <option value="stop"> Stop </option>
                </select> 
                `

            html += `<div>
                        <label> Nombre d'options : </label>
                        <input type="number" value=${ Object.keys(branch.branchingPoint.possibilities).length }></input>
                    </div>`
            branch.branchingPoint.possibilities.forEach(poss => {
                
                html += `<div class="branchingPoss"><h3> Option de choix : </h3>
                <label> Branches suivantes: </label>
                <select class="branchIDNext"> 
                `
                
                if(poss.possible){
                allBranches.forEach(branchFromAll => {
                        switch (branchFromAll.id) {
                            case poss.branch:
                                html+=`<option value="${branchFromAll.id}" selected="selected"> ${branchFromAll.id} </option> `
                                break;
                            default:
                                html+=`<option value="${branchFromAll.id}"> ${branchFromAll.id} </option> `
                                break;
                        }
                    });
                }
                else{
                    html+=`<option value="none"> Pas de branche </option>`
                }

                html += `</select>`

                ShowAMessage(poss.message)
                html += `<div> 
                        <label> Choix Possible ? </label> 
                        <input class="possible" type="checkbox" name="Possible ?"
                        `

                if(poss.possible){
                    html += `checked> </div>`
                }
                else{
                    html += `> </div> `
                }

                html += `   
                            <div> 
                                <label> Modification de la variable de confiance </label> 
                                <input class="confidenceMod" type = number value=${poss.confidenceMod}> </input>
                            </div>  
                        `

                html+= "</div>"
            });
            break;
        case "test":
            html+= `
            
            <option value="choice"> Choix </option>
            <option value="test" selected="selected"> Test </option>
            <option value="change"> Change </option>
            <option value="stop"> Stop </option>
            </select> 
            `

            html += `<div>
                        <label> Nombre d'options : </label>
                        <input type="number" value="${Object.keys(branch.branchingPoint.possibilities).length }"/>
                    </div>`

            branch.branchingPoint.possibilities.forEach(poss => {



                html += `<div class="branchingPoss"><h3> Option de Test : </h3>
                <div>
                    <label> Bornes minimal : </label>
                    <input class="thresholdMin" type="number" step="any" value="${poss.thresholds[0]}"/>
                </div>
                <div>
                    <label> Bornes maximal : </label>
                    <input class="thresholdMax" type="number" step="any" value="${poss.thresholds[1]}"/>
                </div>
                <div>
                    <label> Branches suivantes: </label>
                    <select class="branchIDNext"> 
                `
                
                allBranches.forEach(branchFromAll => {
                        switch (branchFromAll.id) {
                            case poss.branch:
                                html+=`<option value="${branchFromAll.id}" selected="selected"> ${branchFromAll.id} </option> `
                                break;
                            default:
                                html+=`<option value="${branchFromAll.id}"> ${branchFromAll.id} </option> `
                                break;
                        }
                    });
                

                html += `</select>`

            });
            break;

        case "change":
            html+= `
            
            <option value="choice"> Choix </option>
            <option value="test"> Test </option>
            <option value="change" selected="selected"> Change </option>
            <option value="stop"> Stop </option>
            </select> 
            `

            html += `<div class="branchingPoss"><h3> Option de choix : </h3>
            <label> Branches suivantes: </label>
            <select class="branchIDNext"> 
            `
            branch.branchingPoint.possibilities.forEach(poss => {
                
                allBranches.forEach(branchFromAll => {
                    switch (branchFromAll.id) {
                        case poss.branch:
                            html+=`<option value="${branchFromAll.id}" selected="selected"> ${branchFromAll.id} </option> `
                            break;
                        default:
                            html+=`<option value="${branchFromAll.id}"> ${branchFromAll.id} </option> `
                            break;
                    }
                });

                html += `</select>`
            })
            break;

        case "stop":
            html+= `
            
            <option value="choice"> Choix </option>
            <option value="test"> Test </option>
            <option value="change"> Change </option>
            <option value="stop"  selected="selected"> Stop </option>
            </select> 
            `
            break;
    }

    html += `</div> </div>`

    return html
}

const RetrieveData = () =>{

    let conversation = InitConversation()

    const convNameInput = document.getElementById("convNameInput");
    let convName = convNameInput.value
    convName = convName.toLowerCase().replace(/\s/g, '');
    const mediumInput = document.getElementById("mediumInput");
    let medium = mediumInput.value
    
    const playerCharacterInput = document.getElementById("playerCharacterInput");
    let playerCharacter = playerCharacterInput.value
    
    const npCharacterInput = document.getElementById("npCharacterInput");
    let npCharacter = npCharacterInput.value
    
    const nextConversationInput = document.getElementById("nextConversationInput");
    let nextConversation = nextConversationInput.value
    nextConversation = nextConversation.toLowerCase().replace(/\s/g, '');
    
    
    const RetrieveMessage = (div) => {
            let messagesList = []
            let messages = div.querySelectorAll(":scope > .message")
            messages.forEach(message => {
                let side = !Boolean(parseInt(message.querySelector(".sideChoice").value))
                console.log(side)
                let content = new Content(message.querySelector(".contentType").value, message.querySelector(".contentData").value)
                let sendTime = parseInt(message.querySelector(".sendTime").value)
                messagesList.push( new Message(side, content, sendTime) )
            });
    
            return messagesList
    }

    let branches = []
    let idList = []
    for (let i = 0; i < allBranchesHTML.length; i++) {
        let conversationName = convName
        let id = conversationName +"-"+ i
        idList.push(id)
    }

    for (let i = 0; i < allBranchesHTML.length; i++) {
        const currentBranch = allBranchesHTML[i];
        let id = idList[i]
        let messagesList = RetrieveMessage(currentBranch.div)
        let branchingPointDiv = currentBranch.div.querySelector(".branchingPoint")
        let branchingType = branchingPointDiv.querySelector(".bpType").value
        let branchingPossibilites = []
        let branchingPoss
        switch (branchingType) {
            case "choice":
                branchingPoss = branchingPointDiv.querySelectorAll(".branchingPoss")
                branchingPoss.forEach(poss => {
                    let indexChildrenBranch = allBranchesHTML.indexOf(BranchHTML.FindBranchById(poss.querySelector(".branchIDNext").value))
                    let id
                    if(indexChildrenBranch> 0){
                        id = idList[indexChildrenBranch]
                    }
                    else{
                        id = "none"
                    }
                    let possible = poss.querySelector(".possible").value
                    let confidenceMod = poss.querySelector(".confidenceMod").value
                    let message = RetrieveMessage(poss)[0]
                    
                    branchingPossibilites.push({branch: id, possible: possible, confidenceMod: confidenceMod, message: message})
                });
                break;
            case "test":
                branchingPoss = branchingPointDiv.querySelectorAll(".branchingPoss")
                branchingPoss.forEach(poss => {
                    let indexChildrenBranch = allBranchesHTML.indexOf(BranchHTML.FindBranchById(poss.querySelector(".branchIDNext").value))
                    let id
                    if(indexChildrenBranch> 0){
                        id = idList[indexChildrenBranch]
                    }
                    else{
                        id = "none"
                    }
                    let thresholdMin = poss.querySelector(".thresholdMin").value
                    let thresholdMax = poss.querySelector(".thresholdMax").value
                    
                    branchingPossibilites.push({branch: id, thresholds: [thresholdMin, thresholdMax]})


                });
                break;
            case "change":
                branchingPoss = branchingPointDiv.querySelectorAll(".branchingPoss")
                branchingPoss.forEach(poss => {
                    let indexChildrenBranch = allBranchesHTML.indexOf(BranchHTML.FindBranchById(poss.querySelector(".branchIDNext").value))

                    let id
                    if(indexChildrenBranch> 0){
                        id = idList[indexChildrenBranch]
                    }
                    else{
                        id = "none"
                    }
                    console.log(allBranchesHTML.length, indexChildrenBranch, id)
                    branchingPossibilites.push({branch: id})
                })



                break;
        }
        let branchingPoint = new BranchingPoint(branchingType, branchingPossibilites)
        let branch = new Branch(id, messagesList, branchingPoint)
        branches.push(branch)
    }


    console.log(branches)

    conversation.Conversation.id = convName
    conversation.Conversation.startingBranch = allBranches[0].id
    conversation.Conversation.medium = medium
    conversation.Conversation.playerCharacter = playerCharacter
    conversation.Conversation.npCharacter = npCharacter 
    conversation.Conversation.nextConversation = nextConversation

    conversation.Branches = branches
    return conversation
}

const UpdateBranch = () => {
    console.log("CHANGE")
    let currentConv = RetrieveData()
    allBranches = currentConv.Branches
    GetAllBranchesHTML()
    console.log(allBranches, allBranchesHTML)
    let branchesDiv = document.getElementById("branches")
    branchesDiv.textContent = '';
    GenerateTree(allBranchesHTML)
    conversation = currentConv
    ExportJson(conversation)
} 

let conversation;
GenerateTree(allBranchesHTML)
UpdateBranch()
console.log(conversation)

document.getElementById("global").addEventListener('change',function() {UpdateBranch()} )

const AddZoom = () =>{
    let branches = document.querySelector('#branches')
    panzoom(branches)
}

AddZoom()

