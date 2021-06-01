import { Content, Message, BranchingPoint, Branch} from "./class.js"
import { InitConversation } from "./conversation.js"
import ExportJson from "./exportJson.js"
import AddZoom from "./addZoom.js"
import CreateNewDiv from "./CreateNewDiv.js"

const generatorVersion = 0.2
document.getElementById("generatorVersion").innerHTML = `Version : ${generatorVersion}`

const defaultMessage = { isNpc: true, content: { type: "text", data: "" }, sendtime: 1 }
const defaultChoicePoss = { branch: "", possible: true, confidenceMod: 0, message: { isNpc: false, content: { type: "text", data: "" }, sendtime: 1 } }
const defaultTestPoss = { branch: "", thresholds: [0, 1] }
const defaultChangePoss = { branch: "" }
class BranchHTML {
    constructor(branch) {
        this.branch = branch,
        this.parent = this.GetParent(),
        this.child = this.GetChild(),
        this.div,
        this.childsDiv
    }

    GetChild() {
        let childTemp = []
        this.branch.branchingPoint.possibilities.forEach(poss => {
            childTemp.push(poss.branch)
        });
        return childTemp
    }

    GetParent() {
        let parentTemp = []
        if (allBranches.indexOf(this.branch) != 0) {
            allBranches.forEach(branch => {
                for (const poss of branch.branchingPoint.possibilities) {
                    if (poss.branch == this.branch.id) {
                        parentTemp.push(branch.id)
                    }
                }
            });
        }
        return parentTemp
    }

    static FindBranchById = (id) => {
        let found = null
        allBranchesHTML.forEach(branchHTML => {
            if (branchHTML.branch.id == id) {
                found = branchHTML
            }
        });
        return found
    }

    static FindBranchHTMLByBranch = (branch) => {
        let found = null
        allBranchesHTML.forEach(branchHTML => {
            if (branchHTML.branch == branch) {
                found = branchHTML
            }
        });
        return found
    }

    static FindBranchByDiv = (div) => {
        let found = null
        allBranchesHTML.forEach(branchHTML => {
            if (branchHTML.div == div) {
                found = branchHTML
            }
        });
        return found
    }


}

