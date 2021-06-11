var socket = io();

var id_admin ;


if( document.cookie.lenght!=0){
    var cockie_Array= document.cookie.split(";");
    var admin_Array= cockie_Array[0].split("=");
    var admin_id=admin_Array[1];
    console.log("ID ADMIN="+ admin_id);//TEST
}

function InsertCampeonato(){
    var nombre_campeonato = document.getElementById('nombre').value;
    var fecha = document.getElementById('fecha').value;
    var id_admin = document.getElementById('id_admin').value;
    var campeonato = {fecha,nombre_campeonato,id_admin};
    socket.emit('newCampeonato', fecha,nombre_campeonato,id_admin);
}
socket.on('CargarCampeonato', function(id_campeonato){
    swal({
        text:"Campeonato Cargado!, procida a modificar",
        icon:"success"
        });
        window.location.replace("admin/modify/")
    });

window.onload = function() {
    InicializarCampeonato();
}
function InicializarCampeonato(){
    console.log("SEARCHING DataBase");
    socket.emit('requestCampeonatosNames',admin_id);//Get database names to display to user
}

socket.on('campeonatoNamesData', function(campeonato){
    var table=document.getElementById("table_campeonato").getElementsByTagName('tbody')[0];
    table.innerHTML="";
      for(var i = 0; i < campeonato.length; i++){  
         
          var newRow=table.insertRow(table.length);
          cell1=newRow.insertCell(0);
          cell1.innerHTML=campeonato[i].name;
          cell2=newRow.insertCell(1);
          var d = new Date(campeonato[i].date)
          cell2.innerHTML=(d.getDate())+"-"+(d.getMonth() + 1)+"-"+(d.getFullYear());
          cell3=newRow.insertCell(2);
          var button = document.createElement('button');
          button.innerHTML = campeonato[i].name;
          button.setAttribute('onClick', "EliminarCampeonato(this,'" + campeonato[i].id + "')");
          button.setAttribute('class', 'CampButton');
          button.innerHTML = "Eliminar";
          cell3.appendChild(button)
      }
  });

  function EliminarCampeonato(td,id_campeonato){
    swal("Esta seguro de eliminar el campeonato, se borraran todos los datos?", {
        dangerMode: true,
        
        buttons:{
            cancel: "Cancelar",
            confirm: "Confirmar",
          },

      }).then((willDelete) => {
            if (willDelete) {
               var  selectedRow=td.parentElement.parentElement;
                 document.getElementById("table_participante").deleteRow(selectedRow.rowIndex)
                socket.emit('deleteCampeonato',id_campeonato)
            }            
      });
    }

    socket.on('CampeonatoEliminado',  function(){ 
        swal({
            title: "Aviso",
            text: "Archivo Eliminado",
            icon: "success",
          })
          
    });