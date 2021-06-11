
var edit_mode=false;
var socket = io();
var nav=0
var id_campeonato=0;
var categoria_count=0;
var evento_count=0;
var equipo_count= 0;
var participante_count= 0;
var lista_eventos=[];
var lista_categorias=[];
var lista_equipos=[];
var lista_participantes=[];


if( document.cookie.lenght!=0){
var cockie_Array= document.cookie.split(";");
var admin_Array= cockie_Array[0].split("=");
    var admin_id=admin_Array[1];
    console.log("ID ADMIN="+ admin_id);//TEST
}

window.onload = function() {
    $('#campeonato-tab').trigger('click')
 };


function InicializarCampeonato(){
    nav=1;
    console.log("SEARCHING DataBase");
    lista_eventos=[];
    lista_categorias=[];
    lista_equipos=[];
    lista_participantes=[];
    socket.emit('requestCampeonatosNames',admin_id);//Get database names to display to user
    document.getElementById("evento-tab").classList.add('disabled');
    document.getElementById("categoria-tab").classList.add('disabled');
    document.getElementById("equipo-tab").classList.add('disabled'); 
    document.getElementById("participante-tab").classList.add('disabled');
}


socket.on('campeonatoNamesData', function(campeonato){
  document.getElementById('title').innerHTML="Seleccionar Campeonato";
  document.getElementById("table_participante").getElementsByTagName('tbody')[0].innerHTML = '';
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
        button.setAttribute('onClick', "ElegirCampeonato('" + campeonato[i].id + "','"+campeonato[i].name+"')");
        button.setAttribute('class', 'CampButton');
        button.innerHTML = "CARGAR";
        cell3.appendChild(button)
    }
});

function ElegirCampeonato(id_camp,nombre) {
    id_campeonato=id_camp;
    swal({
        text:"Campeonato Cargado!",
         icon:"success"
        });
    document.getElementById('title').innerHTML="";
    
    document.getElementById("evento-tab").classList.remove('disabled');
    document.getElementById("categoria-tab").classList.remove('disabled');
    document.getElementById("equipo-tab").classList.remove('disabled'); 
    document.getElementById("participante-tab").classList.remove('disabled');
    $('#evento-tab').trigger('click')
  }

socket.on('CargarCampeonato', function(id_camp){
    id_campeonato=id_camp;
    swal({
        text:"Campeonato Cargado!",
         icon:"success"
        });
    });


///EVENTO///
function InicializarEvento(){
    nav=2;
    socket.emit('requestEventos',id_campeonato);
}

socket.on('ReceiveEventos',async function(list_eventos){
    lista_eventos=list_eventos;
    if(nav==2){
        Insert_Form_Eventos()
        }
    });


function Insert_Form_Eventos(){
    document.getElementById("button_evento").innerHTML="";
    document.getElementById("form_evento").innerHTML="";
    evento_count= 0;
    var max_fields = 10;
    var wrapper = $("#form_evento");
    $(wrapper).append(  '<label for="evento_nombre_0">Nombre</label>')
    for(var i = 0; i < lista_eventos.length; i++){  

        evento_count++;
        $(wrapper).append('<div><div style="float:left;margin-right:20px;"><input type="text" value="'+lista_eventos[i].nombre_evento +'" name="evento_nombre_'+(evento_count-1)+'"></div> <a href="#" class="delete">  Eliminar</a><br style="clear:both;"></div>'); //add input box
    }
    var add_button = $(".add_form_field_evento");
    $(document).ready(function() {
            $(add_button).off().on('click',function(e) {
                e.preventDefault();
                if (evento_count < max_fields) {
                    evento_count++;
                    $(wrapper).append('<div><div style="float:left;margin-right:20px;"><input type="text"  name="evento_nombre_'+(evento_count-1)+'"></div> <a href="#" class="delete">  Eliminar</a><br style="clear:both;"></div>'); //add input box
                } else {
                    swal({
                        title: "Error",
                        text: "Maximo de eventos!",
                        icon: "warning",
                      })
                    }
            });
            $(wrapper).on("click", ".delete", function(e) {
                e.preventDefault();
                $(this).parent('div').remove();
                evento_count--;
            })   
            
            if( evento_count==0){
                document.querySelector('.add_form_field_evento').click();
             }
        });
     
    var objTo = document.getElementById("button_evento");
    var button = document.createElement('button');
    button.innerHTML = "Actualizar Eventos";
    button.setAttribute('onClick', "Insertar_Eventos('"+id_campeonato+"')");
    button.setAttribute('class', 'acceptButton');
    objTo.appendChild(button);

};

