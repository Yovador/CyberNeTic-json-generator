const ExportJson = (obj) => {


    var dlAnchorElem = document.getElementById('downloadAnchorElem');
    
    const ExportFile = (obj) =>{
    
        console.log("Exporting...")
        console.log(obj)
        let filename = obj.Conversation.id + ".json"
        console.log(filename)
        var json = JSON.stringify(obj);
        var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(json);
        dlAnchorElem.setAttribute("href",     dataStr     );
        dlAnchorElem.setAttribute("download", filename);
    }
    
    dlAnchorElem.addEventListener('click',function() {ExportFile(obj)} )
}

export {ExportJson}