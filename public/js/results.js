var socket = io();
var loaded, catloaded=false;
var loadcount=0
var id_campeonato=0;
var categoria_count=0;
var evento_count=0;
var equipo_count= 0;
var participante_count= 0;
var lista_eventos=[];
var lista_categorias=[];
var lista_equipos=[];
var lista_participantes=[];
var lista_puntajes=[]

if( document.cookie.lenght!=0){
    var cockie_Array= document.cookie.split(";");
    var admin_Array= cockie_Array[0].split("=");
    var admin_id=admin_Array[1];
    console.log("ID ADMIN="+ admin_id);//TEST
}

    window.onload = function() {
       InicializarCampeonato()
    };

    function InicializarCampeonato(){
        loadcount=0;
        loaded=false;
        nav=1;
        document.getElementById('title').innerHTML="";
      //  document.getElementById('list').innerHTML="";
        console.log("SEARCHING DataBase");
        lista_eventos=[];
        lista_categorias=[];
        lista_equipos=[];
        lista_participantes=[];
        lista_puntajes=[]
        socket.emit('requestCampeonatosNames',admin_id);//Get database names to display to user
       
    }

    
socket.on('campeonatoNamesData', function(campeonato){
    document.getElementById('title').innerHTML="Seleccionar Campeonato";
      for(var i = 0; i < campeonato.length; i++){  
          var table=document.getElementById("table_campeonato").getElementsByTagName('tbody')[0];
          var newRow=table.insertRow(table.length);
          cell1=newRow.insertCell(0);
          cell1.innerHTML=campeonato[i].name;
          cell2=newRow.insertCell(1);
          var d = new Date(campeonato[i].date)
          cell2.innerHTML=(d.getDate())+"-"+(d.getMonth() + 1)+"-"+(d.getFullYear());
          cell3=newRow.insertCell(2);
          var button = document.createElement('button');
          button.innerHTML = campeonato[i].name;
          button.setAttribute('onClick', "ElegirCampeonato('" + campeonato[i].id + "','"+campeonato[i].name+"','"+campeonato[i].finalizado+"')");
          button.setAttribute('class', 'CampButton');
          button.innerHTML = "CARGAR";
          cell3.appendChild(button)
      }
  });
  
function ElegirCampeonato(id_camp,nombre,finalizado) {
    if(finalizado)
        swal({
            text:"Campeonato no ha finalizado!",
            icon:"info"
            });
    else
        swal({
            text:"Campeonato Cargado!",
            icon:"success"
            });
    id_campeonato=id_camp;
    
    document.getElementById('title').innerHTML="";
    document.getElementById('list').innerHTML="";
    CampeonatoLoaded();
}
  
function CampeonatoLoaded(){
   
document.getElementById("NavResult").style.visibility="";
document.getElementById("table_participante").style.visibility="";
socket.emit('requestEventos',id_campeonato);
socket.emit('requestEquipos',id_campeonato);
socket.emit('requestCategorias',id_campeonato);
socket.emit('requestDataParticipantes',id_campeonato);


}
socket.on('ReceiveEventos', function(list_eventos){
    loadcount++;
    
    lista_eventos=list_eventos;
    if(loadcount==4)
    $('#todos-tab').trigger('click')
});
socket.on('ReceiveCategorias', function(list_categorias){ 
    loadcount++;
    lista_categorias=list_categorias;
    //LLenar dropdown categorias
    for(var i = 0; i < lista_categorias.length; i++){
        var dropdown =document.getElementById("dropdown_categoria")
        dropdown.innerHTML +=(' <li><a class="dropdown-item" href="#" onclick=SelectCategoria('+lista_categorias[i].id_categoria+')>'+lista_categorias[i].nombre_categoria+'</a></li>')
    }
    if(loadcount==4)
    $('#todos-tab').trigger('click')
});

socket.on('ReceiveEquipos',   function(list_equipos){
    loadcount++;
    lista_equipos=list_equipos
    
    if(loadcount==4)
    $('#todos-tab').trigger('click')
});
socket.on('ReceiveDataParticipantes',  function(list_participantes){
    loadcount++;  
    lista_participantes=list_participantes  
    if(loadcount==4)
    $('#todos-tab').trigger('click')
});

