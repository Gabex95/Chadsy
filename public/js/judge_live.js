var socket = io();
var id_aparato=0;
var nombre_aparato="";
var pin_campeonato=0;
var loadcount=0; 
var id_campeonato=0;
var id_categoria=0;
var nombre_categoria="";
var id_equipo=0;
var nombre_equipo="";
var id_participante=0;
var nombre_participante;
var lista_participantes=[];

//Control de Navbar
$(document).ready(function(){ 
    $("#TabJuez a").click(function(e){
        e.preventDefault();
        $(this).tab('show');
    });
});
//Al conectar con servidor
socket.on('connect', function() {

    var elem = document.getElementById("page");
    toggleFullScreen(elem);   
    document.getElementById('categoria-tab').style.display = 'none';
    document.getElementById('equipo-tab').style.display = 'none'; // hide
    document.getElementById('participante-tab').style.display = 'none'; // hide
    document.getElementById('puntaje-tab').style.display = 'none'; // hide
    //parametros=pin_campeonato,pin_aparato,name,id_juez);
    var params = jQuery.deparam(window.location.search); //Gets data from url
    pin_campeonato=params.pin_campeonato
    //Decirle al servidor que se conecto un juez
   socket.emit('judge-join',params);
});

// Poner pagina en pantalla completa
function toggleFullScreen(elem) {
    // ## The below if statement seems to work better ## if ((document.fullScreenElement && document.fullScreenElement !== null) || (document.msfullscreenElement && document.msfullscreenElement !== null) || (!document.mozFullScreen && !document.webkitIsFullScreen)) {
    if ((document.fullScreenElement !== undefined && document.fullScreenElement === null) || (document.msFullscreenElement !== undefined && document.msFullscreenElement === null) || (document.mozFullScreen !== undefined && !document.mozFullScreen) || (document.webkitIsFullScreen !== undefined && !document.webkitIsFullScreen)) {
        if (elem.requestFullScreen) {
            elem.requestFullScreen();
        } else if (elem.mozRequestFullScreen) {
            elem.mozRequestFullScreen();
        } else if (elem.webkitRequestFullScreen) {
            elem.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
        } else if (elem.msRequestFullscreen) {
            elem.msRequestFullscreen();
        }
    } else {
        if (document.cancelFullScreen) {
            document.cancelFullScreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitCancelFullScreen) {
            document.webkitCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
}

socket.on('JudgeConected', function(name_judge,id_evento,name_aparato,status){
    id_aparato=id_evento;
    document.getElementById('juez').innerHTML +=(" "+name_judge);
    document.getElementById('aparato').innerHTML =(name_aparato);
    nombre_aparato=name_aparato;
    console.log(status);
    if(status.localeCompare("started")== 0){   
    document.getElementById('title').innerHTML ="";
     InicializarPagina();
    }
});

socket.on('Start', function(){ 
    
    document.getElementById('title').innerHTML =""; 
    InicializarPagina();   
});
socket.on('End', function(){ 
    
    document.getElementById('page').innerHTML ="Campeonato Terminado"; 
});


socket.on('noChampFound', function(){
    alert("No se encuentra campeonato , contacte al administrador ");
    window.location.href = '../';
});

function InicializarPagina(){
    document.getElementById('TabJuez').style.display = 'visible';
    socket.emit('requestIdCampeonato',pin_campeonato);
    document.getElementById('loader').style.display = 'none';
    document.getElementById('title').innerHTML ="<h1>Elegir Categoria</h1>";
    document.getElementById('categoria-tab').innerHTML = 'Categoría';
    document.getElementById('categoria-tab').style.display = 'block'; // hide
    document.getElementById('equipo-tab').style.display = 'none'; // hide
    document.getElementById('participante-tab').style.display = 'none'; // hide
    document.getElementById('puntaje-tab').style.display = 'none'; // hide
    document.getElementById('list').innerHTML ="";
  
}
socket.on('receiveIdCampeonato',async function(id){
    id_campeonato=id;   
    CargarCategorias();
})


function CargarCategorias(){
    socket.emit('requestCategorias',id_campeonato);
}


socket.on('ReceiveCategorias', async function(lista_categorias){
    for(var i = 0; i < lista_categorias.length; i++){  
        var div = document.getElementById('list');
        var button = document.createElement('button');
        button.innerHTML = lista_categorias[i].nombre_categoria;
        button.className = "select"; 
        button.setAttribute('onClick', "SelectCategoria('"+lista_categorias[i].id_categoria+"', '"+lista_categorias[i].nombre_categoria+"')");
        div.appendChild(button);
    }
})

function SelectCategoria(id_cate,nombre){
    id_categoria=id_cate;
    nombre_categoria=nombre;
    document.getElementById('categoria-tab').innerHTML ="Categoría= "+nombre; // hide
    document.getElementById('equipo-tab').innerHTML = 'Equipo'; // hide
    document.getElementById('equipo-tab').style.display = 'block'; // hide
    $('#equipo-tab').trigger('click')
}

function InicializarEquipo(){
    document.getElementById('list').innerHTML ="";
    document.getElementById('title').innerHTML ="<h1>Elegir Equipo</h1>";
    socket.emit('requestEquipos',id_campeonato);
}

socket.on('ReceiveEquipos', async function(lista_equipos){
    if(lista_equipos.length==0){
    document.getElementById('title').innerHTML ="<h1>Categoria no contiene Equipos</h1>";
    }
    for(var i = 0; i < lista_equipos.length; i++){  
        var div = document.getElementById('list');
        var button = document.createElement('button');
        button.innerHTML = lista_equipos[i].nombre_equipo;
        button.className = "select"; 
        button.setAttribute('onClick', "SelectEquipo('"+lista_equipos[i].id_equipo+"','"+lista_equipos[i].nombre_equipo+"')");
        div.appendChild(button);
    }
})

function SelectEquipo(id_equi,nombre){
    id_equipo=id_equi;
    nombre_equipo=nombre;
    document.getElementById('equipo-tab').innerHTML ="Equipo= "+ nombre; 
    document.getElementById('participante-tab').innerHTML = 'Participante'; 
    document.getElementById('participante-tab').style.display = 'block'; 
    $('#participante-tab').trigger('click')
}

function InicializarParticipante(){
    document.getElementById("table_participante").getElementsByTagName('tbody')[0].innerHTML="";
    document.getElementById('list').innerHTML ="";
    document.getElementById('title').innerHTML ="<h1>Elegir Participante</h1>";
    document.getElementById('puntaje-tab').style.display = 'none'; // hide
    document.getElementById('puntaje-tab').innerHTML = ""; 
    socket.emit('requestParticipantes',id_categoria,id_equipo,id_aparato);
}

socket.on('ReceiveParticipantes',async function(list_participantes){
    lista_participantes=list_participantes;
    loadcount=0; 
    for(var i = 0; i < lista_participantes.length; i++){
        socket.emit('requestPuntajeEvento',lista_participantes[i],id_aparato);
    }  
});

socket.on('ReceivePuntajeEvento', async function(puntaje,id){    
   
    var index=lista_participantes.findIndex((participante) => participante.id_participante == id);
    lista_participantes[index].puntaje=puntaje;
    loadcount++;
    if(loadcount==lista_participantes.length)
        LlenarTabla()
});

function LlenarTabla(){
    document.getElementById("table_participante").getElementsByTagName('tbody')[0].innerHTML="";
    if(lista_participantes.length==0){
    document.getElementById('title').innerHTML ="<h1>Equipo no contiene Participantes en esta categoria</h1>";
    }
    for(var i = 0; i < lista_participantes.length; i++){  
        var participante=lista_participantes[i];
        var table=document.getElementById("table_participante").getElementsByTagName('tbody')[0];
        var newRow=table.insertRow(table.length);
        cell1=newRow.insertCell(0);
        cell1.value=participante.id_participante;
        cell1.innerHTML=participante.nombre;
        cell2=newRow.insertCell(1);
        cell2.innerHTML=nombre_categoria;
        cell3=newRow.insertCell(2);
        cell3.innerHTML=nombre_equipo; 
        cell5=newRow.insertCell(3);
        var button = document.createElement('button');
        button.className = "select"; 
        button.innerHTML =participante.puntaje;
       // button.innerHTML = "Preparar Puntaje"
        button.setAttribute('onClick', "SelectParticipante('"+lista_participantes[i].id_participante+"','"+lista_participantes[i].nombre+"')");
        cell5.appendChild(button);
        
    }
}

function SelectParticipante(id_part,nombre){
    nombre_participante=nombre;
    id_participante=id_part;
    document.getElementById('puntaje-tab').style.display = 'block'; 
    document.getElementById('puntaje-tab').innerHTML = nombre; 
    $('#puntaje-tab').trigger('click')
}

function InicializarPuntaje(){
    document.getElementById('list').innerHTML ="";
    document.getElementById('title').innerHTML =("<h1>Ingrese Puntaje:</h1><br> <h3>"+(nombre_participante)+" </h3>");
    document.getElementById('puntaje').value =""; 
}

function ScoreInput(){
    var puntaje=0;
    //limpieza del puntaje, asegurar punto y dos decimales
    let value = document.getElementById('puntaje').value;
        value = value.replace(/,/g, '.') 
        value = parseFloat(value).toFixed(2)
    puntaje=value;
       //parametros=pin_campeonato,pin_aparato,name,id_juez);
       var params = jQuery.deparam(window.location.search); //Gets data from url
    socket.emit('inputPuntaje',params,id_aparato,id_participante,nombre_aparato,nombre_categoria,nombre_equipo,nombre_participante,puntaje);
    $('#participante-tab').trigger('click')

}
function Atras_participante(){
    $('#participante-tab').trigger('click')

}