const GenerateTree = (branches) => {
    //Nous vidons la div contenant toutes les branches
    let branchesDiv = document.getElementById("branches")
    branchesDiv.innerHTML = '';
    let listOfBranch = []

    const CreateUnusedBranch = () => {
        let unusedBranchDiv = CreateNewDiv("", branchesDiv, "unusedBranch", "floor unused shadow box", true, "flex-direction: column;")

        let html = ""

        html += `<h2> Branches non utilisés <h2>
                <button class="addUnusedBranch btn btn-info btn-sm">Ajouter une branche</button>
                `

        unusedBranchDiv.innerHTML = html

        let button = unusedBranchDiv.querySelector(".addUnusedBranch")

        button.addEventListener('click', function () { CreateNewBranch() })

        return unusedBranchDiv

    }

    //Fonction responsable de créer une branch. 
    //Elle s'appelle elle même pour tout les enfants de la branche actuelle 
    const CreateBranch = (branches, branch) => {
        if (branch != null) {
            //On récupère la div qui sert à contenir toute les branches

            //On ajoute l'id de la branch actuelle dans la liste des branches déja placé pour éviter des doublons
            listOfBranch.push(branch.branch.id)

            //variable contenant la div parent de la branch
            let finalParentDiv
            //récupération de la BranchHTML de la branche précédant la branche actuelle
            let parentBranch = BranchHTML.FindBranchById(branch.parent[0])
            if (branch.parent.length > 1) {
                let i = 0
                //Si la branch à plusieurs branche précédente, alors on cherche celle qui dispose d'une div
                while (parentBranch.div == undefined) {
                    parentBranch = BranchHTML.FindBranchById(branch.parent[i])
                    i++
                }
            }



            if (parentBranch != null) {
                switch (parentBranch.branch.branchingPoint.type) {
                    case "choice":
                    case "test":
                        //Si le parent n'a pas de div pour y mettre ses enfants, on en créé une
                        if (parentBranch.childsDiv == undefined) {
                            parentBranch.childsDiv = CreateNewDiv("", parentBranch.div.parentNode, null, "floor", true, "flex-direction: column;")

                        }
                        let div = CreateNewDiv("", parentBranch.childsDiv, null, "floor", true)
                        finalParentDiv = div
                        break;


                    default:
                        finalParentDiv = parentBranch.div.parentNode
                        break;
                }
            }
            //Si la branche n'a pas de branche parente, alors sa div parent sera une nouvelle div directement dans la div contenant toutes les div des branches
            else {
                finalParentDiv = CreateNewDiv("", branchesDiv, null, "floor", true)
            }

            //On créé et attribue la div de la branch
            //BranchToHtml génère le html
            console.log(BranchToHtml(branch.branch))
            branch.div = CreateNewDiv(BranchToHtml(branch.branch), finalParentDiv, null, "branch box shadow", true)


            //Pour chaque branche enfant de la branche actuelle, on relance la fonction pour créé une nouvelle branche
            branch.branch.branchingPoint.possibilities.forEach(poss => {
                if (!listOfBranch.includes(poss.branch)) {
                    CreateBranch(branches, BranchHTML.FindBranchById(poss.branch))
                }
            });
        }
    }

    //On commence par la première branche de la liste
    CreateBranch(branches, branches[0])


    let unusedBranchDiv = CreateUnusedBranch()

    branches.forEach(branch => {
        if (!listOfBranch.includes(branch.branch.id)) {

            console.log(unusedBranchDiv)

            let parentHTML = `<button class="removeBranch btn btn-danger btn-sm">Supprimer la branche</button>`

            let parentDiv = CreateNewDiv(parentHTML, unusedBranchDiv, null, null, true)

            let button = parentDiv.querySelector(".removeBranch")
            button.addEventListener('click', function () { DeleteUnusedBranch(parentDiv) })


            branch.div = CreateNewDiv(BranchToHtml(branch.branch), parentDiv, null, "branch box shadow", true)

            parentDiv.appendChild(branch.div)
        }
    });

}



