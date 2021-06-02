import AddZoom from "./addZoom.js";
import CreateNewDiv from "./CreateNewDiv.js";
import ExportJson from "./exportJson.js"
import {Character, Relationship} from "./class.js"

const generatorVersion = 0.1
document.getElementById("generatorVersion").innerHTML = `Version : ${generatorVersion}`

let parentDiv = document.querySelector(".characterList")
let allCharacterHTML = []
AddZoom(document.querySelector("#panzoom"));

class CharacterHTML {
    constructor(character){
        this.character = character
        this.div
        this.relationship = []
    }

    static  FindCharacterHTMLByDiv = (div) =>{
        let found = null
        allCharacterHTML.forEach(characterHTML => {
            if (characterHTML.div == div) {
                found = characterHTML
            }
        });
        return found
    }  
}


const GetAllCharacterHTML = () =>{
    allCharacterHTML = []
    for (const character of currentCharacterSet.Characters) {
        let newCharHTML = new CharacterHTML(character)
        for (const relationship of currentCharacterSet.Relationships) {
            if(relationship.me == character.id){
                newCharHTML.relationship.push(relationship)
            }
        }
        allCharacterHTML.push(newCharHTML)
    }
}

const EmptyCharacterSet = () =>{
    let emptyCharacterSet = {
        version:generatorVersion,
        Characters:[],
        Relationships:[]
    }

    return emptyCharacterSet
}

const LoadFromFile = () =>{
    let charSet
    var file = document.getElementById("jsonFile").files[0];
    if (file) {
        var reader = new FileReader();
        reader.readAsText(file, "UTF-8");
        reader.onload = function (evt) {
            console.log(evt.target.result)
            charSet = JSON.parse(evt.target.result)
            if(charSet.version == generatorVersion){
                Refresh(charSet)
            }
            document.getElementById("jsonFile").value = null
        }
        reader.onerror = function (evt) {
            console.log("error reading file");
        }
    }
} 


const GenerateCharacterSet = (allCharacterHTML) =>{
    parentDiv.remove();
    parentDiv = CreateNewDiv("", document.querySelector("#panzoom"), null, "characterList", true);
    for (const characterHTML of allCharacterHTML) {
        characterHTML.div = CreateNewDiv(GenerateCharacterHtml(characterHTML, allCharacterHTML), parentDiv, null, "characterSheet box shadow", true)
    }

}

const GenerateCharacterHtml = (characterHTML) =>{
    let html = `<button class="deleteButton btn btn-danger btn-sm" >Supprimer le personnage</button>`


    html += ` 
        <div>
            Personnage :
        </div>

        <div>
            <label> id :</label>
            <input type="text" class="charID" value="${characterHTML.character.id}"/>
        </div>
        <div>
            <label> nom de l'image de profil : </label>
            <input type="text" class="charPP" value="${characterHTML.character.profilePicture}"/>
        </div>

        <div>
            <label> Prénom : </label>
            <input type="text" class="charFN" value="${characterHTML.character.firstName}"/>
        </div>

        <div>
            <label> Nom de famille : </label>
            <input type="text" class="charLN" value="${characterHTML.character.lastName}"/>
        </div>


        <h2 class="mt-2">
            Relations :
        </h2>`

        for (const relationship of characterHTML.relationship) {
            let them = FindCharacterById(currentCharacterSet, relationship.them)
            html += `

                <div class = "relationship" >
                    <label>${them.firstName} ${them.lastName}</label> <span class = "them">${them.id}</span>
                    <input type="number" class="confidence" value="${relationship.confidenceMeToThem}"/>
                </div>
            
            `
        }


    return html
    
}

const FindCharacterById = (characterSet, id) =>{
    let characterFound

    for (const character of characterSet.Characters) {
        if(character.id == id){
            characterFound = character
        }
    }

    return characterFound

}

