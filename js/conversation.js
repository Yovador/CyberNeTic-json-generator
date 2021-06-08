
const InitConversation = (currentVersion) =>{
    
    let conversation = {
        version:currentVersion,
        Parameters: {
            id: "",
            startingBranch:"",
            medium: "",
            playerCharacter: "",
            npCharacter: "",
            nextConversation: "",
            date:"",
            time:""
        },
    
        Branches: [
        ]
    }
    
    //console.log(conversation.Conversation)
    return conversation
}

export{InitConversation}