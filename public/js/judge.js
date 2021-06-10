var socket = io();

function Cargar(){
    var pin_campeonato = document.getElementById('pin_campeonato').value;
    var pin_aparato = document.getElementById('pin_aparato').value;  
    var name = document.getElementById('name').value;
   socket.emit('LoadScreen',pin_aparato,pin_campeonato,name); //Conecct
}
//Reload if pin has no match
socket.on('Confirmed', function(curr_champ,screen){
    var pin_campeonato = document.getElementById('pin_campeonato').value;
    var pin_aparato = document.getElementById('pin_aparato').value;  
    var name = document.getElementById('name').value;
    location.replace("/judge/live/" + "?pin_campeonato="+pin_campeonato+ "&pin_aparato="+pin_aparato+ "&name="+name+ "&id_juez="+socket.id);
});

//Reload if pin has no match
socket.on('noChampFound', function(){
    alert("No se encuentra Campeonato con ese pin, revise pin");
});
//Reload if pin has no match
socket.on('noScreenFound', function(){
    alert("No se encuentra Pantalla con ese pin, revise pin");
});

//If the host disconnects
socket.on('hostDisconnect', function(){
    window.location.href = '../';
});

//When the host clicks start , the screen changes
socket.on('ChampStartedPlayer', function(){
    window.location.href="/judge/live/" + "?id=" + socket.id;
});
