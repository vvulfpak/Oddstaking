$(document).ready(function(){
    function transLeft(player){
        //player 1, so we go left
        $(player.canvas)
        .transition({
            animation: 'fade right',
            duration: '.75s',
            onComplete: function(){
        //update canvas with new stats
        updateCanvas(player);
        //transition back
        $(player.canvas)
        .transition({
            animation: 'fade right',
            duration: '.75s'
        });
        }
        });
    }
    
    function transRight(player){
        $(player.canvas)
        .transition({
          animation: 'fade left',
          duration: '.75s',
          onComplete: function(){
              //update canvas with new stats
              updateCanvas(player);
            //transition back
              $(player.canvas)
            .transition({
                animation: 'fade left',
                duration: '.75s'
            });
          }
      });
    }
    
    function transitionSingle(player){
        console.log("Transitioning for player: " + playerSelected);
        if (playerSelected === 0){
            transLeft(player);
        } else if (playerSelected === 1){
            transRight(player);
        } else{
            transLeft(player);
            transRight(player);
        }
    }
    
    function transitionBoth(){
        transLeft(players.members[0]);
        transRight(players.members[1]);
    }
    
    var player1 = {
        name: "",
        items: $("div.player1.items img"),
        canvas: $("#p1"),
        context: document.getElementById('p1').getContext('2d'),
        stats: {
            attack: 99,
            strength: 99,
            defence: 99,
            hitpoints: 99
        },
        weapon: "abyssal_tentacle",
        hasta: false
    }
    
    var player2 = {
        name: "",
        items: $("div.player2.items img"),
        canvas: $("#p2"),
        context: document.getElementById('p2').getContext('2d'),
        stats: {
            attack: 99,
            strength: 99,
            defence: 99,
            hitpoints: 99
        },
        weapon: "abyssal_tentacle",
        hasta: false
        
    }
    var skills = ["attack", "strength", "defence", "hitpoints"];
    
    //object holding both players for looping purposes
    var players = {
        members: [player1, player2]
    }
    
    var playerSelected = -1;

    var worker;
    
    //loop through each member in players object, using $.each so we can keep track of index (player 1 or player 2)
    $.each(players.members, function(index, player){
        //on click handler for each item in each player object's items array
        player.items.on("click", function(){
            //remove class enabled from all items first to get the radiobutton effect
            if (!$(this).hasClass("hasta")){
                for(var i = 0; i < player.items.length; i++){
                    if (!$(player.items[i]).hasClass("hasta")){
                        $(player.items[i]).removeClass("enabled");
                    }
                }
                console.log("no hasta class");
            }
            //toggle green background
            $(this).toggleClass("enabled");
            //hasta clicked
            if ($(this).hasClass("hasta")){
                var enabled = $(this).hasClass("enabled");
                player.hasta = enabled;
                console.log("Player " + index + " hasta: " + player.hasta);
            } else{
                //normal weapons
                player.weapon = $(this).attr("value");
                console.log("Added " + ($(this)).attr("value")+ " as weapon");
            }
        });
    
        //canvas click listener to bring up the modal
        player.canvas.on("click", function(){
            $('.ui.basic.modal')
            .modal('setting', 'closable', false)
            .modal('show');
            //store player index so we can use it outside this each loop
            playerSelected = index;
            console.log("player: " + playerSelected);
        });
    
    });
    
    $("#calculate").on("click", function(){
        calculate();
    });
    
    //modal submit button
    $("#submit").on("click", function(){
        var trans = true;
        var manInputs = $("input.manstat");
        $.each(manInputs, function(index, input){
            var skill = skills[index];
            var value = $(input).val();
            if (isAcceptable(value)){
                players.members[playerSelected].stats[skill] = value;
                //only transition if inputs are acceptable
            } else{
                console.log("NOT ACCEPTABLE");
                trans = false;
            }
            //clear inputs
            $(input).val("");
            switch(playerSelected){
                case 0:
                    $("#p1Name").val("");
                    player1.name = "";
                    break;
                case 1:
                    player2.name = "";
                    $("#p2Name").val("");
                    break;
            }
        });
        //only transition if all inputs were valid
        if (trans){
            transitionSingle(players.members[playerSelected]);
            playerSelected = -1;
        }
    });
    
    $("#p1Name").on("blur", function(){
        player1.name = $(this).val();
        sendSingle(player1.name, 0);
    });
    
    $("#p2Name").on("blur", function(){
        player2.name = $(this).val();
        sendSingle(player2.name, 1);
    });
    
    //check if manually inputted value is acceptable
    function isAcceptable(value){
        if (value.length > 2 || value.length === 0){
            return false;
        }
        //if value cant be parsed, its not  an int
        var result = parseInt(value);
        if (isNaN(result)){
            return false;
        }
        return true;
    }
    
    //update the canvas with new stats
    function updateCanvas(player){
    
        var context = player.context;
    
        var p = new Image();
    
        var att = parseInt(player.stats.attack);
        var str = parseInt(player.stats.strength);
        var def = parseInt(player.stats.defence);
        var hp = parseInt(player.stats.hitpoints);
    
        var ttl = att + str + def + hp;
    
        p.src = '/stats.png';
        p.onload = function(){
        context.drawImage(this, 0,0, this.width, this.height);
        context.font = '15px RuneScape UF Regular';
        context.shadowOffsetX = 2;
        context.shadowOffsetY = 1;
        context.shadowColor = "rgba(0,0,0,0.5)";
        context.fillStyle = '#f9f90a';
        //ATT
        context.fillText(player.stats.attack, 35, 15);
        context.fillText(player.stats.attack, 48, 25);
        //STR
        context.fillText(player.stats.strength, 35, 47);
        context.fillText(player.stats.strength, 48, 57);
        //DEF
        context.fillText(player.stats.defence, 35, 79);
        context.fillText(player.stats.defence, 48, 89);
        //HP
        context.fillText(player.stats.hitpoints, 98, 15);
        context.fillText(player.stats.hitpoints, 111, 25);
        //TTL
        context.font = '12px RuneScape UF Regular';
        context.fillText(ttl, 151, 250);
        };
    
        // playerSelected = -1;
    }
    
    //initial canvas creation
    function init(){
        
    
        worker = new Worker('/js/worker.js');
        worker.addEventListener('message', function(e){
            console.log(e.data);
        });


        for(var i = 0; i < 2; i++){
            updateCanvas(players.members[i]);
        }
    }
    
    function sendSingle(name, num){
        if (name.length <= 0){
            return;
        }
        var data = {name: name, num: num};
        var req = new XMLHttpRequest();
        var url = '/';
        
        req.open('POST', url, true);
        req.addEventListener('load',onLoad);
        req.addEventListener('error',onError);
        
        req.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        //send data object with player names included
        req.send(JSON.stringify(data));
    }
    
    function onLoad() {
       var response = this.responseText;
       var parsedResponse = JSON.parse(response);
    
       var playerData = parsedResponse['playerData'];
       var num = parsedResponse['num'];
    
     
        players.members[num].stats.attack = playerData.stats.attack;
        players.members[num].stats.strength = playerData.stats.strength;
        players.members[num].stats.defence = playerData.stats.defence;
        players.members[num].stats.hitpoints = playerData.stats.hitpoints;
    
        switch(num){
            case 0:
                transLeft(players.members[0]);
                break;
            case 1:
                transRight(players.members[1]);
                break;
        }
    
    }
    
    function onError() {
      console.log('error receiving async AJAX call');
    }
    
    
    function calculate(){
        
    
        var temp = {
            player1: {
                name: players.members[0].name,
                stats: players.members[0].stats,
                weapon: players.members[0].weapon,
                hasta: players.members[0].hasta
            },
            player2: {
                name: players.members[1].name,
                stats: players.members[1].stats,
                weapon: players.members[1].weapon,
                hasta: players.members[1].hasta
            }
        }
        
        worker.postMessage(temp);
    }
    
    
    
    init();
});