//Génère un string contenant le html d'un message
const ShowAMessage = (message, remove) => {
    let mustRemove = false
    if (remove != null) {
        mustRemove = remove
    }
    let html = `<div class="message shadow card">`
    if (mustRemove) {
        html += `<button class = "deleteButton btn btn-danger btn-sm">Supprimer le message</button>`
    }
    html += `<h3> Message : </h3> <label> Propriétaire du message : </label>`
    html += `
    <select class="isNpcChoice">
    `

    console.log(message)

    if (message.isNpc) {
        html += `
            <option value=0 selected="selected"> Personnage non joueur </option>
            <option value=1> Personnage Joueur </option>
        `
    }
    else {
        html += `
            <option value=0> Personnage non joueur </option>
            <option value=1 selected="selected"> Personnage Joueur </option>
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

    html += `</select>`

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

    return html
}

//Ces 3 fonctions génère un string contenant le html de leur type de branching spécifique (possiblement refactorisable)
const ShowOptionChoice = (poss) => {
    let html = ""

    html += `<div class="branchingPoss shadow card PadCard">`

    html += `<button class="deletePoss btn btn-danger btn-sm">Supprimer le choix</button>`

    html += `    <h3> Option de choix : </h3>
    <label> Branches suivantes: </label>
    <select class="branchIDNext"> `



    if (poss.possible) {
        allBranches.forEach(branchFromAll => {
            if(allBranches.indexOf(branchFromAll) !=0){
                switch (branchFromAll.id) {
                    case poss.branch:
                        html += `<option value="${branchFromAll.id}" selected="selected"> ${branchFromAll.id} </option> `
                        break;
                    default:
                        html += `<option value="${branchFromAll.id}"> ${branchFromAll.id} </option> `
                        break;
                }
            }
            });

    }
    else {
        html += `<option value="none"> Pas de branche </option>`
    }

    html += `</select>`

    html += ShowAMessage(poss.message)
    html += `<div> 
            <label> Choix Possible ? </label> 
            <input class="possible" type="checkbox" name="Possible ?"
            `

    if (poss.possible) {
        html += `checked> </div>`
    }
    else {
        html += `> </div> `
    }

    html += `   
                <div> 
                    <label> Modification de la variable de confiance </label> 
                    <input class="confidenceMod" type = number value=${poss.confidenceMod}> </input>
                </div>  
            `

    html += "</div>"

    return html
}
const ShowOptionTest = (poss) => {
    let html = ""
    html += `<div class="branchingPoss shadow card PadCard">`
    html += `<button class="deletePoss btn btn-danger btn-sm">Supprimer le choix</button>`
    html += `<h3> Option de Test : </h3>
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
        if(allBranches.indexOf(branchFromAll) !=0){        
            switch (branchFromAll.id) {
                case poss.branch:
                    html += `<option value="${branchFromAll.id}" selected="selected"> ${branchFromAll.id} </option> `
                    break;
                default:
                    html += `<option value="${branchFromAll.id}"> ${branchFromAll.id} </option> `
                    break;
            }
        }
        });



    html += `</select>`
    html += "</div>"
    html += "</div>"


    return html

}
const ShowOptionChange = (poss) => {
    let html = ""
    html += `<div class="branchingPoss shadow card PadCard"><h3> Option de choix : </h3>
        <label> Branches suivantes: </label>
        <select class="branchIDNext"> 
        `
    allBranches.forEach(branchFromAll => {
        if(allBranches.indexOf(branchFromAll) !=0){

            switch (branchFromAll.id) {
                case poss.branch:
                    html += `<option value="${branchFromAll.id}" selected="selected"> ${branchFromAll.id} </option> `
                    break;
                default:
                    html += `<option value="${branchFromAll.id}"> ${branchFromAll.id} </option> `
                    break;
            }
        }
    });

    html += `</select>`
    return html
}

//Génère un string contenant le html d'un branchingPoint
const ShowBranchingPoint = (branch) => {
    let html = ""

    html += `<div class="branchingPoint PadCard"> 
        <label> Embranchement de type :  </label> 
        <select class="bpType">
    `

    switch (branch.branchingPoint.type) {
        case "choice":
            html += `
                    <option value="choice" selected="selected"> Choix </option>
                    <option value="test"> Test </option>
                    <option value="change"> Change </option>
                    <option value="stop"> Stop </option>
                    </select> 
                    `

            branch.branchingPoint.possibilities.forEach(poss => {
                html += ShowOptionChoice(poss)

            });
            break;
        case "test":
            html += `
                    <option value="choice"> Choix </option>
                    <option value="test" selected="selected"> Test </option>
                    <option value="change"> Change </option>
                    <option value="stop"> Stop </option>
                    </select> 
                    `


            branch.branchingPoint.possibilities.forEach(poss => {
                html += ShowOptionTest(poss)

            });
            break;
        case "change":
            html += `
                    <option value="choice"> Choix </option>
                    <option value="test"> Test </option>
                    <option value="change" selected="selected"> Change </option>
                    <option value="stop"> Stop </option>
                    </select> 
                    `


            branch.branchingPoint.possibilities.forEach(poss => {

                html += ShowOptionChange(poss)
            })
            break;
        case "stop":
            html += `

                <option value="choice"> Choix </option>
                <option value="test"> Test </option>
                <option value="change"> Change </option>
                <option value="stop"  selected="selected"> Stop </option>
                </select> 
                `
            break;
    }

    if (branch.branchingPoint.type == "choice" || branch.branchingPoint.type == "test") {
        html += `<button class="addPossibilities btn btn-info btn-sm"> Ajouter une autre options </button>`
    }

    html += `</div>`
    html += `</div>`

    return html
}

