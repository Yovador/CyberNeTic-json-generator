
const InitConversation = () =>{

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
    
    
    let conversation = {
        Conversation: {
            id: convName,
            startingBranch:"",
            medium: medium,
            playerCharacter: playerCharacter,
            npCharacter: npCharacter,
            nextConversation: nextConversation
        },
    
        Branches: [
        ]
    }
    
    //console.log(conversation.Conversation)
    return conversation
}

export{InitConversation}