function validateFormEvento() {
    var nombre_evento;
    var DataEvento = new FormData(document.forms.form_evento);
        for(var i = 0; i < evento_count; i++){
            nombre_evento = DataEvento.get('evento_nombre_'+i);
            if (DataEvento.get('evento_nombre_'+i)==""){
                swal({
                    title: "Error",
                    text: "No Debe Dejar Campos en Blanco",
                    icon: "warning",
                  })
            return false;
            }   
        }     
        return true 
};

function Insertar_Eventos(id_campeonato) {
   if (validateFormEvento()){
    swal({
        text: "Eventos Actualizados en el campeonato :"+evento_count,
        icon: "success",
      })
    socket.emit('resetEvento', id_campeonato);
   }
}

   socket.on('EventsReseted', function(id_campeonato){
        var nombre_evento;
        var DataEvento = new FormData(document.forms.form_evento);
        for(var i = 0; i < evento_count; i++){
            nombre_evento = DataEvento.get('evento_nombre_'+i);
            socket.emit('newEvento', id_campeonato,nombre_evento);
        } 
    $('#categoria-tab').trigger('click')
    });





  /////Categorias///
  function InicializarCategoria(){  
      nav=3;   
    socket.emit('requestCategorias',id_campeonato);
  }
  socket.on('ReceiveCategorias',async function(list_categorias){ 
    lista_categorias=list_categorias;
     if(nav==3){
         Insert_Form_Categorias()
         }
    });

function Insert_Form_Categorias(){
    document.getElementById("button_categoria").innerHTML="";
    document.getElementById("form_categoria").innerHTML="";
    categoria_count= 0;
    var max_fields = 10;    
    var wrapper = $("#form_categoria");
    $(wrapper).append(' <div class="row"> <div class="col">  <label for="categoria_nombre_0">Nombre</label></div><div class="col"><label for="categoria_nsum_0">Numero de puntajes que suman al Equipo</label></div><div class="col"><div></div>');
    for(var i = 0; i < lista_categorias.length; i++){  
        categoria_count++;
        $(wrapper).append('<div class="row"><div class="col" ><input type="text" value="'+lista_categorias[i].nombre_categoria+'" name="categoria_nombre_'+(categoria_count-1)+'"></div> <div class="col"><input type="number"  value="'+lista_categorias[i].nsuman+'" name="categoria_nsum_'+(categoria_count-1)+'"></div> <div class="col"><a href="#" class="delete">  Eliminar</a><br style="clear:both;"></div></div>'); //add input box
    }
        $(document).ready(function() {  
           
            var add_button = $(".add_form_field");
                $(add_button).off().on('click',function(e) {
                    e.preventDefault();
                    if (categoria_count < max_fields) {
                        categoria_count++;
                        $(wrapper).append('<div class="row" id=categoria_'+categoria_count+'><div class="col" ><input type="text"  name="categoria_nombre_'+(categoria_count-1)+'"></div> <div class="col" ><input type="number"  name="categoria_nsum_'+(categoria_count-1)+'"></div> <div class="col"><a href="#" class="delete">  Eliminar</a><br style="clear:both;"></div></div>'); //add input box
                    } else {
                        swal({
                            title: "Error",
                            text: "Maximo de Categorias!",
                            icon: "warning",
                          })
                 
                    }
                });
        
                $(wrapper).on("click", ".delete", function(e) {
                    e.preventDefault();
                    $(this).parent('div').parent('div').remove();
                    categoria_count--;
                })    
                if( categoria_count==0){
                      document.querySelector('.add_form_field').click();
                   } 
            });

           
        var objTo = document.getElementById("button_categoria");
        var button = document.createElement('button');
        button.innerHTML = "Actualizar Categorias";
        button.setAttribute('onClick', "Insertar_Categoria('" + id_campeonato + "')");
        button.setAttribute('class', 'acceptButton');
        objTo.appendChild(button);
    }
  
    function validateFormCategoria() {
        var DataCategoria = new FormData(document.forms.form_categoria);
        var nombre_categorias,nsum_categorias;
        for(var i = 0; i < categoria_count; i++){ 
            nombre_categorias = DataCategoria.get('categoria_nombre_'+i);
            nsum_categorias = DataCategoria.get('categoria_nsum_'+i);
                if ((nombre_categorias=="") || (nsum_categorias=null)){
                    swal({
                        title: "Error",
                        text: "No Debe Dejar Campos en Blanco",
                        icon: "warning",
                      })
                return false;
                }   
            }     
            return true 
    };

  function Insertar_Categoria(id_campeonato) {
    if( validateFormCategoria() ){
        alert("Categorias Actualizadas:"+categoria_count);
        socket.emit('resetCategoria', id_campeonato);
    }
}
socket.on('CategoriaReseted', function(id_campeonato){
    var DataCategoria = new FormData(document.forms.form_categoria);
    var nombre_categorias,nsum_categorias;
    for(var i = 0; i < categoria_count; i++){ 
        nombre_categorias = DataCategoria.get('categoria_nombre_'+i);
        nsum_categorias = DataCategoria.get('categoria_nsum_'+i);
        socket.emit('newCategoria', id_campeonato,nombre_categorias,nsum_categorias);
    }

    $('#equipos-tab').trigger('click')
  })


  ////Equipo/////

  