//Fonction générant un string contenant le HTML d'une branche
const BranchToHtml = (branch) => {


    let html = `<h2 class="branchName"> Branch : ${branch.id} </h2>`

    //Bouton d'ajout de message
    html += `<button class="addMessage btn btn-info btn-sm"> Ajouter un message ici </button>`

    //Pour chaque message dans la branche, on affiche un message
    branch.messagesList.forEach(message => {
        html += ShowAMessage(message, true)

        //Bouton d'ajout de message
        html += `<button class="addMessage btn btn-info btn-sm"> Ajouter un message ici </button>`

    });

    //Génération du Branching point
    html += ShowBranchingPoint(branch)



    return html
}

//Fonction récupérant les données depuis le HTML
const RetrieveData = () => {
    //Création d'un nouvelle élément conversation

    let conversation = InitConversation(generatorVersion)

    //Récupération des informations de la conversation, son id, son medium, 
    //le personnage joueur et non joueur, et la conversation suivante

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

    //Fonction retournant un array de message à partir d'une div donnée

    const RetrieveMessage = (div) => {
        let messagesList = []
        let messages = div.querySelectorAll(":scope > .message")
        messages.forEach(message => {
            let isNpc = !Boolean(parseInt(message.querySelector(".isNpcChoice").value))
            let content = new Content(message.querySelector(".contentType").value, message.querySelector(".contentData").value)
            let sendTime = parseInt(message.querySelector(".sendTime").value)
            messagesList.push(new Message(isNpc, content, sendTime))
        });

        return messagesList
    }

    let branches = [] //Liste contenant toutes les branches de l'arbre
    let idList = []

    //On génére une liste d'id à attribuer au branches

    for (let i = 0; i < allBranchesHTML.length; i++) {
        let conversationName = convName
        let id = conversationName + "-" + i
        idList.push(id)
    }

    const GetNextBranchID = (poss) => {

        //On cherche l'index dans la liste des BranchHTML de la valeur détenue dans .branchIDNext, c'est à dire, la branche vers laquelle renvoie cette possibilité
        let indexChildrenBranch = allBranchesHTML.indexOf(BranchHTML.FindBranchById(poss.querySelector(".branchIDNext").value))
        let id = "none"
        if (indexChildrenBranch != null && indexChildrenBranch != undefined) {
            id = idList[indexChildrenBranch]
        }
        if(id == undefined){
            id = ""
        }


        return id
    }

    //On récupère les informations pour chaque branches
    for (let i = 0; i < allBranchesHTML.length; i++) {
        const currentBranch = allBranchesHTML[i];
        let id = idList[i] //Attribution de l'id
        let messagesList = RetrieveMessage(currentBranch.div) //Récupération de la liste de messages
        let branchingPointDiv = currentBranch.div.querySelector(".branchingPoint") //Récupération de la div contennant les éléments du BranchingPoint
        let branchingType = branchingPointDiv.querySelector(".bpType").value //Récupération du type de BranchingPoint
        let branchingPossibilites = [] //Array contenant l'ensembles des branchingPoint.possibilities
        let branchingPossDiv //Array contenant l'ensembles des div des branchingPoint.possibilities

        //Selon le type du BranchingPoint, les possibilites doivent être récupéré de manière différente

        switch (branchingType) {
            //Dans le cas d'un branchingPoint de type "choice", 
            //il nous faut : l'id de la branch suivante, un booléen indiquant si c'est un choix possible au joueur,
            //la valeur par laquelle le choix modifie la variable de confiance, et le message du choix
            case "choice":
                branchingPossDiv = branchingPointDiv.querySelectorAll(".branchingPoss")
                branchingPossDiv.forEach(poss => {

                    //On récupère l'id de la prochaine branche
                    let id = GetNextBranchID(poss)


                    //On récupère le bolléen indiquant si le choix est possible
                    let possible = poss.querySelector(".possible").checked

                    
                    //On récupère le modificateur de confiance
                    let confidenceMod = poss.querySelector(".confidenceMod").value

                    //On récupére le message de la possibilité
                    let message = RetrieveMessage(poss)[0]

                    //On rajoute tout ces éléments dans l'array contenant toute les possibilités du branchingPoint de la branch
                    branchingPossibilites.push({ branch: id, possible: possible, confidenceMod: confidenceMod, message: message })
                });
                break;
            //Dans le cas d'un branchingPoint de type "test", 
            //Il nous faut : l'id de la branch suivante, la valeur maximal et minimal
            //de l'intervalle de validité de la possibilité
            case "test":
                branchingPossDiv = branchingPointDiv.querySelectorAll(".branchingPoss")
                branchingPossDiv.forEach(poss => {
                    let id = GetNextBranchID(poss)
                    let thresholdMin = poss.querySelector(".thresholdMin").value
                    let thresholdMax = poss.querySelector(".thresholdMax").value
                    branchingPossibilites.push({ branch: id, thresholds: [thresholdMin, thresholdMax] })


                });
                break;
            case "change":
                branchingPossDiv = branchingPointDiv.querySelectorAll(".branchingPoss")
                branchingPossDiv.forEach(poss => {
                    let id = GetNextBranchID(poss)
                    branchingPossibilites.push({ branch: id })
                })



                break;
        }

        let branchingPoint = new BranchingPoint(branchingType, branchingPossibilites)
        let branch = new Branch(id, messagesList, branchingPoint)
        branches.push(branch)
    }

    //Nous attribuons toutes les informations que nous venons de récupéré à la variable conversation
    conversation.Parameters.id = convName
    conversation.Parameters.startingBranch = allBranches[0].id
    conversation.Parameters.medium = medium
    conversation.Parameters.playerCharacter = playerCharacter
    conversation.Parameters.npCharacter = npCharacter
    conversation.Parameters.nextConversation = nextConversation

    conversation.Branches = branches

    return conversation
}