socket.on('ReceivePuntajesParticipante',  function(puntajes,id){     
    var index=lista_participantes.findIndex((participante) => participante.id_participante == id);
    lista_participantes[index].puntajes=puntajes;
    lista_participantes[index].total=0;
    for(var i = 0; i < lista_eventos.length; i++){
        lista_participantes[index].total += puntajes[i].valor;
    }
    loadcount++;
    if(loadcount==lista_participantes.length)
        LlenarTablaTodos()
});
function PrepareTables(){
    //Tabla General
    var tr = document.getElementById('table_participante').tHead.children[0];
    for(var i = 0; i < lista_eventos.length; i++){
        th = document.createElement('th');
        th.style.background='blue';
        th.innerHTML =lista_eventos[i].nombre_evento;
        th.value=lista_eventos[i].id_evento;
        tr.appendChild(th);
    }
        th = document.createElement('th');
        th.style.background="blue";
        th.innerHTML ="Total";
        tr.appendChild(th);
 
       
    //Tabla de categorias
         tr = document.getElementById('table_categoria').tHead.children[0];
        for(var i = 0; i < lista_eventos.length; i++){
            th = document.createElement('th');  
            th.style.background="blue";
            th.innerHTML =lista_eventos[i].nombre_evento;
            th.id=(lista_eventos[i].nombre_evento+"_head");
            th.value=lista_eventos[i].id_evento;
            tr.appendChild(th);
        }
        th = document.createElement('th');
        th.innerHTML ="Total"
        th.style.background="blue";
        th.id=("Total_head");
        tr.appendChild(th);
        //
    loaded=true;
}


function InicializarPuntajes(){
    document.getElementById("categorias-tab").style.visibility="hidden";
    document.getElementById("categorias-tab").innerHTML="";
    if(loaded==false){
        PrepareTables()
    }
        participante_count=0;
        loadcount=0
        for(var i = 0; i < lista_participantes.length; i++){
            socket.emit('requestPuntajesParticipante',lista_participantes[i]);
        }  
}

function LlenarTablaTodos(){
    console.log(lista_participantes);
    var table=document.getElementById("table_participante");
    table.getElementsByTagName('tbody')[0].innerHTML = ''; 
        for(var i = 0; i < lista_participantes.length; i++){  
            InsertParticipanteToTable(lista_participantes[i]);
        }
    sorttable.makeSortable(table);

}
function InsertParticipanteToTable(participante){
    participante_count++;
    var table=document.getElementById("table_participante").getElementsByTagName('tbody')[0];
    var newRow=table.insertRow(table.length);
    cell1=newRow.insertCell(0);
    cell1.value=participante.id_participante;
    cell1.innerHTML=participante.nombre;
    cell2=newRow.insertCell(1);
    cell2.innerHTML=lista_categorias.find((categoria) => categoria.id_categoria == participante.categoria).nombre_categoria;
    cell2.value=participante.categoria;
    cell3=newRow.insertCell(2);
    cell3.innerHTML=lista_equipos.find((equipo) => equipo.id_equipo == participante.equipo).nombre_equipo;
    cell3.value=participante.equipo;
    cell4=newRow.insertCell(3);
    cell4.value=participante.suma_a_equipo;
    if(cell4.value)
         cell4.innerHTML="No";
    else cell4.innerHTML="Si";
    for(var i = 0; i < lista_eventos.length; i++){
        cell=newRow.insertCell(i+4);
        let tr = document.getElementById('table_participante').tHead.children[0].cells[i+4];
        let puntaje=participante.puntajes.find((puntaje) => puntaje.evento ==tr.value);
       cell.innerHTML=puntaje.valor;
    }
    cellt=newRow.insertCell( lista_eventos.length+4);
    cellt.innerHTML=participante.total;

}

