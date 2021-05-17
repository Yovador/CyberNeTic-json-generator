import {Content, Message, BranchingPoint, Branche, test} from "./class.js"
import {InitConversation} from "./conversation.js"
import {ExportJson} from "./exportJson.js"
class Floor {
    constructor(id, div, branchNumber){
        this.id=id,
        this.div=div,
        this.branchNumber=branchNumber
    }
}
class BranchHTML{
    constructor(branch){
        this.branch = branch,
        this.parent= this.GetParent(),
        this.floor = this.GetFloor(),
        this.child = this.GetChild()
    }

    ShowInfoOnConsole(){
        console.log(this.branch, this.floor,this.child, this.parent)
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

    FindBranchById = (id) =>{
        let found = null
        allBranchesHTML.forEach(branch => {
            if(branch.branch.id == id ){
                found = branch
            }
        });
        return found
    }

    GetFloor(){
        let floorTemp = 0
        if(this.parent.length != 0){
            this.parent.forEach(parentid => {
                let parentbranch = this.FindBranchById(parentid)
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

let listOfFloor = []

let allBranchesHTML = []

allBranches.forEach(element => {
    allBranchesHTML.push(new BranchHTML(element))
});

const GetFloorByID = (id) =>{
    let goodFloor
    listOfFloor.forEach(floor => {
        if(floor.id == id){
            goodFloor = floor
        }
    });
    return goodFloor
}

const GenerateTree = (branches) =>{

    let listOfBranch = []

    const CreateChildren = (branches, branch) =>{
        if(branch != null){

            let parentD = document.getElementById("branches")
            let currentFloorID = `floor${branch.floor}`
                let floorDiv
                let firstfloor = false
                if(listOfFloor[listOfFloor.length-1] == undefined ) firstfloor = true
                if(GetFloorByID(currentFloorID) == null){
                    floorDiv = CreateNewDiv("", parentD, currentFloorID, "floor", true)
                    if(!firstfloor){
                        GetFloorByID(`floor${branch.floor-1}`).div.appendChild(floorDiv)
                    }
                    listOfFloor.push(new Floor (currentFloorID, floorDiv, 1))
                }
                else{
                    floorDiv = GetFloorByID(currentFloorID).div
                    console.log(currentFloorID, floorDiv)
                    GetFloorByID(currentFloorID).branchNumber += 1
                    console.log(GetFloorByID(`floor${branch.floor - 1}`).branchNumber)
                }
                listOfBranch.push(branch.branch.id)

                CreateNewDiv(BranchToHtml(branch.branch), floorDiv , null, "branch")
                branch.branch.branchingPoint.possibilities.forEach(poss => {
                    if(!listOfBranch.includes(poss.branch)){
                        CreateChildren(branches, branch.FindBranchById(poss.branch))
                    }
                });
        }
    }

    CreateChildren(branches, branches[0])
    console.log(listOfFloor, listOfBranch)


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
        html += `<div>`
        if(message.side){
            html += `
            <select>
                <option value=0 selected="selected"> Gauche </option>
                <option value=1> Droite </option>
            </select>
            `
        }
        else{
            html += `
            <select>
                <option value=0> Gauche </option>
                <option value=1 selected="selected"> Droite </option>
            </select>
            `
        }

        switch (message.content.type) {
            case "text":
                html += `
                <select>
                    <option value=""> Choissisez un type de message </option>
                    <option value="text" selected="selected"> Text </option>
                    <option value="image"> Image </option>
                </select>
                `
                break;
        
            case "image":
                html += `
                <select>
                    <option value=""> Choissisez un type de message </option>
                    <option value="text"> Text </option>
                    <option value="image"  selected="selected"> Image </option>
                </select>
                `
                break;
        
                    
            default:
                html += `
                <select>
                    <option value="" selected="selected"> Choissisez un type de message </option>
                    <option value="text"> Text </option>
                    <option value="image"> Image </option>
                </select>
                `
                break;
        }

        html += `
        <input value="${message.content.data}"></input>
        <div>
        `

    }

    let html = `Branch : ${branch.id}`

    branch.messagesList.forEach(message => {

        ShowAMessage(message)

    });

    html += `Branching Point : ${branch.branchingPoint.type} <div> `
    switch (branch.branchingPoint.type) {
        case "choice":
            html += `<input type="number" value=${Object.keys(branch.branchingPoint.possibilities).length }> </input>`
            branch.branchingPoint.possibilities.forEach(poss => {
                ShowAMessage(poss.message)
                html += `  <input type="checkbox" name="Possible ?"`

                if(poss.possible){
                    html += `checked>`
                }
                else{
                    html += `>`
                }
            });
            break;
        case "test":
            html += `<input type="number" value=${Object.keys(branch.branchingPoint).length }> </input>`
            break;
        default:
            break;
    }

    html += `</div>`

    return html
}

GenerateTree(allBranchesHTML)

let conversation = InitConversation()

ExportJson(conversation)

const AddZoom = () =>{
    let branches = document.querySelector('#branches')
    panzoom(branches)
}

AddZoom()