function InicializarEquipo(){
    nav=4;
    socket.emit('requestEquipos',id_campeonato);
   
}

socket.on('ReceiveEquipos',  async function(list_equipos){
    lista_equipos=list_equipos
    if(nav==4){
       InsertFormEquipos()
    }
});

function InsertFormEquipos(){
    document.getElementById("button_equipo").innerHTML="";
    document.getElementById("form_equipo").innerHTML="";
    equipo_count= 0;
    var max_fields = 10;
    var wrapper = $("#form_equipo");
    $(wrapper).append(  '<label for="equipo_nombre_0">Nombre</label>')
    for(var i = 0; i < lista_equipos.length; i++){  

        equipo_count++;
        $(wrapper).append('<div><div style="float:left;margin-right:20px;"><input type="text" value="'+lista_equipos[i].nombre_equipo +'" name="equipo_nombre_'+(equipo_count-1)+'"></div> <a href="#" class="delete">  Eliminar</a><br style="clear:both;"></div>'); //add input box
    }
    var add_button = $(".add_form_field");
    $(document).ready(function() {
            $(add_button).off().on('click',function(e) {
                e.preventDefault();
                if (equipo_count < max_fields) {
                    equipo_count++;
                    $(wrapper).append('<div><div style="float:left;margin-right:20px;"><input type="text"  name="equipo_nombre_'+(equipo_count-1)+'"></div> <a href="#" class="delete">  Eliminar</a><br style="clear:both;"></div>'); //add input box
                } else {
                    swal({
                        title: "Error",
                        text: "Maximo de equipos!",
                        icon: "warning",
                      })
                 }
            });
            $(wrapper).on("click", ".delete", function(e) {
                e.preventDefault();
                $(this).parent('div').remove();
                equipo_count--;
            })   
            
            if( equipo_count==0){
                document.querySelector('.add_form_field').click();
             }
        });
     
    var objTo = document.getElementById("button_equipo");
    var button = document.createElement('button');
    button.innerHTML = "Actualizar Equipos";
    button.setAttribute('onClick', "Insertar_Equipos('"+id_campeonato+"')");
    button.setAttribute('class', 'acceptButton');
    objTo.appendChild(button);

};


function Insertar_Equipos(id_campeonato) {
    if(validateFormEquipos()){
        alert("Equipo Actualizados en el campeonato :"+equipo_count);
        socket.emit('resetEquipo', id_campeonato);
    }
}

function validateFormEquipos() {
    var nombre_equipo;
    var DataEquipo = new FormData(document.forms.form_equipo);
    for(var i = 0; i < equipo_count; i++){
        nombre_equipo = DataEquipo.get('equipo_nombre_'+i);
            if ((nombre_equipo=="")){
                swal({
                    title: "Error",
                    text: "No Debe Dejar Campos en Blanco",
                    icon: "warning",
                  })
            return false;
            }   
        }     
        return true 
};

