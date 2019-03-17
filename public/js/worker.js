var SLASH = {
    "abyssal_whip": 82,
    "abyssal_tentacle": 90,
    "dragon_scimitar": 67
}

var STRENGTH = {
    "abyssal_whip": 82,
    "abyssal_tentacle": 86,
    "dragon_scimitar": 66
}

var HASTA = {
    true: 13,
    false: 0
}

function Player(attack, strength, defence, hitpoints, pid, weapon, hasta){
    this.attack = attack;
    this.strength = strength;
    this.defence = defence;
    this.hitpoints = hitpoints;
    this.pid = pid;
    this.weapon = weapon;
    this.hasta = hasta;
}

Player.prototype.takeDamage = function(damage){
    this.hitpoints -= damage;
}

var x;

var p1, p2;

// var loops = 200000;
var loops = 100000;

var p1Wins = 0, p2Wins = 0;

var winner = 0; //1 = p1, 2 = p2

var maxHit;

var attRoll, defRoll;

var chanceTemp;
var chance;
var chanceRoll;

function send(add){
    console.log("IN SEND");
    var data = {x: x, players: add};
    var req = new XMLHttpRequest();
    var url = '/live';
    
    req.open('POST', url, true);
    
    req.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    //send data object with player names included
    req.send(JSON.stringify(data));
}

self.addEventListener('message', function(e){
    var mems = e.data;
    simulate(mems);
    self.postMessage(x);
    send(mems);
    // self.close();
});

function simulate(members){
    var mem1 = members.player1;
    var mem2 = members.player2;

    p1Wins = 0;
    p2Wins = 0;

    for(var i = 0; i < loops; i++){

        var pid;
        var ran;
        ran = Math.round(Math.random(1 + 1));
        var p = (ran==1) ? true: false;
        p1 = new Player(parseInt(mem1.stats.attack), parseInt(mem1.stats.strength), parseInt(mem1.stats.defence), parseInt(mem1.stats.hitpoints), p, mem1.weapon, mem1.hasta);
        p2 = new Player(parseInt(mem2.stats.attack), parseInt(mem2.stats.strength), parseInt(mem2.stats.defence), parseInt(mem2.stats.hitpoints), !p, mem2.weapon, mem2.hasta);

        // console.log(p1);
        // console.log(p2);

        if (p1.pid == true){
            pid = 1;
        } else{
            pid = 2;
        }
        
        if (pid == 1){
            while (p1.hitpoints > 0 && p2.hitpoints > 0){
                if (checkDead())
                    break;
                whack(p1,p2);
                if (checkDead())
                    break;
                whack(p2, p1);
                if (checkDead())
                    break;
            }
        } else{
            while (p1.hitpoints > 0 && p2.hitpoints > 0){
                if (checkDead())
                    break;
                whack(p2,p1);
                if (checkDead())
                    break;
                whack(p1, p2);
                if (checkDead())
                    break;
            }
        }

    }
    console.log(p1Wins, p2Wins);
        evaluate();
}

function evaluate(){
    if (p1Wins < p2Wins){
        x = (p1Wins * 10) / p2Wins;
    } else {
        x = (p2Wins * 10) / p1Wins;
    }
    x = 10/x;
    // console.log(x);
}

function checkDead(){
    if (p1.hitpoints <= 0 || p2.hitpoints <= 0){
        if (p1.hitpoints <= 0){
            winner = 2;
        } else if (p2.hitpoints <= 0){
            winner = 1;
        }

        if (winner == 1){
            p1Wins++;
        } else if (winner == 2){
            p2Wins++;
        }
        return true;
    }
    return false;
}

function whack(player1, player2){
    chanceTemp = hitChance(player1, player2);
    chance = Math.floor(chanceTemp);

    
    chanceRoll = Math.floor((Math.random() * 100) + 1);

    if (chanceRoll <= chance){
        hit(player1, player2);
    }
}

function hit(player1, player2){
    maxHit = rollMaxHit(player1.strength);
    player2.takeDamage(maxHit);
}

function rollMaxHit(strLvl){
    var max;
    if (strLvl == 96 || strLvl == 92 || strLvl == 87 || strLvl == 83 || strLvl == 79){
        max = Math.floor(0.5 + (strLvl + 1.0  + 8.0) * (86.0 + 64) / 640.0); //+1 for aggressive
    } else{
        max = Math.floor(0.5 + (strLvl + 8.0) * (86.0 + 64.0) / 640.0);
    }

    var ranHit = Math.floor((Math.random() *  max) + 1);
    return ranHit;
}

function hitChance(player1, player2){
    var accuracy;
    rollAccuracy(player1, player2);

    if (attRoll > defRoll){
        accuracy = 1 - (defRoll + 2) / (2 * (attRoll + 1));
    } else{
        accuracy = attRoll / (2 * (defRoll + 1));
    }
    return accuracy * 100;
}


function rollAccuracy(player1, player2){
    var wepBonus = SLASH[player1.weapon];
    var defBonus = HASTA[player2.hasta];

    attRoll = Math.random(player1.attack + 3 + 8) * (wepBonus + 64) + 1;
    defRoll = Math.random(player2.defence + 3 + 8) * (defBonus + 64) + 1;
}