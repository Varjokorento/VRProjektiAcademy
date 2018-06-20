var req = new XMLHttpRequest();
var kaupunkiennimet = [];
var kaupunkienkoodit = [];
var asematKoordinaatit = new Map();
var asemat = new Map();

function alustaSivu() {



    function haeNimet() {
        req.open("GET", "https://rata.digitraffic.fi/api/v1/metadata/stations", true);
        req.send(null);
    }

    haeNimet();

    req.onreadystatechange = function () {
        if (req.readyState === 4) {
            if (req.status === 200) {
                var obj = JSON.parse(req.responseText);
                teeAsemistaArray(obj);
            } else {
                alert("Pyyntö epäonnistui");
            }
        }
    }

    function teeAsemistaArray(obj) {
            for(var x=0; x < obj.length; x++) {
                var asema = obj[x];
                var asemannimi = asema.stationName.toString();
                var asemankoodi = asema.stationShortCode.toString();
                var asemanKoordinaatit = asema.latitude + ", " + asema.longitude;
                asematKoordinaatit.set(asemannimi, asemanKoordinaatit);
                if (asema.passengerTraffic == true) {
                    kaupunkiennimet.push(asemannimi);
                    kaupunkienkoodit.push(asemankoodi);
                    asemat.set(asemannimi,
                        asemankoodi
                    );
                }
            }
    }

    var options = {
            data: kaupunkiennimet,
            list: {
                maxNumberOfElements: 5,
                match:
                    {
                        enabled: true
                    }
            }
        };

    $("#kaupunki").easyAutocomplete(options);

    var options2 = {
            data: kaupunkiennimet,
            list: {
                maxNumberOfElements: 5,
                match:
                    {
                        enabled: true
                    }
            }
        }
    ;

    $("#kohdekaupunki").easyAutocomplete(options2);
    document.getElementById("loader").style.display = "none";
}


alustaSivu();