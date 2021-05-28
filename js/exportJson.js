const ExportJson = (obj, fileName) => {


    var dlAnchorElem = document.getElementById('downloadAnchorElem');
    
    const ExportFile = (obj) =>{
    
        console.log("Exporting...")
        console.log(obj)
        let fileNameFull = fileName + ".json"
        console.log(fileNameFull)
        var json = JSON.stringify(obj);
        var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(json);
        dlAnchorElem.setAttribute("href",     dataStr     );
        dlAnchorElem.setAttribute("download", fileNameFull);
    }
    
    dlAnchorElem.addEventListener('click',function() {ExportFile(obj)} )
}

export default ExportJson