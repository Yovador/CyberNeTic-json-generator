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

 
    return allBranches
}



export {Content, Message, BranchingPoint, Branch}