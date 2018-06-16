
var req = new XMLHttpRequest();
var req2 = new XMLHttpRequest();
var asemat = new Map();
var kaupunkiennimet = [];
var asematKoordinaatit = new Map();
var osoitteet = new Map();



function alustaSivu() {

    function haeNimet() {

        req2.open("GET", "https://rata.digitraffic.fi/api/v1/metadata/stations", true);
        req2.send(null);

    }

    haeNimet();

    req.onreadystatechange = function () {
        if (req.readyState === 4) {
            if (req.status === 200) {
                var obj = JSON.parse(req.responseText);
                tulostaJunienTiedot(obj);
            } else {
                alert("Pyyntö epäonnistui");
            }
        }
    }

    req2.onreadystatechange = function () {
        if (req2.readyState === 4) {
            if (req2.status === 200) {
                var obj = JSON.parse(req2.responseText);
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
            kaupunkiennimet.push(asemannimi);
            asemat.set(asemannimi,
                asemankoodi
            );
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
            }
        ;

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

        $("#map").googleMap({
            zoom: 10, // Initial zoom level (optional)
            coords: [60.1699, 24.9384], // Map center (optional)
            type: "ROADMAP" // Map type (optional)
        });

    }

}

alustaSivu();

function tulostaJunienTiedot(obj) {

    while (junientiedot.firstChild) {
        junientiedot.removeChild(junientiedot.firstChild);
    }

    var list = document.createElement('ol');
    for (var x = 0; x < 5; x++) {
        var juna = obj[x];
        var item = document.createElement('li');
        item.classname = "listanosa";
        var aika = new Date(juna.timeTableRows[0].scheduledTime);
        var optiot  = {hour: "2-digit", minute: '2-digit', hour12: false};
            item.appendChild(document.createTextNode((
                  "Junan tyyppi: "
                + juna.trainType
                + juna.trainNumber
                + " Junan lähtöaika: "
                + aika.toLocaleTimeString("fi", optiot)
                + " Millainen juna: "
                + juna.trainCategory)));
            list.appendChild(item);

    }
    document.getElementById('junientiedot').appendChild(list);
}


function etsiAsemanLyhenne(input) {
    return asemat.get(input);
}


/*Tämä kohta johtuu siitä, että Google API on asynkroninen, joten asiat tapahtuvat meidän tarkoitusten takia väärässä järjestyksessä. Tämä funktio siis ns. "alustaa" postiosoitteen löytämisen.
Jos tätä ei ole käyttäjä joutuu klikkaamaan kaksi kertaa hakupalkkia.
TODO TÄMÄN KORJAAMINEN NIIN, ETTÄ TÄTÄ EI TARVITA
 */


function etsiPostiOsoiteonMouseOver() {


    var geocoder = new google.maps.Geocoder;

    var input = document.getElementById("kaupunki").value;
    var input2 = document.getElementById("kohdekaupunki").value;

    var koordinaatit2 = asematKoordinaatit.get(input2);

    var latLongKohde = koordinaatit2.split(',', 2);

    var latitudeKohde = latLongKohde[0];
    var longitudeKohde = latLongKohde[1];

    var kohdeKaupunginKoordinaatit = [parseFloat(latitudeKohde), parseFloat(longitudeKohde)];


    var lahtoKaupunginKoordinaatit = asematKoordinaatit.get(input);

    var latlngStr = lahtoKaupunginKoordinaatit.split(',', 2);
    var latlng = {lat: parseFloat(latlngStr[0]), lng: parseFloat(latlngStr[1])};
    geocoder.geocode({'location': latlng}, function (results, status) {
        var tieto = results[0].formatted_address;
        osoitteet.set(1, tieto);
    });

    $("#map").addWay({

        start: osoitteet.get(1), // Postal address for the start marker (obligatory)
        end:  kohdeKaupunginKoordinaatit, // Postal Address or GPS coordinates for the end marker (obligatory)
        route : 'train', // Block's ID for the route display (optional)
        language : 'english' // language of the route detail (optional)
    });
}



function haeTiedot() {

    var input = document.getElementById("kaupunki").value;
    var input2 = document.getElementById("kohdekaupunki").value;


    $("#map").googleMap({
        zoom: 10, // Initial zoom level (optional)
        coords: [60.1699, 24.9384], // Map center (optional)
        type: "ROADMAP" // Map type (optional)
    });



    var lahtoasema = etsiAsemanLyhenne(input);
    var kohdeasema= etsiAsemanLyhenne(input2);
    var url = "https://rata.digitraffic.fi/api/v1/live-trains/station/" + lahtoasema +"/" + kohdeasema;
    req.open("GET", url, true);
    req.send(null);


    var geocoder = new google.maps.Geocoder;
    var lahtoKaupunginNimi = document.getElementById("kaupunki").value;


    etsiPostiOsoite();

    function etsiPostiOsoite() {

        var lahtoKaupunginKoordinaatit = asematKoordinaatit.get(lahtoKaupunginNimi);
        var latlngStr = lahtoKaupunginKoordinaatit.split(',', 2);
        var latlng = {lat: parseFloat(latlngStr[0]), lng: parseFloat(latlngStr[1])};
        geocoder.geocode({'location': latlng}, function (results, status) {
            var tieto = results[0].formatted_address;
            osoitteet.set(1, tieto);
        });
    }

    //luodaan lahtöaseman koordinaatit
    var koordinaatit = asematKoordinaatit.get(input);

    var latLong = koordinaatit.split(',', 2);

    var latitude = latLong[0];
    var longitude = latLong[1];


    var lahtoKaupunginKoordinaatit = [parseFloat(latitude), parseFloat(longitude)];

    //luodaan toinen markeri
    var koordinaatit2 = asematKoordinaatit.get(input2);

    var latLongKohde = koordinaatit2.split(',', 2);

    var latitudeKohde = latLongKohde[0];
    var longitudeKohde = latLongKohde[1];

    var kohdeKaupunginKoordinaatit = [parseFloat(latitudeKohde), parseFloat(longitudeKohde)];

    //lisätään reitti karttaan
    $("#map").addWay({

        start: osoitteet.get(1), // Postal address for the start marker (obligatory)
        end:  kohdeKaupunginKoordinaatit, // Postal Address or GPS coordinates for the end marker (obligatory)
        route : 'train', // Block's ID for the route display (optional)
        language : 'english' // language of the route detail (optional)
    });


}

