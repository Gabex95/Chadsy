var socket = io();

function CargarEventos(){
    var pin = document.getElementById('pin').value;
    socket.emit('requestEventsNames',pin);//Get database names to display to user
}


socket.on('eventosNamesData',function(eventos) {
     document.getElementById("AcceptButton").remove();
    document.getElementById("pin").readOnly = true;
    document.getElementById("title").innerHTML = "¡Elegir Aparato!";
    for(var i = 0; i < eventos.length; i++){  
        var div = document.getElementById('lista_eventos');
        var button = document.createElement('button');
        button.innerHTML = eventos[i].name;
        button.className = "select"; 
        button.setAttribute('onClick', "IniciarPantalla(" + eventos[i].id_evento + ")");
        div.appendChild(button);
    }
    
});
function IniciarPantalla(id_evento){
    var pin = document.getElementById('pin').value;
    location.replace("/screen/live/" + "?pin_campeonato=" + pin+"&id_evento="+id_evento+"&id_pantalla="+socket.id);
}
//Boot  back to main screen if game pin has no match
socket.on('noChampFound', function(){
    alert("No se encuentra campeonato");
});

//If the host disconnects
socket.on('hostDisconnect', function(){
    //window.location.href = '../';
});

//When the host clicks start , the screen changes
socket.on('ChampStartedPlayer', function(){
    window.location.href="/screen/champ/" + "?id=" + socket.id;
});