//Action des boutons "nouveau message" qui ajoute un message
const AddAMessageToBranch = (buttonDiv) => {
    let parent = buttonDiv.parentNode;
    let tempDiv = document.createElement('div');
    parent.replaceChild(tempDiv, buttonDiv);
    tempDiv.appendChild(buttonDiv);
    tempDiv.innerHTML = ShowAMessage(defaultMessage, true)
    let messageDiv = tempDiv.querySelector(".message")
    parent.replaceChild(messageDiv, tempDiv)
    messageDiv.before(buttonDiv)
    let secondButton = buttonDiv.cloneNode(true)
    messageDiv.after(secondButton)
    UpdateConversation()
}

//Fonction supprimant une div puis met à jour l'arbre
const RemoveADiv = (div) => {
    div.remove()
    UpdateConversation()
}

//Fonction ajoutant une Possibilité à un branching point
const AddNewPoss = (possDiv, num) => {
    let branch = BranchHTML.FindBranchByDiv(possDiv).branch
    let newPossNum = branch.branchingPoint.possibilities.length + num
    ChangeConversation(branch, branch.branchingPoint.type, newPossNum, "add")
}

const RemovePoss = (branchDiv, num, possDiv) => {
    console.log("removeposs", branchDiv, num)
    let branch = BranchHTML.FindBranchByDiv(branchDiv).branch
    console.log("remove", possDiv.querySelector(".branchIDNext"), possDiv)
    let allPoss = Array.from(branchDiv.querySelectorAll(".branchingPoss"))
    console.log(allPoss)
    let possID = allPoss.indexOf(possDiv)
    console.log(possID)
    ChangeConversation(branch, branch.branchingPoint.type, 0, "remove", possID)
}

