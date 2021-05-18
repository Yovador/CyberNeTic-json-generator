class Content {
    constructor(type, data){
        this.type = type
        this.data = data
    }
}
class Message {
    constructor(side, content, sendTime){
        this.side = side,
        this.content = content, 
        this.sendTime = sendTime
    }
}

class BranchingPoint {
    constructor(type, possibilities){
        this.type = type
        this.possibilities = possibilities
    }
}

class Branch{
    constructor(id, messagesList, branchingPoint){
        this.id = id,
        this.messagesList = messagesList,
        this.branchingPoint = branchingPoint
    }
}

const test = () =>{
    let firstBranch = new Branch("1stbranch", [], null)
    firstBranch.messagesList.push(new Message (true, new Content("text", "Salut"), 60) )
    firstBranch.messagesList.push(new Message (false, new Content("image", "Ca va ?"), 65) )
    firstBranch.branchingPoint = new BranchingPoint (
        "choice", 
        [
            {branch:"1A",
            possible:true,
            confidenceMod:1,
            message: new Message(false, new Content("text", "Oui et toi ?", 70))
            },

            {branch:"1B",
            possible:true,
            confidenceMod:-1,
            message: new Message(false, new Content("text", "Non *dab*", 70))
            }

        ]) 

    let oneA = new Branch("1A", [], null)
    oneA.messagesList.push(new Message (true, new Content("text", "Cava, Cool !"), 75) )
    oneA.branchingPoint = new BranchingPoint ( "stop", []) 
    
    let oneB = new Branch("1B", [], null)
    oneB.messagesList.push(new Message (true, new Content("text", " cringe"), 75) )
    oneB.branchingPoint = new BranchingPoint ( "stop", []) 

    let allBranches = []
    allBranches.push(firstBranch, oneA, oneB)

    let test = ` {"Branches" : [

        {
            "id":"C1Start",
            "messagesList" : [
                {"side":true, "content": { "type": "text", "data":"salut" }, "sendTime":60 },
                {"side":true, "content": { "type": "text", "data":"ca va" }, "sendTime":65 },
                {"side":true, "content": { "type": "text", "data":"quoi de neuf" }, "sendTime":70 }
            ],
            "branchingPoint" : {
                "type" : "choice",
                "possibilities": [
                    {"branch": "C1A", "possible": true, "confidenceMod" : 1, "message" : { "side":true, "content": { "type": "text", "data":"Oui et toi ?" }, "sendTime":75} },
                    {"branch": "C1B", "possible": true, "confidenceMod" : -1, "message" : { "side":true, "content": { "type": "text", "data":"Je suis entrain de te parler donc nope" }, "sendTime":75} },
                    {"branch": "C1C", "possible": true, "confidenceMod" : 0, "message" : { "side":true, "content": { "type": "image", "data":"/thumbs_up.png" }, "sendTime":75}},
                    {"branch": "C1D", "possible": false, "confidenceMod" : 0, "message" : { "side":true, "content": { "type": "text", "data":"Voldemort" }, "sendTime":75}}
                ]
            } 
        },

        {
            "id":"C1A",
            "messagesList" : [
                {"side":true, "content": { "type": "text", "data":"Ca va bien !" }, "sendTime":85 }
            ],
            "branchingPoint" : {
                "type" : "test",
                "possibilities": [   
                    {"branch":"C1AA", "thresholds":[3, 200]},
                    {"branch":"C1AB", "thresholds":[0, 2]}
                ]
            } 
        },

        {
            "id":"C1B",
            "messagesList" : [
                {"side":true, "content": { "type": "text", "data":"Va te faire cuire un oeuf" }, "sendTime":85 }
            ],
            "branchingPoint" : {
                "type" : "stop",
                "possibilities": []
            } 
        },

        {
            "id":"C1C",
            "messagesList" : [
                {"side":true, "content": { "type": "text", "data":"Cool !" }, "sendTime":85 }
            ],

            "branchingPoint" : {
                "type" : "change",
                "possibilities": [
                    {"branch": "C1X"}
                ]
            } 
        },

        
        {
            "id":"C1AA",
            "messagesList" : [
                {"side":true, "content": { "type": "text", "data":"Ta maman est sympa" }, "sendTime":85 }
            ],
            "branchingPoint" : {
                "type" : "change",
                "possibilities": [   
                    {"branch":"C1X"}
                ]
            } 
        },

        
        {
            "id":"C1AB",
            "messagesList" : [
                {"side":true, "content": { "type": "text", "data":"J'aime les pates" }, "sendTime":85 }
            ],
            "branchingPoint" : {
                "type" : "change",
                "possibilities": [   
                    {"branch":"C1X"}
                ]
            } 
        },

        {
            "id":"C1X",
            "messagesList" : [
                {"side":true, "content": { "type": "text", "data":"Je dois y aller" }, "sendTime":85 }
            ],
            "branchingPoint" : {
                "type" : "stop",
                "possibilities": []
            } 
        }
        

    ]}`

    let hh = JSON.parse(test)
    allBranches = hh.Branches
    return allBranches
}



export {Content, Message, BranchingPoint, Branch, test}