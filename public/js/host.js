var socket = io();
var pin_campeonato=0;

//Extraer Admin de la cookie
    if( document.cookie.lenght!=0){
    var cockie_Array= document.cookie.split(";");
    var params = jQuery.deparam(window.location.search);
    }
    var admin_Array= cockie_Array[0].split("=");
    var admin_id=admin_Array[1];
    console.log("ID ADMIN="+ admin_id);//TEST

//When host connects to server
socket.on('connect', function() {
    socket.emit('requestCampeonatosNames',admin_id);
});

socket.on('campeonatoNamesData', function(campeonato){
    for(var i = 0; i < campeonato.length; i++){  
        var div = document.getElementById('list_campeonatos');
        var button = document.createElement('button');
        button.innerHTML = campeonato[i].name;
        button.setAttribute('onClick', "ElegirCampeonato('" + campeonato[i].id + "','"+campeonato[i].name+"')");
        button.setAttribute('class', 'CampButton');
        div.appendChild(document.createElement('br'));
        div.appendChild(button);
    }
});

function ElegirCampeonato(id_campeonato) {
    var del_element = document.getElementById("list_campeonatos");
        del_element.remove();
        document.getElementById("events").style.display = "block";
        
        document.getElementById("start").style.display = "block";
        socket.emit('InicializarCampeonato',id_campeonato);
       
}

socket.on('showHostPin', function(data){
    pin_campeonato=data.pin;
   // location.replace("/host/live/" + "?pin_campeonato="+pin_campeonato+ &id_host="+socket.id);
   document.getElementById('EventPinText').innerHTML = "Pin de Campeonato = "+pin_campeonato;
});

//Añade el nombre de las pantallas a la lista
socket.on('updateHostLobby', function(data){
    document.getElementById('events').value = "";
    console.log("UPDATE");
    console.log(data);
    for(var i = 0; i < data.length; i++){
        document.getElementById('events').value += data[i].name + " ---- PIN="+data[i].pin_pantalla;
        if(data[i].juez_asociado){
            document.getElementById('events').value +=" ---- Juez="+data[i].juez_asociado ;
        }
        document.getElementById('events').value +="\n";
    }
});

//Tell server to start game if button is clicked
function startEvent(){
    if (confirm('¿Esta seguro de comenzar el campeonato?')) {
        // Save it!
        socket.emit('startChampionship',pin_campeonato);
      } else {
        // Do nothing!
      }
    
}
function endEvent(){
    if (confirm('¿Esta seguro de terminar el campeonato?')) {
        socket.emit('endChampionship',pin_campeonato);
        window.location.href = "/";
      } else {
        // Do nothing!
      }
    }

//When server starts the game
socket.on('Start', function(id){
    document.getElementById("cancel").style.display = "block";
    document.getElementById('Message').innerHTML = "Campeonato en curso, mantener esta pagina abierta";
    document.getElementById('start').style.display = 'none';
    console.log('Campeonato Comenzado');
});
socket.on('End', function(){
    document.getElementById('Message').innerHTML = "Campeonato Finalizado, puede calcular puntajes";
    console.log('Campeonato Terminado');
});

socket.on('noGameFound', function(){
   window.location.href = '../../';//Redirect user to 'join game' page
});