//Fonction supprimant une branche dans la conversation
const DeleteABranch = (oldBranch) => {
    let isFirst = false

    //On regarde toute les branches, si la branche que l'on cherche à supprimer est la première,
    //on vides l'array contenant toutes les branches de la conversation car toutes les branches sont forcement des enfants de la première
    for (const branch of conversation.Branches) {
        if (branch.id == oldBranch.id && conversation.Branches.indexOf(branch) == 0) {
            conversation.Branches = []
            isFirst = true
            break;
        }
    }

    if (!isFirst) {
        //On cherche la branche actuelle
        conversation.Branches.forEach(branch => {
            if (branch.id == oldBranch.id) {
                //Si la branche que l'on cherche à supprimé n'est pas de type change
                if (branch.branchingPoint.type != "change") {
                    //On cherche ensuite parmis toutes les branches les branches enfants de la branches que l'on cherche à supprimé
                    //Et on l'a supprime en rappelant cette fonction
                    branch.branchingPoint.possibilities.forEach(poss => {
                        conversation.Branches.forEach(branch2 => {
                            if (branch2.id == poss.branch) {
                                DeleteABranch(branch2)
                            }
                        });
                    });
                }
                //On enlève de la liste des branches la branche actuelle
                conversation.Branches.splice(conversation.Branches.indexOf(branch), 1)
            }
        });
    }

    Refresh(conversation)

}

const CreateNewBranch = () => {
    console.log("click")
    let allID = []
    for (const branch of allBranches) {
        allID.push(branch.id)
    }
    let id = GetNewBranchID(allID)
    let messagesList = []
    let branchingPoint = new BranchingPoint("stop", [])
    conversation.Branches.push(new Branch(id, messagesList, branchingPoint))
    Refresh(conversation)
}

const DeleteUnusedBranch = (pDiv) => {
    let branchIndex = BranchHTML.FindBranchByDiv(pDiv.querySelector(".branch")).branch
    DeleteABranch(branchIndex)

}

const GetNewBranchID = (allID) => {
    let id
    let differentID = false
    let j = 0
    while (!differentID) {
        id = conversation.Parameters.id + "-" + j
        if (!allID.includes(id)) {
            differentID = true
        }
        j++
    }
    return id
}

