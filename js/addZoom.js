    const AddZoom = (div) => {
        try {
            panzoom(div, {
                //Désactive le zoom en double cliquant
                zoomDoubleClickSpeed: 1,
                beforeMouseDown: function(e) {
                    // allow mouse-down panning only if altKey is down. Otherwise - ignore
                    var shouldIgnore = !e.altKey;
                    return shouldIgnore;
                }
            })
        } catch {
            alert("Votre navigateur web ne supporte pas notre site web, veillez soit à le mettre à jour, soit à changer de navigateur (chrome, firefox ..).");
        }

        panzoom(container, {
            filterKey: function( /* e, dx, dy, dz */ ) {
                // don't let panzoom handle this event:
                return true;
            }
        });
    }



    export default AddZoom;