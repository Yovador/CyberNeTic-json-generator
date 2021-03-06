import {
    Content,
    Message,
    BranchingPoint,
    Branch
} from "./class.js"
import {
    InitConversation
} from "./conversation.js"
import ExportJson from "./exportJson.js"
import AddZoom from "./addZoom.js"
import CreateNewDiv from "./CreateNewDiv.js"

const generatorVersion = 0.4
document.getElementById("generatorVersion").innerHTML = `Version : ${generatorVersion}`

const defaultMessage = {
    isNpc: true,
    content: {
        type: "text",
        data: ""
    }
}
const defaultChoicePoss = {
    branch: "",
    possible: true,
    confidenceMod: 0,
    message: {
        isNpc: false,
        content: {
            type: "text",
            data: ""
        }
    }
}
const defaultTestPoss = {
    branch: "",
    isDefault: false,
    threshold: 0,
    checkIfSup: true
}
const defaultChangePoss = {
    branch: ""
}
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

        html += `<h2> Branches non utilis??s <h2>
                <button class="addUnusedBranch btn btn-info btn-sm">Ajouter une branche</button>
                `

        unusedBranchDiv.innerHTML = html

        let button = unusedBranchDiv.querySelector(".addUnusedBranch")

        button.addEventListener('click', function() {
            CreateNewBranch()
        })

        return unusedBranchDiv

    }

    //Fonction responsable de cr??er une branch. 
    //Elle s'appelle elle m??me pour tout les enfants de la branche actuelle 
    const CreateBranch = (branches, branch) => {
        if (branch != null) {
            //On r??cup??re la div qui sert ?? contenir toute les branches

            //On ajoute l'id de la branch actuelle dans la liste des branches d??ja plac?? pour ??viter des doublons
            listOfBranch.push(branch.branch.id)

            //variable contenant la div parent de la branch
            let finalParentDiv
                //r??cup??ration de la BranchHTML de la branche pr??c??dant la branche actuelle
            let parentBranch = BranchHTML.FindBranchById(branch.parent[0])
            if (branch.parent.length > 1) {
                let i = 0
                    //Si la branch ?? plusieurs branche pr??c??dente, alors on cherche celle qui dispose d'une div
                while (parentBranch.div == undefined) {
                    parentBranch = BranchHTML.FindBranchById(branch.parent[i])
                    i++
                }
            }

            if (parentBranch != null) {
                switch (parentBranch.branch.branchingPoint.type) {
                    case "choice":
                    case "test":
                        //Si le parent n'a pas de div pour y mettre ses enfants, on en cr???? une
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

            //On cr???? et attribue la div de la branch
            //BranchToHtml g??n??re le html
            branch.div = CreateNewDiv(BranchToHtml(branch.branch), finalParentDiv, null, "branch box shadow", true)

            //Pour chaque branche enfant de la branche actuelle, on relance la fonction pour cr???? une nouvelle branche
            branch.branch.branchingPoint.possibilities.forEach(poss => {
                if (!listOfBranch.includes(poss.branch)) {
                    CreateBranch(branches, BranchHTML.FindBranchById(poss.branch))
                }
            });
        }
    }

    //On commence par la premi??re branche de la liste
    CreateBranch(branches, branches[0])

    let unusedBranchDiv = CreateUnusedBranch()

    branches.forEach(branch => {
        if (!listOfBranch.includes(branch.branch.id)) {

            let parentHTML = `<button class="removeBranch btn btn-danger btn-sm">Supprimer la branche</button>`

            let parentDiv = CreateNewDiv(parentHTML, unusedBranchDiv, null, null, true)

            let button = parentDiv.querySelector(".removeBranch")
            button.addEventListener('click', function() {
                DeleteUnusedBranch(parentDiv)
            })

            branch.div = CreateNewDiv(BranchToHtml(branch.branch), parentDiv, null, "branch box shadow", true)

            parentDiv.appendChild(branch.div)
        }
    });

}

//G??n??re un string contenant le html d'un message
const ShowAMessage = (message, remove, Ischoice) => {
    let mustRemove = false
    if (remove != null) {
        mustRemove = remove
    }
    let html = `<div class="message shadow card">`
    if (mustRemove) {
        html += `<button class = "deleteButton btn btn-danger btn-sm">Supprimer le message</button>`
    }
    if (Ischoice == false) {
        html += `<h3> Message : </h3> <label> Propri??taire du message : </label>`
        html += `
                <select class="isNpcChoice">
                `
        var PropSMSPlayer = document.getElementById("playerCharacterInput").value

        var PropSMSNpc = document.getElementById("npCharacterInput").value

        if (message.isNpc) {
            html += `
                        <option value=0 selected="selected"> ${PropSMSNpc} </option>
                        <option value=1> ${PropSMSPlayer} </option>
                    `
        } else {
            html += `
                        <option value=0> ${PropSMSNpc} </option>
                        <option value=1 selected="selected"> ${PropSMSPlayer} </option>
                    `
        }
    } else {
        html += `<select hidden class="isNpcChoice">
                    <option hidden value=1 selected="selected"></option>
                    `
    }

    html += `</select> <h4> Contenu : </h4> <label> Type de contenu : </label>`


    html += `
    <select class="contentType">`
    switch (message.content.type) {

        case "text":
            html += `
                <option value=""> Choisissez un type de message </option>
                <option value="text" selected="selected"> Texte </option>
                <option value="image"> Image </option>
            `
            break;

        case "image":
            html += `
                <option value=""> Choisissez un type de message </option>
                <option value="text"> Texte </option>
                <option value="image"  selected="selected"> Image </option>
            `
            break;

        default:
            html += `
                <option value="" selected="selected"> Choisissez un type de message </option>
                <option value="text"> Texte </option>
                <option value="image"> Image </option>
            `
            break;

    }
    html += `</select>`

    let stringcontent = ""
    const regExpExt = new RegExp(/(?<=(\.))(.*?)$/gm)
    let stringExt = message.content.data.match(regExpExt)
    switch (message.content.type) {

        case "text":
            stringcontent = message.content.data
            break;
        case "image":

            const regExpImg = new RegExp(/^(.*?)(?=(\.))/gm)

            stringcontent = message.content.data.match(regExpImg)
            if (stringcontent == null || stringcontent == undefined || stringcontent.length == 0) {
                stringcontent = ""
            } else {
                stringcontent = stringcontent[0]
            }

            if (stringExt == null || stringExt == undefined || stringExt.length == 0) {
                stringExt = "png"
            } else {
                stringExt = stringExt[0]
            }

            break;


    }
    html += `
    <div>
    <label> Contenu : </label>
    </div>
    <div class="flexcontent">
        <textarea class = "contentData">${stringcontent}</textarea>
    
    `


    if (message.content.type == "image") {
        html += `
        <select class="contentExt">`
        switch (stringExt) {
            case "png":
                html += `
                        <option value="png" selected="selected"> .png </option>
                        <option value="jpg" > .jpg </option>
                        <option value="jpeg" > .jpeg </option>

                        `

                break;

            case "jpg":

                html += `
                            <option value="png" > .png </option>
                            <option value="jpg" selected="selected"> .jpg </option>
                            <option value="jpeg"> .jpeg </option>

                            `


                break;

            case "jpeg":
                html += `
                            <option value="png" > .png </option>
                            <option value="jpg" > .jpg </option>
                            <option value="jpeg" selected="selected"> .jpeg </option>

                            `


                break;
            default:
                html += `
                <option value="png" > .png </option>
                <option value="jpg" > .jpg </option>
                <option value="jpeg"> .jpeg </option>
                `
        }

    } else {
        html += `<select hidden class="contentExt">
                <option hidden value="" selected="selected"></option> 
                `
    }
    html += ` 
                </select>
                </div>
                </div>`
    return html
}

//Ces 3 fonctions g??n??re un string contenant le html de leur type de branching sp??cifique (possiblement refactorisable)
const ShowOptionChoice = (poss) => {
    let html = ""

    html += ` <div class = "branchingPoss shadow card PadCard"> `

    html += ` <button class = "deletePoss btn btn-danger btn-sm"> Supprimer le choix </button>`

    html += `<h3> Relier ce choix ?? une branche </h3>
    <label> S??lectionner la branche ?? relier </label>
    <select class="branchIDNext"> `

    if (poss.possible) {
        allBranches.forEach(branchFromAll => {
            if (allBranches.indexOf(branchFromAll) != 0) {
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

    } else {
        html += `<option value="none"> Pas de branche </option>`
    }

    html += `</select>`

    html += ShowAMessage(poss.message, false, true)
    html += `<div> 
            <label> Choix Possible ? </label> 
            <input class="possible" type="checkbox" name="Possible ?"
            `

    if (poss.possible) {
        html += `checked> </div>`
    } else {
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
const ShowOptionTest = (poss, i) => {
    let html = ""

    if (i == 0) {
        html += `<div class="branchingPoss shadow card PadCard">`
        html += `<h3> Par defaut, la branche suivante est : </h3>
            <div>`

        html += `
        <select class="Infsup" hidden>
            <option value="oui" hidden></option>
        </select>`

        html += `
        <select class="IsDefault" hidden>
            <option value="true" hidden></option>
        </select>`

        html += `
        <input hidden class="threshold" type="number" step="any" value="Null"/>
        </div>
        <select class="branchIDNext"> 
         `

        allBranches.forEach(branchFromAll => {
            if (allBranches.indexOf(branchFromAll) != 0) {
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


        return html

    } else {

        html += `<div class="branchingPoss shadow card PadCard">`

        html += `<button class="deletePoss btn btn-danger btn-sm">Supprimer le choix</button>`
        html += `<h3> Option de Test : </h3>
            <div>
            <label> Si la variable de confiance est</label>`
        console.log(poss)
        if (poss.threshold > 0) {
            html += `
           <select class="Infsup">
                <option value="sup??rieur" selected="selected"> sup??rieur ??</option>
            </select>`
        } else if (poss.threshold < 0) {
            html += `
           <select class="Infsup">
                <option value="inf??rieur" selected="selected"> inf??rieur ??</option>
            </select>`
        } else {

            switch (poss.checkIfSup) {
                case true:
                    html += `
                        <select class="Infsup">
                            <option value="sup??rieur" selected="selected"> sup??rieur ??</option>
                            <option value="inf??rieur"> inf??rieur ??</option>
                        </select>`
                    break
                case false:
                    html += `
                            <select class="Infsup">
                                <option value="sup??rieur"> sup??rieur ??</option>
                                <option value="inf??rieur" selected="selected"> inf??rieur ??</option>
                            </select>`
                    break
                
            }
        }

        html += `
        <select class="IsDefault" hidden>
            <option value="" hidden></option>
        </select>`



        html += `
        <input class="threshold" type="number" step="any" value="${poss.threshold}"/>
        </div>
        <label>alors la branche suivante est :</label>
        <select class="branchIDNext"> 
         `



        allBranches.forEach(branchFromAll => {
            if (allBranches.indexOf(branchFromAll) != 0) {
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


        return html

    }
}
const ShowOptionChange = (poss) => {
    let html = ""
    html += `<div class="branchingPoss shadow card PadCard"><h3> Relier cette branche ?? une autre </h3>
        <label> S??lectionner la branche suivante: </label>
        <select class="branchIDNext"> 
        `
    allBranches.forEach(branchFromAll => {
        if (allBranches.indexOf(branchFromAll) != 0) {

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

    html += `</select>
            </div>`
    return html
}

//G??n??re un string contenant le html d'un branchingPoint
const ShowBranchingPoint = (branch) => {
    let html = ""

    html += `
    <div class="branchingPoint PadCard">
        <div class="shadow card PadCard Embranchement">
        <label> ?? la fin de cette branche : </label> 
        <select class="bpType">
        
    `
    switch (branch.branchingPoint.type) {
        case "choice":
            html += `
                    <option value="choice" selected="selected"> Cr??er un choix pour le joueur </option>
                    <option value="test"> Cr??er un test de confiance </option>
                    <option value="change"> Relier ?? une autre branche </option>
                    <option value="stop"> Stopper la conversation</option>
                    </select>
                    </div>
                    `
            branch.branchingPoint.possibilities.forEach(poss => {
                html += ShowOptionChoice(poss)

            });
            break;
        case "test":
            html += `
            <option value="choice" > Cr??er un choix pour le joueur </option>
            <option value="test" selected="selected"> Cr??er un test de confiance </option>
            <option value="change"> Relier ?? une autre branche </option>
            <option value="stop"> Stopper la conversation</option>
            </select>
            </div>
                    `

            for (let i = 0; i < branch.branchingPoint.possibilities.length; i++) {
                const poss = branch.branchingPoint.possibilities[i];

                html += ShowOptionTest(poss, i)

            }

            break;
        case "change":
            html += `
            <option value="choice" > Cr??er un choix pour le joueur </option>
            <option value="test"> Cr??er un test de confiance </option>
            <option value="change" selected="selected"> Relier ?? une autre branche </option>
            <option value="stop"> Stopper la conversation</option>
            </select>
            </div>
                    `


            branch.branchingPoint.possibilities.forEach(poss => {

                html += ShowOptionChange(poss)
            })
            break;
        case "stop":
            html += `

            <option value="choice" > Cr??er un choix pour le joueur </option>
            <option value="test"> Cr??er un test de confiance </option>
            <option value="change"> Relier ?? une autre branche </option>
            <option value="stop" selected="selected"> Stopper la conversation</option>
            </select>
            </div>
                `

            break;
    }

    if (branch.branchingPoint.type == "choice") {
        html += `<button class="addPossibilities btn btn-info btn-lg Ajouteroptions"> Ajouter une autre options </button>`
    }

    if (branch.branchingPoint.type == "test") {
        html += `<button class="addPossibilities btn btn-info btn-lg Ajoutertest"> Ajouter une autre options </button>`
    }

    html += `</div>
                `


    return html
}

//Fonction g??n??rant un string contenant le HTML d'une branche
const BranchToHtml = (branch) => {




    let html = `<h2 class="branchName"> Branch : ${branch.id} </h2>`

    //Bouton d'ajout de message
    html += `<button class="addMessage btn btn-info btn-sm"> Ajouter un message ici </button>`

    //Pour chaque message dans la branche, on affiche un message
    branch.messagesList.forEach(message => {
        html += ShowAMessage(message, true, false)

        //Bouton d'ajout de message
        html += `<button class="addMessage btn btn-info btn-sm"> Ajouter un message ici </button>`

    });

    //G??n??ration du Branching point
    html += ShowBranchingPoint(branch)



    return html
}

//Fonction r??cup??rant les donn??es depuis le HTML
const RetrieveData = () => {
    //Cr??ation d'un nouvelle ??l??ment conversation

    let conversation = InitConversation(generatorVersion)

    //R??cup??ration des informations de la conversation, son id, son medium, 
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


    const dateInput = document.getElementById("dateInput");
    let date = dateInput.value


    const timeInput = document.getElementById("timeInput");
    let time = timeInput.value

    //Fonction retournant un array de message ?? partir d'une div donn??e

    const RetrieveMessage = (div) => {
        let messagesList = []
        let messagesDiv = div.querySelectorAll(":scope > .message")
        messagesDiv.forEach(messageDiv => {
            let isNpc = !Boolean(parseInt(messageDiv.querySelector(".isNpcChoice").value))
            let content = new Content()
            let contentType = messageDiv.querySelector(".contentType").value


            // if (contentType == "image") {
            //     let charImagenoPoint = messageDiv.querySelector(".contentData").value.replace(/\./gmi, '')
            //     content = new Content(contentType, charImagenoPoint + "." + messageDiv.querySelector(".contentExt").value)
            // } else {
            //     let chartextnoPoint = messageDiv.querySelector(".contentData ").value.replace()
            //     content = new Content(contentType, chartextnoPoint)
            // }

            switch (contentType) {
                case "image":
                    let charImagenoPoint = messageDiv.querySelector(".contentData").value.replace(/\./gmi, '')
                    content = new Content(contentType, charImagenoPoint + "." + messageDiv.querySelector(".contentExt").value)
                    break;

                case "text":
                    let charText = messageDiv.querySelector(".contentData ").value
                    content = new Content(contentType, charText)
                    break;
            }

            messagesList.push(new Message(isNpc, content))
        });

        return messagesList
    }

    let branches = [] //Liste contenant toutes les branches de l'arbre
    let idList = []

    //On g??n??re une liste d'id ?? attribuer au branches

    for (let i = 0; i < allBranchesHTML.length; i++) {
        let conversationName = convName
        let id = conversationName + "-" + i
        idList.push(id)
    }

    const GetNextBranchID = (poss) => {

        //On cherche l'index dans la liste des BranchHTML de la valeur d??tenue dans .branchIDNext, c'est ?? dire, la branche vers laquelle renvoie cette possibilit??
        let indexChildrenBranch = allBranchesHTML.indexOf(BranchHTML.FindBranchById(poss.querySelector(".branchIDNext").value))
        let id = "none"
        if (indexChildrenBranch != null && indexChildrenBranch != undefined) {
            id = idList[indexChildrenBranch]
        }
        if (id == undefined) {
            id = ""
        }


        return id
    }

    //On r??cup??re les informations pour chaque branches
    for (let i = 0; i < allBranchesHTML.length; i++) {
        const currentBranch = allBranchesHTML[i];
        let id = idList[i] //Attribution de l'id
        let messagesList = RetrieveMessage(currentBranch.div) //R??cup??ration de la liste de messages
        let branchingPointDiv = currentBranch.div.querySelector(".branchingPoint") //R??cup??ration de la div contennant les ??l??ments du BranchingPoint
        let branchingType = branchingPointDiv.querySelector(".bpType").value //R??cup??ration du type de BranchingPoint
        let branchingPossibilites = [] //Array contenant l'ensembles des branchingPoint.possibilities
        let branchingPossDiv //Array contenant l'ensembles des div des branchingPoint.possibilities

        //Selon le type du BranchingPoint, les possibilites doivent ??tre r??cup??r?? de mani??re diff??rente

        switch (branchingType) {
            //Dans le cas d'un branchingPoint de type "choice", 
            //il nous faut : l'id de la branch suivante, un bool??en indiquant si c'est un choix possible au joueur,
            //la valeur par laquelle le choix modifie la variable de confiance, et le message du choix
            case "choice":
                branchingPossDiv = branchingPointDiv.querySelectorAll(".branchingPoss")
                branchingPossDiv.forEach(poss => {

                    //On r??cup??re l'id de la prochaine branche
                    let id = GetNextBranchID(poss)


                    //On r??cup??re le boll??en indiquant si le choix est possible
                    let possible = poss.querySelector(".possible").checked


                    //On r??cup??re le modificateur de confiance
                    let confidenceMod = poss.querySelector(".confidenceMod").value

                    //On r??cup??re le message de la possibilit??
                    let message = RetrieveMessage(poss)[0]

                    //On rajoute tout ces ??l??ments dans l'array contenant toute les possibilit??s du branchingPoint de la branch
                    branchingPossibilites.push({
                        branch: id,
                        possible: possible,
                        confidenceMod: confidenceMod,
                        message: message
                    })
                });
                break;
                //Dans le cas d'un branchingPoint de type "test", 
                //Il nous faut : l'id de la branch suivante, la valeur maximal et minimal
                //de l'intervalle de validit?? de la possibilit??
            case "test":
                branchingPossDiv = branchingPointDiv.querySelectorAll(".branchingPoss")
                branchingPossDiv.forEach(poss => {
                    let id = GetNextBranchID(poss)
                    let Threshold = parseInt(poss.querySelector(".threshold").value)
                    console.log(poss.querySelector(".Infsup"))
                    let SupInf = poss.querySelector(".Infsup").value
                    if (SupInf == "sup??rieur") {
                        SupInf = true
                    } else if (SupInf == "inf??rieur") {
                        SupInf = false
                    } else {
                        SupInf = null
                    }
                    let Isdefault = Boolean(poss.querySelector(".IsDefault").value)



                    branchingPossibilites.push({
                        branch: id,
                        isDefault: Isdefault,
                        threshold: Threshold,
                        checkIfSup: SupInf

                    })


                });
                break;
            case "change":
                branchingPossDiv = branchingPointDiv.querySelectorAll(".branchingPoss")
                branchingPossDiv.forEach(poss => {
                    let id = GetNextBranchID(poss)
                    branchingPossibilites.push({
                        branch: id
                    })
                })

                break;
        }

        let branchingPoint = new BranchingPoint(branchingType, branchingPossibilites)
        let branch = new Branch(id, messagesList, branchingPoint)
        branches.push(branch)
    }

    //Nous attribuons toutes les informations que nous venons de r??cup??r?? ?? la variable conversation
    conversation.Parameters.id = convName
    conversation.Parameters.startingBranch = allBranches[0].id
    conversation.Parameters.medium = medium
    conversation.Parameters.playerCharacter = playerCharacter
    conversation.Parameters.npCharacter = npCharacter
    conversation.Parameters.nextConversation = nextConversation
    conversation.Parameters.date = date
    conversation.Parameters.time = time
    conversation.Branches = branches

    return conversation
}

//Action des boutons "nouveau message" qui ajoute un message
const AddAMessageToBranch = (buttonDiv) => {
    let parent = buttonDiv.parentNode;
    let tempDiv = document.createElement('div');
    parent.replaceChild(tempDiv, buttonDiv);
    tempDiv.appendChild(buttonDiv);
    tempDiv.innerHTML = ShowAMessage(defaultMessage, true, false)
    let messageDiv = tempDiv.querySelector(".message")
    parent.replaceChild(messageDiv, tempDiv)
    messageDiv.before(buttonDiv)
    let secondButton = buttonDiv.cloneNode(true)
    messageDiv.after(secondButton)
    UpdateConversation()
}

//Fonction supprimant une div puis met ?? jour l'arbre
const RemoveADiv = (div) => {
    div.remove()
    UpdateConversation()
}

//Fonction ajoutant une Possibilit?? ?? un branching point
const AddNewPoss = (possDiv, num) => {
    let branch = BranchHTML.FindBranchByDiv(possDiv).branch
    let newPossNum = branch.branchingPoint.possibilities.length + num
    ChangeConversation(branch, branch.branchingPoint.type, newPossNum, "add")
}

const RemovePoss = (branchDiv, num, possDiv) => {
    let branch = BranchHTML.FindBranchByDiv(branchDiv).branch
    let allPoss = Array.from(branchDiv.querySelectorAll(".branchingPoss"))
    let possID = allPoss.indexOf(possDiv)
    ChangeConversation(branch, branch.branchingPoint.type, 0, "remove", possID)
}

//Fonction supprimant une branche dans la conversation
const DeleteABranch = (oldBranch) => {
    let isFirst = false

    //On regarde toute les branches, si la branche que l'on cherche ?? supprimer est la premi??re,
    //on vides l'array contenant toutes les branches de la conversation car toutes les branches sont forcement des enfants de la premi??re
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
                //Si la branche que l'on cherche ?? supprim?? n'est pas de type change
                if (branch.branchingPoint.type != "change") {
                    //On cherche ensuite parmis toutes les branches les branches enfants de la branches que l'on cherche ?? supprim??
                    //Et on l'a supprime en rappelant cette fonction
                    branch.branchingPoint.possibilities.forEach(poss => {
                        conversation.Branches.forEach(branch2 => {
                            if (branch2.id == poss.branch) {
                                DeleteABranch(branch2)
                            }
                        });
                    });
                }
                //On enl??ve de la liste des branches la branche actuelle
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
                //On cr??e X possibilit??s vide et on s'assure que les id soit unique. 
                //Les id seront r??g??n??r?? lors de la prochaine Update

                CreateNewPoss(possNumber, defaultChoicePoss).forEach(poss => {
                    newCurrentBranch.branchingPoint.possibilities.push(poss)
                });

                break;

            case "test":
                //On cr??e X possibilit??s vide et on s'assure que les id soit unique. 
                //Les id seront r??g??n??r?? lors de la prochaine Update

                CreateNewPoss(possNumber, defaultTestPoss).forEach(poss => {
                    newCurrentBranch.branchingPoint.possibilities.push(poss)
                });

                break;

            case "change":
                //Le type change n'a besoin que d'une seul possibilit??s
                CreateNewPoss(1, defaultChangePoss).forEach(poss => {
                    newCurrentBranch.branchingPoint.possibilities.push(poss)
                });
                break;

        }

        //Pour chaque possibilit??, on cr???? une nouvelle branche vide, que l'on rajoute ?? newChildBranch
        //Et ceux seulement si le type est diff??rent de change
        if (branchingType != "change") {
            newCurrentBranch.branchingPoint.possibilities.forEach(poss => {
                newChildBranch.push(new Branch(poss.branch, [], new BranchingPoint("stop", [])))
            });
        }
    }

    const AddNewPoss = () => {
        newCurrentBranch.branchingPoint.possibilities = oldBranch.branchingPoint.possibilities
        switch (branchingType) {
            case "choice":
                //On cr??e X possibilit??s vide et on s'assure que les id soit unique. 
                //Les id seront r??g??n??r?? lors de la prochaine Update

                CreateNewPoss(1, defaultChoicePoss).forEach(poss => {
                    newCurrentBranch.branchingPoint.possibilities.push(poss)
                });

                break;

            case "test":
                //On cr??e X possibilit??s vide et on s'assure que les id soit unique. 
                //Les id seront r??g??n??r?? lors de la prochaine Update

                CreateNewPoss(1, defaultTestPoss).forEach(poss => {
                    newCurrentBranch.branchingPoint.possibilities.push(poss)
                });

                break;
        }

        //Si la possibilit??s existe d??j??, on l'ajoute directement ?? la nouvelle branch, sinon on en cr???? une nouvelle

        const AddToNewChild = (parentBranch) => {
            parentBranch.branchingPoint.possibilities.forEach(poss => {
                if (poss.branch != "") {
                    let allID = []
                    for (const branch of allBranches) {
                        allID.push(branch.id)
                    }
                    if (allID.includes(poss.branch)) {
                        for (const branch of allBranches) {
                            if (poss.branch == branch.id && !newChildBranch.includes(branch)) {
                                newChildBranch.push(branch)
                                AddToNewChild(branch)

                            }
                        }
                    } else {
                        newChildBranch.push(new Branch(poss.branch, [], new BranchingPoint("stop", [])))
                    }
                }

            });
        }

        AddToNewChild(newCurrentBranch)

    }

    const RemovePoss = () => {
        newCurrentBranch.branchingPoint.possibilities = oldBranch.branchingPoint.possibilities

        newCurrentBranch.branchingPoint.possibilities.splice(possID, 1)

        const AddToNewChild = (parentBranch) => {
            for (const poss of parentBranch.branchingPoint.possibilities) {
                if (poss.branch != "") {
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

    //Cr??ation d'une nouvelle branch similaire ?? l'ancienne mets ou le branchingPoint est chang?? et les possibilit??s vide
    let newCurrentBranch = new Branch(oldBranch.id, oldBranch.messagesList, new BranchingPoint(branchingType, []))
    let newChildBranch = []


    if (replace == "override" || replace == null) {
        OverridePreviousBranch()
    } else if (replace == "add") {
        AddNewPoss()
    } else if (replace == "remove") {
        RemovePoss()
    }




    //Fonction supprimant une branche dans une conversation
    if (conversation.Branches.includes(oldBranch)) {
        DeleteABranch(oldBranch)
    }

    //On rajoute la branche modifi?? ainsi que les nouvelles branches enfin ?? la conversation
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
    //On r??cup??re le branchHTML de la branche que l'on va modifier
    let oldBranch = BranchHTML.FindBranchByDiv(branchingDiv.parentNode).branch
        //On r??cup??re le type actuellement affich?? sur le HTML
    let branchingType = branchingDiv.querySelector(".bpType").value



    //Si le type de la branch ?? ??tait chang?? alors on effectue les changements dans la conversation
    if (branchingType != oldBranch.branchingPoint.type) {

        ChangeConversation(oldBranch, branchingType, 2)

    }

}

const ResetConversation = () => {
    conversation = {
        Parameters: {
            id: "",
            startingBranch: "",
            medium: "",
            playerCharacter: "",
            npCharacter: "",
            nextConversation: ""
        },
        Branches: [new Branch("-0", [], new BranchingPoint("stop", []))]
    }
    Refresh(conversation)


    document.getElementById('mediumInput').selectedIndex = "sms"
}

const Refresh = (currentConv) => {

    //Mise ?? jour de allBranches et allBranchesHTML
    allBranches = currentConv.Branches

    GetAllBranchesHTML()

    //Nous g??n??rons un nouvelle arbre
    GenerateTree(allBranchesHTML)

    //Nous mettons ?? jour la conversation
    conversation = currentConv

    LoadConversationInfo()

    localStorage['conversation'] = JSON.stringify(conversation);


    //Nous mettons ?? jour le lien de t??l??chargement
    ExportJson(conversation, conversation.Parameters.id)

    const addButtons = document.querySelectorAll(".addMessage")
    addButtons.forEach(button => {
        button.addEventListener('click', function() {
            AddAMessageToBranch(button)
        })
    });
    const deleteButtons = document.querySelectorAll(".deleteButton")
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            RemoveADiv(button.parentNode)
        })
    });

    const branchingPoints = document.querySelectorAll(".branchingPoint")
    branchingPoints.forEach(branchingPoint => {
        branchingPoint.addEventListener('change', function() {
            ChangeBranching(branchingPoint)
        })
        const deletePossS = branchingPoint.querySelectorAll(".deletePoss")
        if (deletePossS != null) {
            deletePossS.forEach(deletePoss => {
                deletePoss.addEventListener('click', function() {
                    RemovePoss(deletePoss.parentNode.parentNode.parentNode, -1, deletePoss.parentNode)
                })
            });
        }
        const addPoss = branchingPoint.querySelector(".addPossibilities")
        if (addPoss != null) {
            addPoss.addEventListener('click', function() {
                AddNewPoss(addPoss.parentNode.parentNode, +1)
            })
        }

    });

}

const LoadConversationInfo = () => {
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

    const dateInput = document.getElementById("dateInput");
    dateInput.value = conversation.Parameters.date

    const timeInput = document.getElementById("timeInput");
    timeInput.value = conversation.Parameters.time
}

const UpdateConversation = () => {
    //Nous r??cup??rons depuis le HTML l'??tat des branches actuelles
    let currentConv = RetrieveData()

    //Mise ?? jour des diff??rents ??l??ments de l'arbre
    Refresh(currentConv)
}

const GetAllBranchesHTML = () => {
    allBranchesHTML = []
    allBranches.forEach(element => {
        allBranchesHTML.push(new BranchHTML(element))
    });
}

const LoadFromFile = () => {
    let currentConv
    var file = document.getElementById("jsonFile").files[0];
    if (file) {
        var reader = new FileReader();
        reader.readAsText(file, "UTF-8");
        reader.onload = function(evt) {
            currentConv = JSON.parse(evt.target.result)
            if (currentConv.version == generatorVersion) {
                Refresh(currentConv)
            } else {
                alert("Le fichier que vous essayez de charger n'est pas ?? la bonne version.")
            }
            document.getElementById("jsonFile").value = null
        }
        reader.onerror = function(evt) {
            console.log("error reading file");
        }
    }

    //Changement du select medium en fonction du fichier charg??e

    var mediumInput = document.getElementById('mediumInput')
    conversation.Parameters.medium.value = mediumInput.selectedIndex

}


let allBranches = [new Branch("-0", [], new BranchingPoint("stop", []))]

let allBranchesHTML = []

let conversation

var cachedConversation = localStorage['conversation'];
if (cachedConversation != null) {
    cachedConversation = JSON.parse(cachedConversation)
    if (cachedConversation.version == generatorVersion) {
        Refresh(cachedConversation)
    }
}

document.getElementById("jsonFile").addEventListener("change", function() {
    LoadFromFile()
})
GetAllBranchesHTML()
GenerateTree(allBranchesHTML)
UpdateConversation()

document.getElementById("global").addEventListener('change', function() {
    UpdateConversation()
})
document.getElementById("resetButton").addEventListener('click', function() {
    ResetConversation()
})

AddZoom(document.querySelector('#branches'))

AddZoom(document.querySelector('#branches'))