var express = require('express');
var router = express.Router();
var asemat = new Map();
var kaupunkiennimet = [];
var kaupunkienkoodit= [];
var asematKoordinaatit = new Map();
const fetch = require('node-fetch');

router.get('/', function(req,res) {
    var stations = new Map();
    fetch("https://rata.digitraffic.fi/api/v1/metadata/stations")
        .then(res => res.json())
        .then(json => teeAsemistaArray(json))
        .then(() => res.render("index",{error: ""}));
});


router.post('/junat', function(req, res) {
    findTrainData(req, res)});

function findTrainData(req, res, callback) {
    var originCity = req.body.originCity;
    var originCityShortCode = asemat.get(originCity);

    var targetCity = req.body.targetCity;
    var targetCityShortCode = asemat.get(targetCity);
    var howManyResults = req.body.howManyResults;
    console.log(howManyResults);
    if(originCityShortCode == null || targetCityShortCode == null) {
        res.render("index", {error:"Nothing found!"})
    }
    var url = "https://rata.digitraffic.fi/api/v1/live-trains/station/" + originCityShortCode + "/" + targetCityShortCode;
    fetch(url)
            .then(res => res.json())
            .then(json => limittheResults(json, howManyResults))
            .then(json => res.render("traininformation", {array: json}));

}

function limittheResults(obj, howManyResults) {

    if(howManyResults == "") {
        howManyResults = 5;
    }
    if(howManyResults > obj.length) {
        howManyResults = obj.length;
    }
    var array = [];
    for(var i = 0; i < howManyResults; i++ ) {
        array.push(obj[i]);
    }
    return array;
}


function teeAsemistaArray(obj) {
        var stations = new Map();
        for (var x = 0; x < obj.length; x++) {
            var asema = obj[x];
            var asemannimi = asema.stationName.toString();
            var asemankoodi = asema.stationShortCode.toString();
            var asemanKoordinaatit = asema.latitude + ", " + asema.longitude;
            asematKoordinaatit.set(asemannimi, asemanKoordinaatit);
            if (asema.passengerTraffic == true) {

                kaupunkiennimet.push(asemannimi);
                kaupunkienkoodit.push(asemankoodi);
                stations.set(asemannimi,
                    asemankoodi
                );
            }
        }
        // console.log(stations);
        asemat = stations;
        return stations;

    }



module.exports = router;