const ChangeConversation = (oldBranch, branchingType, possNumber, replace, possID) => {

    const CreateNewPoss = (num, poss) => {
        let newPoss = []
        let allID = []
        for (const branch of allBranches) {
            allID.push(branch.id)
        }
        for (let i = 0; i < num; i++) {
            let possX = {}
            Object.assign(possX, poss)

            possX.branch = GetNewBranchID(allID)
            allID.push(possX.branch)
            newPoss.push(possX)
        }
        console.log("poss", newPoss)
        return newPoss
    }

    const OverridePreviousBranch = () => {
        switch (branchingType) {
            case "choice":
                //On crée X possibilités vide et on s'assure que les id soit unique. 
                //Les id seront régénéré lors de la prochaine Update

                CreateNewPoss(possNumber, defaultChoicePoss).forEach(poss => {
                    newCurrentBranch.branchingPoint.possibilities.push(poss)
                });

                break;

            case "test":
                //On crée X possibilités vide et on s'assure que les id soit unique. 
                //Les id seront régénéré lors de la prochaine Update

                CreateNewPoss(possNumber, defaultTestPoss).forEach(poss => {
                    newCurrentBranch.branchingPoint.possibilities.push(poss)
                });

                break;

            case "change":
                //Le type change n'a besoin que d'une seul possibilités
                CreateNewPoss(1, defaultChangePoss).forEach(poss => {
                    newCurrentBranch.branchingPoint.possibilities.push(poss)
                });
                break;

        }

        //Pour chaque possibilité, on créé une nouvelle branche vide, que l'on rajoute à newChildBranch
        //Et ceux seulement si le type est différent de change
        if (branchingType != "change") {
            newCurrentBranch.branchingPoint.possibilities.forEach(poss => {
                newChildBranch.push(new Branch(poss.branch, [], new BranchingPoint("stop", [])))
            });
        }
    }

    const AddNewPoss = () => {
        console.log(conversation)
        newCurrentBranch.branchingPoint.possibilities = oldBranch.branchingPoint.possibilities
        switch (branchingType) {
            case "choice":
                //On crée X possibilités vide et on s'assure que les id soit unique. 
                //Les id seront régénéré lors de la prochaine Update

                CreateNewPoss(1, defaultChoicePoss).forEach(poss => {
                    newCurrentBranch.branchingPoint.possibilities.push(poss)
                });

                break;

            case "test":
                //On crée X possibilités vide et on s'assure que les id soit unique. 
                //Les id seront régénéré lors de la prochaine Update

                CreateNewPoss(1, defaultTestPoss).forEach(poss => {
                    newCurrentBranch.branchingPoint.possibilities.push(poss)
                });

                break;
        }

        //Si la possibilités existe déjà, on l'ajoute directement à la nouvelle branch, sinon on en créé une nouvelle

        const AddToNewChild = (parentBranch) => {
            parentBranch.branchingPoint.possibilities.forEach(poss => {
                if(poss.branch != ""){
                    let allID = []
                    for (const branch of allBranches) {
                        allID.push(branch.id)
                    }
                    if (allID.includes(poss.branch)) {
                        for (const branch of allBranches) {
                            if (poss.branch == branch.id && !newChildBranch.includes(branch)) {
                                newChildBranch.push(branch)
                                console.log(newChildBranch)
                                AddToNewChild(branch)
    
                            }
                        }
                    }
                    else {
                        newChildBranch.push(new Branch(poss.branch, [], new BranchingPoint("stop", [])))
                    }
                }

            });
        }

        AddToNewChild(newCurrentBranch)


    }

    const RemovePoss = () => {
        newCurrentBranch.branchingPoint.possibilities = oldBranch.branchingPoint.possibilities
        console.log(possID)

        newCurrentBranch.branchingPoint.possibilities.splice(possID, 1)

        const AddToNewChild = (parentBranch) => {
            for (const poss of parentBranch.branchingPoint.possibilities) {
                if(poss.branch != ""){
                    for (const branch of allBranches) {
                        if (poss.branch == branch.id && !newChildBranch.includes(branch)) {
                            newChildBranch.push(branch)
                            AddToNewChild(branch)
                        }
                    }
                }

            }
        }
        AddToNewChild(newCurrentBranch)
    }

    //Création d'une nouvelle branch similaire à l'ancienne mets ou le branchingPoint est changé et les possibilités vide
    let newCurrentBranch = new Branch(oldBranch.id, oldBranch.messagesList, new BranchingPoint(branchingType, []))
    let newChildBranch = []


    if (replace == "override" || replace == null) {
        OverridePreviousBranch()
    }
    else if (replace == "add") {
        AddNewPoss()
    }
    else if (replace == "remove") {
        RemovePoss()
    }




    //Fonction supprimant une branche dans une conversation
    if (conversation.Branches.includes(oldBranch)) {
        DeleteABranch(oldBranch)
    }

    //On rajoute la branche modifié ainsi que les nouvelles branches enfin à la conversation
    conversation.Branches.push(newCurrentBranch)
    newChildBranch.forEach(cBranch => {
        if (!conversation.Branches.includes(cBranch)) {
            conversation.Branches.push(cBranch)
        }
    });
    Refresh(conversation)
}

//Fonction changeant la structure de la branch actuelle
const ChangeBranching = (branchingDiv) => {
    //On récupère le branchHTML de la branche que l'on va modifier
    let oldBranch = BranchHTML.FindBranchByDiv(branchingDiv.parentNode).branch
    //On récupère le type actuellement affiché sur le HTML
    let branchingType = branchingDiv.querySelector(".bpType").value



    //Si le type de la branch à était changé alors on effectue les changements dans la conversation
    if (branchingType != oldBranch.branchingPoint.type) {

        ChangeConversation(oldBranch, branchingType, 2)

    }

}

const ResetConversation = () =>{
    conversation = {
        Parameters : {
            id: "",
            startingBranch: "",
            medium: "",
            playerCharacter: "",
            npCharacter: "",
            nextConversation : ""
        },
        Branches:[new Branch("-0", [], new BranchingPoint("stop", []))]
    }
    Refresh(conversation)
}

