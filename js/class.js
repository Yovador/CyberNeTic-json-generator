class Content {
    constructor(type, data){
        this.type = type
        this.data = data
    }
}
class Message {
    constructor(isNpc, content, sendTime){
        this.isNpc = isNpc
        this.content = content
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

class HmsTime{
    constructor(hours, minutes, seconds){
        this.hours = hours;
        this.minutes = minutes;
        this.seconds = seconds;
    }

    GetSeconds = () =>{
        let sec = ( (this.hours * 60) + this.minutes ) * 60 + this.seconds
        return sec;
    }

    SetHmsTimeFromSec = (seconds) =>{
        this.seconds = seconds % 60;
        console.log(seconds)
        let totalMinutes = Math.floor(seconds/60);
        this.minutes = totalMinutes % 60;
        this.hours = Math.floor(totalMinutes/60) % 24;

    }
}


export {Content, Message, BranchingPoint, Branch, Character,Relationship, HmsTime}