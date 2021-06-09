class Content {
    constructor(type, data){
        this.type = type
        this.data = data
    }
}
class Message {
    constructor(isNpc, content){
        this.isNpc = isNpc
        this.content = content
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
        this.id = id
        this.messagesList = messagesList
        this.branchingPoint = branchingPoint
    }
}

class Character{
    constructor(id, profilePicture, firstName, lastName){
        this.id =id;
        this.profilePicture = profilePicture;
        this.firstName = firstName;
        this.lastName = lastName;
    }
}

class Relationship{
    constructor(me, them, confidenceMeToThem){
        this.me = me
        this.them = them
        this.confidenceMeToThem = confidenceMeToThem
    }
}


export {Content, Message, BranchingPoint, Branch, Character,Relationship}