socket.on('EquiposReseted', function(id_campeonato){
        var nombre_equipo;
        var DataEquipo = new FormData(document.forms.form_equipo);
        for(var i = 0; i < equipo_count; i++){
            nombre_equipo = DataEquipo.get('equipo_nombre_'+i);
            socket.emit('newEquipo', id_campeonato,nombre_equipo);
        } 
    $('#participante-tab').trigger('click')
    });


    //Participante///
    var curr_row=null;
    function InicializarParticipantes(){
        participante_count=0;
        nav=5;
        document.getElementById("table_participante").getElementsByTagName('tbody')[0].innerHTML="";
        edit_mode=false;
        socket.emit('requestEquipos',id_campeonato);
        socket.emit('requestCategorias',id_campeonato);
        socket.emit('requestDataParticipantes',id_campeonato);
       
    }
    
    socket.on('ReceiveDataParticipantes', async function(list_participantes){
        document.forms["form_participante"]["participante_nombre"].value="";      

        //Llenar Selects de Equipo y Categoria
        var categoria_select=document.getElementById("categoria_select");
        categoria_select.innerHTML="";
        categoria_select.options[0] = new Option("--Elegir Categoria--",0 ,true);
        for(index in lista_categorias) {
            categoria_select.options[categoria_select.options.length] = new Option(lista_categorias[index].nombre_categoria, lista_categorias[index].id_categoria);
        }
        var equipo_select=document.getElementById("equipo_select");
        equipo_select.innerHTML="";
        equipo_select.options[0] = new Option("--Elegir Equipo--",0 ,true);
        for(index in lista_equipos) {
            equipo_select.options[equipo_select.options.length] = new Option(lista_equipos[index].nombre_equipo, lista_equipos[index].id_equipo);
        }
        for(var i = 0; i < list_participantes.length; i++){  
            InsertParticipanteToTable(list_participantes[i]);
        }
    });

   function IngresarParticipante(){
      
     if(validateFormParticipante()==true){
      
        var participante_nombre = document.forms["form_participante"]["participante_nombre"].value;
        var participante_categoria = document.forms["form_participante"]["categoria_select"].value;
        var participante_equipo =document.forms["form_participante"]["equipo_select"].value;
        var suma_a_equipo=document.forms["form_participante"]["suma_a_equipo"].value;
        var participante={
            id_participante:0,
            nombre:participante_nombre,
            suma_a_equipo:suma_a_equipo,
            equipo:participante_equipo,
            categoria:participante_categoria
        };
        if(edit_mode){
            participante.id_participante=curr_row.cells[0].value;
            socket.emit('updateParticipante',participante);
        }else
         socket.emit('newParticipante',id_campeonato,participante);
        }
    }

    socket.on('ParticipanteActualizado',  async function(participante){ 
        swal({
            title: "Aviso",
            text: "Participante Ingresado",
            icon: "success",
          })
          if(edit_mode){
            UpdateParticipanteToTable(participante);
           
          }else{
            InsertParticipanteToTable(participante);
          }
          document.forms["form_participante"]["participante_nombre"].value="";
            
    });

    function validateFormParticipante() {
        var z = document.forms["form_participante"]["participante_nombre"].value;
        var x = document.forms["form_participante"]["categoria_select"].value;
        var y =document.forms["form_participante"]["equipo_select"].value;
           if (z==""){
                swal({
                    title: "Error",
                    text: "Debe Ingresar Nombre!",
                    icon: "warning",
                    })
            return false;
            }
            if (x==0){
                swal({
                    title: "Error",
                    text: "Debe Elegir Categoria",
                    icon: "warning",
                  })
            return false;
            }
            if (y==0){
                swal({
                    title: "Error",
                    text: "Debe Elegir Equipo",
                    icon: "warning",
                  })
            return false;
            }
            return true 

    };

    function InsertParticipanteToTable(participante){
        participante_count++;
        var table=document.getElementById("table_participante").getElementsByTagName('tbody')[0];
        var newRow=table.insertRow(table.length);
       // cell0=newRow.insertCell(0);
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
                 cell4.innerHTML="SI";
            else cell4.innerHTML="NO";
        cell5=newRow.insertCell(4);
        cell5.innerHTML='<a class="delete" onclick="EliminarParticipante(this)">Eliminar</a><a class="edit" onClick="onEdit(this) ">Editar</a>';
        
    }

 
    function  UpdateParticipanteToTable(participante){
        participante_count++;
        curr_row.cells[0].innerHTML=participante.nombre;
        curr_row.cells[1].innerHTML=lista_categorias.find((categoria) => categoria.id_categoria == participante.categoria).nombre_categoria;
        curr_row.cells[1].value=participante.categoria;
        curr_row.cells[2].innerHTML=lista_equipos.find((equipo) => equipo.id_equipo == participante.equipo).nombre_equipo;
        curr_row.cells[2].value=participante.equipo;
        curr_row.cells[3].value=participante.suma_a_equipo;
        if(curr_row.cells[3].value)
             curr_row.cells[3].innerHTML="SI";
        else curr_row.cells[3].innerHTML="NO";
        curr_row=null;
        edit_mode=false;
    }

function onEdit(td){
    edit_mode=true;
    selectedRow=td.parentElement.parentElement;
    console.log("id"+selectedRow.cells[0].value)
    curr_row=selectedRow;
    document.forms["form_participante"]["participante_nombre"].value=selectedRow.cells[0].innerHTML;
    document.forms["form_participante"]["categoria_select"].value=selectedRow.cells[1].value;
    document.forms["form_participante"]["equipo_select"].value=selectedRow.cells[2].value;
    document.forms["form_participante"]["suma_a_equipo"].value=selectedRow.cells[3].value;
}
function EliminarParticipante(td){
    if(confirm("¿Esta seguro de eliminar este Participante?")){
        participante_count--;
    selectedRow=td.parentElement.parentElement;
    var id= selectedRow.cells[0].value;
    document.getElementById("table_participante").deleteRow(selectedRow.rowIndex)
    socket.emit('deleteParticipante',id);
    }
}

socket.on('ParticipanteEliminado',  function(){ 
    swal({
        title: "Aviso",
        text: "Participante Eliminado",
        icon: "success",
      })
      
});

