const ExportJson = (obj) => {


    //console.log("exportJson")
    var dlAnchorElem = document.getElementById('downloadAnchorElem');
    
    const ExportFile = (obj) =>{
    
        console.log("Exporting...")
        //GetBranches();
    
        let filename = obj.Conversation.id + ".json"
        var json = JSON.stringify(obj);
        var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(json);
        dlAnchorElem.setAttribute("href",     dataStr     );
        dlAnchorElem.setAttribute("download", filename);
    }
    
    dlAnchorElem.addEventListener('click',function() {ExportFile(obj)} )
}

export {ExportJson}