const OnIdChange = (idDiv) =>{
    let characterHTML = CharacterHTML.FindCharacterHTMLByDiv(idDiv.parentNode.parentNode)
    let newID = FindFreeID(idDiv.value)
    let oldID = characterHTML.character.id
    for (const character of currentCharacterSet.Characters) {
        if(character.id == oldID){
            character.id = newID 
        }
    }

    for (const relationship of currentCharacterSet.Relationships) {
        if(relationship.me == oldID){
            relationship.me = newID
        }
        if(relationship.them == oldID){
            relationship.them = newID
        }
    }

    Refresh(currentCharacterSet)


}
const FindFreeID = (proposedID)=>{
    let i = 1
    let freeID = proposedID
    let isFree = false
    while ( !isFree ){
        let exist = false
        for (const character of currentCharacterSet.Characters) {
            let id = character.id
            if(id === freeID){
                freeID = proposedID + i
                exist = true
            }

            
        }
        if(!exist){
            isFree = true
        }

        i++
    }
    return freeID


}
const AddNewCharacter = () =>{
    let id = FindFreeID("new")
    let newCharacter = new Character(id, "", `Nouveau/${id}`, "")
    let newRelationshipList = []
    for (const character of currentCharacterSet.Characters) {
        newRelationshipList.push(new Relationship(newCharacter.id, character.id, 0))
        newRelationshipList.push(new Relationship(character.id, newCharacter.id, 0))
    }
    currentCharacterSet.Characters.push(newCharacter)
    currentCharacterSet.Relationships = currentCharacterSet.Relationships.concat(newRelationshipList)
    Refresh(currentCharacterSet)
}

const DeleteCharacter = (charDiv) =>{
    let id = charDiv.querySelector(".charID").value
    console.log(id)

    console.log(currentCharacterSet.Relationships, currentCharacterSet.Relationships.length)
    let relationshipToDelete = []
    for (var i=0; i < currentCharacterSet.Relationships.length; i++) {
        let relationship = currentCharacterSet.Relationships[i]
        console.log(relationship, i)
        if(relationship.me == id || relationship.them == id){
            console.log("found")
            relationshipToDelete.push(relationship)
        }
    }
    
    for (const character of currentCharacterSet.Characters) {
        if(character.id == id){
            console.log(character)
            currentCharacterSet.Characters.splice(currentCharacterSet.Characters.indexOf(character), 1)
        }
    }

    for (const relationship of relationshipToDelete) {
        
        currentCharacterSet.Relationships.splice(currentCharacterSet.Relationships.indexOf(relationship), 1)
    }
    console.log(currentCharacterSet)
    Refresh(currentCharacterSet)
}

const RetrieveCharacterSet = () =>{
    let newCharSet = EmptyCharacterSet();

    let allCharacterSheet = document.querySelectorAll(".characterSheet")

    for (const characterSheet of allCharacterSheet) {
        
        let id = characterSheet.querySelector(".charID").value
        let profilePicture = characterSheet.querySelector(".charPP").value
        let firstName = characterSheet.querySelector(".charFN").value
        let lastName = characterSheet.querySelector(".charLN").value
        
        
        let character = new Character(id, profilePicture, firstName, lastName)
        newCharSet.Characters.push(character)
        let allRelationships = characterSheet.querySelectorAll(".relationship")

        for (const relationship of allRelationships) {
            let me = id;
            let them = relationship.querySelector(".them").innerHTML
            let confidence = relationship.querySelector(".confidence").value

            let newRelationship = new Relationship(me, them, confidence)
            newCharSet.Relationships.push(newRelationship)
        }

    }


    return newCharSet

}

const  ResetCharacters = () =>{
    Refresh(EmptyCharacterSet())
}

const Refresh = (newCharacterSet) =>{
    parentDiv.innerHTML = ""
    currentCharacterSet = newCharacterSet
    localStorage['currentCharacterSet'] = JSON.stringify(currentCharacterSet); 
    GetAllCharacterHTML()
    GenerateCharacterSet(allCharacterHTML)

    ExportJson(currentCharacterSet, "characterSet")
    let characterSheets = document.querySelectorAll(".characterSheet");
    for (const characterSheet of characterSheets) {
        let charID = characterSheet.querySelector(".charID")
        charID.addEventListener('change', function () { OnIdChange(charID) })
        let deleteButton = characterSheet.querySelector(".deleteButton")
        deleteButton.addEventListener('click', function () { DeleteCharacter(characterSheet) })
    }

}

const onUpdate = () =>{
    let newCharSet = RetrieveCharacterSet()
    Refresh(newCharSet)

}
let currentCharacterSet = EmptyCharacterSet()

var cachedCurrentCharacterSet = localStorage['currentCharacterSet'];
if(cachedCurrentCharacterSet != null ){
    cachedCurrentCharacterSet = JSON.parse(cachedCurrentCharacterSet)
    if (cachedCurrentCharacterSet.version == generatorVersion) {
        console.log(cachedCurrentCharacterSet.version,  generatorVersion)
        Refresh(cachedCurrentCharacterSet)
    }
}

Refresh(currentCharacterSet)

document.getElementById("global").addEventListener('change', function () { onUpdate() })
document.getElementById("addCharacter").addEventListener('click', function () { AddNewCharacter() })
document.getElementById("jsonFile").addEventListener("change", function(){LoadFromFile()})
document.getElementById("resetButton").addEventListener('click', function(){ResetCharacters()})
