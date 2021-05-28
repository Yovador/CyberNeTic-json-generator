const AddZoom = (div) => {
    panzoom(div, {
        //Désactive le zoom en double cliquant
        zoomDoubleClickSpeed: 1, 
        beforeMouseDown: function(e) {
            // allow mouse-down panning only if altKey is down. Otherwise - ignore
            var shouldIgnore = !e.altKey;
            return shouldIgnore;
        }
      })
}

export default AddZoom;