function SelectCategoria(id_categoria){
       var nombre_categoria=lista_categorias.find((categoria) => categoria.id_categoria == id_categoria).nombre_categoria
    document.getElementById("title_categoria").innerHTML=("Gereral Categoria:"+nombre_categoria)
    document.getElementById("categorias-tab").style.visibility="";
    document.getElementById("categorias-tab").innerHTML=nombre_categoria;
    catloaded=false;
    
    $('#categorias-tab').trigger('click')
    InicializarCategoria(id_categoria);

}
function InicializarCategoria(id_categoria){
    participante_count=0;
        addCheckboxes()
   
    var table=document.getElementById("table_categoria");
    table.getElementsByTagName('tbody')[0].innerHTML= ''; 
        for(var i = 0; i < lista_participantes.length; i++){  
           if(lista_participantes[i].categoria==id_categoria){
             InsertParticipanteToTableCategoria(lista_participantes[i]);
            }
        }
        sorttable.makeSortable(table);
}
function InsertParticipanteToTableCategoria(participante){
    
    participante_count++;
    var table=document.getElementById("table_categoria").getElementsByTagName('tbody')[0];
    var newRow=table.insertRow(table.length);
    cell1=newRow.insertCell(0);
    cell1.value=participante.id_participante;
    cell1.innerHTML=participante.nombre;
    cell3=newRow.insertCell(1);
    cell3.innerHTML=lista_equipos.find((equipo) => equipo.id_equipo == participante.equipo).nombre_equipo;
    cell3.value=participante.equipo;
    for(var i = 0; i < lista_eventos.length; i++){
        cell=newRow.insertCell(i+2);
        let tr = document.getElementById('table_categoria').tHead.children[0].cells[i+2];
        cell.className=tr.innerHTML;
        let puntaje=participante.puntajes.find((puntaje) => puntaje.evento ==tr.value);
       cell.innerHTML=puntaje.valor;
       
    }
    cellt=newRow.insertCell( lista_eventos.length+2);
    cellt.className="Total";
    cellt.innerHTML=participante.total;

}

function addCheckboxes(){
 //Checkboxes de columnas
 document.getElementById("checkbox_div").innerHTML ='';
 var para = document.createElement("p");
 var textnode=document.createTextNode("Columnas a mostrar");
 para.appendChild(textnode);     
 document.getElementById("checkbox_div").appendChild(para)
    for(var i = 0; i < lista_eventos.length; i++){
        var node = document.createElement("li");
        textnode = document.createTextNode(lista_eventos[i].nombre_evento);
        var x = document.createElement("INPUT");
        x.id=lista_eventos[i].nombre_evento;
        x.value="hide";
        x.checked = true;
        x.setAttribute("type", "checkbox");
        x.setAttribute("onchange", "hide_show_table(this.id)");
        node.appendChild(x);    
        node.appendChild(textnode); 
        document.getElementById("checkbox_div").appendChild(node)
    }
    var node = document.createElement("li");
        textnode = document.createTextNode("Total");
        var x = document.createElement("INPUT");
        x.id="Total";
        x.value="hide";
        x.checked = true;
        x.setAttribute("type", "checkbox");
        x.setAttribute("onchange", "hide_show_table(this.id)");
        node.appendChild(x);    
        node.appendChild(textnode); 
        document.getElementById("checkbox_div").appendChild(node)

}
//Ocultar Columnas
function hide_show_table(col_name){
    var checkbox_val=document.getElementById(col_name).value;
    if(checkbox_val=="hide")
    {
     var all_col=document.getElementsByClassName(col_name);
     for(var i=0;i<all_col.length;i++)
     {
      all_col[i].style.display="none";
     }
     document.getElementById(col_name+"_head").style.display="none";
     document.getElementById(col_name).value="show";
    }
       
    else
    {
     var all_col=document.getElementsByClassName(col_name);
     for(var i=0;i<all_col.length;i++)
     {
      all_col[i].style.display="table-cell";
     }
     document.getElementById(col_name+"_head").style.display="table-cell";
     document.getElementById(col_name).value="hide";
    }
}