const Refresh = (currentConv) => {

    //Mise à jour de allBranches et allBranchesHTML
    allBranches = currentConv.Branches

    GetAllBranchesHTML()



    //Nous générons un nouvelle arbre
    GenerateTree(allBranchesHTML)

    //Nous mettons à jour la conversation
    conversation = currentConv

    LoadConversationInfo()

    localStorage['conversation'] = JSON.stringify(conversation); 


    //Nous mettons à jour le lien de téléchargement
    ExportJson(conversation, conversation.Parameters.id)

    const addButtons = document.querySelectorAll(".addMessage")
    addButtons.forEach(button => {
        button.addEventListener('click', function () { AddAMessageToBranch(button) })
    });
    const deleteButtons = document.querySelectorAll(".deleteButton")
    deleteButtons.forEach(button => {
        button.addEventListener('click', function () { RemoveADiv(button.parentNode) })
    });

    const branchingPoints = document.querySelectorAll(".branchingPoint")
    branchingPoints.forEach(branchingPoint => {
        branchingPoint.addEventListener('change', function () { ChangeBranching(branchingPoint) })
        const deletePossS = branchingPoint.querySelectorAll(".deletePoss")
        if (deletePossS != null) {
            deletePossS.forEach(deletePoss => {
                deletePoss.addEventListener('click', function () { RemovePoss(deletePoss.parentNode.parentNode.parentNode, -1, deletePoss.parentNode) })
            });
        }
        const addPoss = branchingPoint.querySelector(".addPossibilities")
        if (addPoss != null) {
            addPoss.addEventListener('click', function () { AddNewPoss(addPoss.parentNode.parentNode, +1) })
        }

    });



}

const LoadConversationInfo = () =>{
    console.log(conversation)
    const convNameInput = document.getElementById("convNameInput");
    convNameInput.value = conversation.Parameters.id

    const mediumInput = document.getElementById("mediumInput");
    mediumInput.value = conversation.Parameters.medium

    const playerCharacterInput = document.getElementById("playerCharacterInput");
    playerCharacterInput.value = conversation.Parameters.playerCharacter

    const npCharacterInput = document.getElementById("npCharacterInput");
    npCharacterInput.value = conversation.Parameters.npCharacter

    const nextConversationInput = document.getElementById("nextConversationInput");
    nextConversationInput.value = conversation.Parameters.nextConversation
}

const UpdateConversation = () => {
    //Nous récupérons depuis le HTML l'état des branches actuelles
    let currentConv = RetrieveData()

    //Mise à jour des différents éléments de l'arbre
    Refresh(currentConv)

}

const GetAllBranchesHTML = () => {
    allBranchesHTML = []
    allBranches.forEach(element => {
        allBranchesHTML.push(new BranchHTML(element))
    });
}

const LoadFromFile = () =>{
    let currentConv
    var file = document.getElementById("jsonFile").files[0];
    if (file) {
        var reader = new FileReader();
        reader.readAsText(file, "UTF-8");
        reader.onload = function (evt) {
            console.log(evt.target.result)
            currentConv = JSON.parse(evt.target.result)
            if(currentConv.version == generatorVersion){
                Refresh(currentConv)
            }
            else{
                alert("Le fichier que vous essayez de charger n'est pas à la bonne version.")
            }
            document.getElementById("jsonFile").value = null
        }
        reader.onerror = function (evt) {
            console.log("error reading file");
        }
    }
} 


let allBranches = [new Branch("-0", [], new BranchingPoint("stop", []))]

let allBranchesHTML = []

let conversation

var cachedConversation = localStorage['conversation'];
if(cachedConversation != null){
    cachedConversation = JSON.parse(cachedConversation)
    if(cachedConversation.version == generatorVersion){
        Refresh(cachedConversation)
    }
}

document.getElementById("jsonFile").addEventListener("change", function(){LoadFromFile()})
GetAllBranchesHTML()
GenerateTree(allBranchesHTML)
UpdateConversation()

document.getElementById("global").addEventListener('change', function () { UpdateConversation() })
document.getElementById("resetButton").addEventListener('click', function(){ResetConversation()})

AddZoom(document.querySelector('#branches'))

