
const InitConversation = () =>{
    
    let conversation = {
        Parameters: {
            id: "",
            startingBranch:"",
            medium: "",
            playerCharacter: "",
            npCharacter: "",
            nextConversation: ""
        },
    
        Branches: [
        ]
    }
    
    //console.log(conversation.Conversation)
    return conversation
}

export{InitConversation}