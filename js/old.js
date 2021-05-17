const newElementButton = document.getElementById("newElementButton");

class BranchElement {
    constructor(div){
        this.div = div
        this.select = div.querySelector("#select")
        this.type = parseInt(this.select.value)
        this.messageForm = div.querySelector("#message")
        this.pointForm = div.querySelector("#point")
        this.OnChange = this.OnChange.bind(this)
        this.GetData = this.GetData.bind(this)
        this.OnDestroyClick = this.OnDestroyClick.bind(this)
        this.OnPointChange = this.OnPointChange.bind(this)
        this.shownDiv = null
        this.delete = div.querySelector("#delete")
        this.shownPoint = null
    }
    OnDestroyClick(){
        console.log("destroy")
        console.log(this.div)
        removeRow(this.div)
    }

    OnChange(){
        console.log("Onchange")
        console.log(this.select)
        this.type = parseInt(this.select.value)
        switch (this.type) {
            case 0:
                this.shownDiv = this.messageForm
                this.messageForm.style = ""
                this.pointForm.style = "display:none"                
                break;
            case 1:
                this.shownDiv = this.pointForm
                this.messageForm.style = "display:none"
                this.pointForm.style = ""  
                break;
        }

        this.SetEventListener()
        console.log(this.shownDiv)
    }

    OnPointChange(){
        let select = this.shownDiv.querySelector("#select")
        console.log("pointchange")
        switch (select.value) {
            case "choice":
                this.shownPoint = this.shownDiv.querySelector("#" + select.value)
                this.shownDiv.querySelector("#choice").style = ""
                this.shownDiv.querySelector("#test").style = "display:none"
                this.shownDiv.querySelector("#change").style = "display:none"
                break;
            case "test":
                this.shownPoint = this.shownDiv.querySelector("#" + select.value)
                this.shownDiv.querySelector("#choice").style = "display:none"
                this.shownDiv.querySelector("#test").style = ""
                this.shownDiv.querySelector("#change").style = "display:none"
                break;
            case "change":
                this.shownPoint = this.shownDiv.querySelector("#" + select.value)
                this.shownDiv.querySelector("#choice").style = "display:none"
                this.shownDiv.querySelector("#test").style = "display:none"
                this.shownDiv.querySelector("#change").style = ""
                break;

            default:
                break;
        }
    }

    GetData(){
        let obj = {}
        switch (this.type) {
            case 0:
                let side = !Boolean(parseInt(this.shownDiv.querySelector("#select").value))
                let data = this.shownDiv.querySelector("#input").value
                let sendTime = parseInt(this.shownDiv.querySelector("#inputTime").value)
                let type = this.shownDiv.querySelector("#selectType").value
                obj = {
                    side:side,
                    content: { 
                        type: type, 
                        data: data
                    }, 
                    sendTime:sendTime 
                }
                break;
        }
        return obj
    }

    SetEventListener(){
        console.log("SetEvent")
        this.select.addEventListener('change', this.OnChange)
        this.delete.addEventListener('click', this.OnDestroyClick)
        if(this.type == 1){
            this.shownDiv.querySelector("#select").addEventListener('change', this.OnPointChange)
        }
    }
}

let listOfElement = []

const removeFromListOFElement = (value) => {
    let filteredAry = []
    listOfElement.forEach(element => {
        if(element.div != value){
            filteredAry.push(element)
        }
    });
    listOfElement = filteredAry

} 

function removeRow(div) {
    removeFromListOFElement(div)
    div.parentNode.removeChild(div);
}

const CreateNewElement = ()=>{
    console.log("Create")
    const AddDiv = () => {
        const div = document.createElement('div');
        
        console.log(div)
        div.className = 'element';
      
        div.innerHTML = `
                <button id="delete">Supprimer</button>
                <h4>Nouvelle élément :</h4>
                <select id="select">
                    <option value=""> Choisir le type </option>
                    <option value=0> Message </option>
                    <option value=1> Point </option>

                </select>

                <div id="message" style="display:none">
                    <h5>Coté du message :</h5>
                    <select id="select">
                        <option value=0> Gauche </option>
                        <option value=1> Droite </option>
                    </select>
                    <h5>Type de message</h5>
                    <select id="selectType">
                        <option value="text"> Text </option>
                        <option value="image"> Image </option>
                    </select>
                    <h5>Contenue :</h5>
                    <input id="input"></input>
                    <h5>Heure d'envoie (en seconde) :</h5>
                    <input id="inputTime" type="number"></input>
                </div>

                <div id="point" style="display:none">
                    <h5>Type</h5>
                    <select id="select">
                        <option value=""> Choisir le type </option>
                        <option value="choice"> Choix </option>
                        <option value="test"> Test </option>
                        <option value="change"> Change </option>
                    </select>

                    <div id="choice" style="display:none">
                        <h5>Nombres de possibilités</h5>
                        <input id="inputNumber" type="number" min=2></input>
                    </div>
                    <div id="test" style="display:none">
                    Test
                    </div>
                    <div id="change" style="display:none">
                    Change
                    </div>

                </div>
                
        `;
    
      
        document.getElementById('branches').appendChild(div);
        listOfElement.push(new BranchElement(div))
    }
    AddDiv()
    //console.log(listOfElement)
    listOfElement.forEach(element => {
        element.SetEventListener()
    });
}
newElementButton.addEventListener('click', CreateNewElement)