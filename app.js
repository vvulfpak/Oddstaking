var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var osrs = require("osrs-wrapper");
var request = require("request");



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static("public"));


app.get("/", function(req, res){
    res.render("index");
});

var baseURL = "https://services.runescape.com/m=hiscore_oldschool/index_lite.ws?player=";
var SKILLS = ["attack", "strength", "defence", "hitpoints"];

function swapArrayElements(arr, indexA, indexB){
    var temp = arr[indexA];
    arr[indexA] = arr[indexB];
    arr[indexB] = temp;
    return arr;
}

function parseStats(body){
    var final = {stats: {}};
    var trim = body.split('\n');
    var limit = 4;
    var stats = [];

    trim.forEach(function(el){
        var split = el.split(',');
        var level = split[1];
        stats.push(level);
    });

    //take off first entry which is the total level
    stats.shift();
    stats = swapArrayElements(stats, 1, 2);
    
    for(var i = 0; i < limit; i++){
            final.stats[SKILLS[i]] = parseInt(stats[i]);
    }
    return final;

}

var lookup = function check(name, callback){
    var url = baseURL.concat(encodeURIComponent(name));
    request(url, function(err, res, body){
        if (err){
            console.log("Username not found or something has gone wrong..");
            return;
        }
        var statusCode = res.statusCode;
        switch(statusCode){
            case 200:
                var temp = parseStats(body);
                return callback(null, parseStats(body));
            case 404:
                console.log("Player not found");
                break;
            default:
                console.log(statusCode);
        }
    });
}


app.post("/", function(req, res){
    var name = req.body.name;;
    var num = req.body.num;

    var playerData;

    //do hiscore stuff
        if (name.length > 0){
            lookup(name, function(err, stats){
                playerData = stats;
            });
        }
        
        setTimeout(function(){
            //send stats as response
            var data = {'playerData': playerData, num: num};
        
            var JSONdata = JSON.stringify(data);
            // console.log("Sending back: " + JSONdata);
            res.send(JSONdata);

        }, 3000);//wait for object to populate, hiscore response seems to be quite slow

});

app.post("/live", function(req, res){
    var x = req.body.x;
    var mems = req.body.players;
    setTimeout(function(){
        console.log("__________________________________________________________________________________");
        console.log("=\t NAMES: \t" + mems.player1.name + "\t\t\t" + mems.player2.name + " \t\t =");
        console.log("=\t ATTACK: \t" + mems.player1.stats.attack + "\t\t\t\t" + mems.player2.stats.attack + " \t\t\t =");
        console.log("=\t STRENGTH: \t" + mems.player1.stats.strength + "\t\t\t\t" + mems.player2.stats.strength + " \t\t\t =");
        console.log("=\t DEFENCE: \t" + mems.player1.stats.defence + "\t\t\t\t" + mems.player2.stats.defence + " \t\t\t =");
        console.log("=\t HITPOINTS: \t" + mems.player1.stats.hitpoints + "\t\t\t\t" + mems.player2.stats.hitpoints + " \t\t\t =");
        console.log("=\t WEAPON: \t" + mems.player1.weapon + "\t\t" + mems.player2.weapon + " \t =");
        console.log("=\t HASTA: \t" + mems.player1.hasta + "\t\t\t\t" + mems.player2.hasta + " \t\t\t =");
        console.log("=\t X: \t\t\t" + x + " \t\t\t\t =");
        console.log("----------------------------------------------------------------------------------");
    }, 1500);
});

app.listen(3000, function(){
    console.log("Oddstaking app.js hosted on port 3000");
});