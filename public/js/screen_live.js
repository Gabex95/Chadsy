var socket = io();
var showing_score=false;
var nombre_aparato;
var started=false
//Al conectar con servidor
socket.on('connect', function() {
    
    var params = jQuery.deparam(window.location.search); //Gets data from url
    
    socket.emit('screen-join',params);
    socket.emit('generatePinScreen',socket.id,params.id_pantalla,params.pin_campeonato);
});

socket.on('setScreenPin', function(screenPin,status,nombre){
    nombre_aparato=nombre
    if(status.localeCompare("started")== 0){   
        started=true;
        document.getElementById('EventPinText').innerHTML ="";
        }
        else 
        {document.getElementById('title').innerHTML = '\nAparato '+nombre_aparato;
         document.getElementById('EventPinText').innerHTML = '\n'+screenPin;
        }
});


socket.on('JudgeConected', function(name){
    document.getElementById('title').innerHTML = nombre_aparato;
    document.getElementById('EventPinText').innerHTML = 'Esperando Comienzo de Campeonato';
    if (started){
        document.getElementById('title').innerHTML = "";
        document.getElementById('EventPinText').innerHTML =""
    }
});


socket.on('Start', function(){
    started=true;
    document.getElementById('EventPinText').innerHTML="";
    document.getElementById('title').innerHTML ="";
    document.body.className="bgSizeCover";
});

socket.on('End', function(){  
    document.getElementById('display').innerHTML ="Campeonato Terminado"; 
});

socket.on('noChampFound', function(){
    alert("No se encuentra campeonato , contacte al administrador ");
    window.location.href = '../';
});

socket.on('PuntajeIngresado', function(nombre_aparato,nombre_categoria,nombre_equipo,nombre_participante,puntaje){
   
    document.getElementById('display').style.display = 'block';
    //document.getElementById('aparato').innerHTML =("Aparato:"+nombre_aparato);
    document.getElementById('categoria').innerHTML =("Categoria: "+nombre_categoria);
    document.getElementById('equipo').innerHTML =("Colegio:"+nombre_equipo);
    document.getElementById('participante').innerHTML =(""+nombre_participante);
    document.getElementById('puntaje').innerHTML =(puntaje);
    if (showing_score==false){
        showing_score=true;
        setTimeout(function(){
        showing_score=false;
        document.getElementById('display').style.display = 'none';
         },35000);
    }
    
});