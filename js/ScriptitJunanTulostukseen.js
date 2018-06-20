var req2 = new XMLHttpRequest();
var juna;
var aika;

function haeTiedot() {
        var input = document.getElementById("kaupunki").value;
        var input2 = document.getElementById("kohdekaupunki").value;
        console.log(input);

        var lahtoasema = etsiAsemanLyhenne(input);
        var kohdeasema= etsiAsemanLyhenne(input2);
        var url = "https://rata.digitraffic.fi/api/v1/live-trains/station/" + lahtoasema +"/" + kohdeasema;
        req2.open("GET", url, true);
        req2.send(null);

        req2.onreadystatechange = function () {
            if (req2.readyState === 4) {
                if (req2.status === 200) {
                    var kaikkienjunientiedot = JSON.parse(req2.responseText);
                    tulostaJunantiedot(kaikkienjunientiedot);
                } else {
                    alert("Pyyntö epäonnistui");
                }
            }
        }
}



function etsiAsemanLyhenne(input) {
    return asemat.get(input);
}


function tulostaJunantiedot(kaikkienjunientiedot) {

    document.getElementById("loader").style.display = "block";

    var list = document.createElement('ol');
    for (var x = 0; x < 100; x++) {
        juna = kaikkienjunientiedot[x];
        if (juna === undefined) {
            alert("Asemilla ei suoraa yhteyttä. Odota v2 lanseerausta keväällä 2020");
            break;
        }
        var item = document.createElement('li');

        aika = new Date(juna.timeTableRows[0].scheduledTime);
        var optiot = {hour: "2-digit", minute: '2-digit', hour12: false};
        if (5 === 5) {
            item.appendChild(document.createTextNode((
                "Junan tyyppi: "
                + juna.trainType
                + juna.trainNumber
                + " Junan lähtöaika: "
                + aika.toLocaleTimeString("fi", optiot)
                + " Junan lähtöpäivä: "
                + aika.toLocaleDateString().substring(0,5)
                + " Millainen juna: "
                + juna.trainCategory)));
            list.appendChild(item);
            document.getElementById('lahtevanJunanTiedot').appendChild(list);
            break;
        }
    }
    document.getElementById("loader").style.display = "none";
}


function puhdistasivu() {

    while (lahtevanJunanTiedot.firstChild) {
        lahtevanJunanTiedot.removeChild(lahtevanJunanTiedot.firstChild);
    }

    while (yhteysJunanTiedot.firstChild) {
        yhteysJunanTiedot.removeChild(yhteysJunanTiedot.firstChild);
    }
}

//TODO: MODAL HOW TO CSSMODALS

function avaaReitintiedot() {

    var tiedot = document.createElement('p')
    var tekstit = document.createTextNode(juna.trainType +
    juna.trainCategory + juna.trainNumber + aika.toLocaleString());
    tiedot.appendChild(tekstit);
    alert(tiedot);
}











