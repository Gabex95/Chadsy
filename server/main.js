//Import dependencies
const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');


//Import classes
const Campeonato = require('./classes/campeonato');
var liveCampeonatos =new Campeonato();//Campeonatos en curso
const publicPath = path.join(__dirname, '../public');
var app = express();
var server = http.createServer(app);
var io = socketIO(server);

var connectCounter=0;


const  Pool  = require('pg');

app.use(express.static(publicPath));


//Datos de la base de datos
const pool = new Pool({
    user: 'postgres',
    host: '192.241.136.247',
    database: 'chadsy',
    password: 'lalo2469',
    port: 5432,
});


pool.on('error', (err, client) => {
    console.error('Error:', err);
});


//Test Hello World
app.get('/hello',function(req,res){
    res.status(200).send("Hello World");
    });


//Test de Coneccion a la base de datos
pool.connect()
    .then((client) => {
        console.log('Connected to the PostgreSQL server.'+ client);
    }) 
    .catch(err => {
    console.error('Error PostgreSQL:  ' + err.message);
});



io.on('connection', (socket) => {


    connectCounter++;
    //Nuevo Campeonato a la base de datos
    socket.on('newCampeonato', function(fecha,nombre,id_admin){
        var query=("INSERT INTO campeonato (fecha, nombre_campeonato, id_admin) VALUES (DATE '"+fecha+"' , '"+nombre+"' , "+id_admin+" ) RETURNING id_campeonato");
        pool.connect()
        .then((client) => {
            client.query(query)
                .then(res => {
                    for (let row of res.rows) {
                        socket.emit('CargarCampeonato', row.id_campeonato)
                    }
                })
                .catch(err => {
                    console.error(err);
                });
                client.release(); 
        })
        
        .catch(err => {
            console.error('error: ' + err.message);
        }); 
        
    });

    //Devolver los campeonatos correscondientes al admin
    socket.on('requestCampeonatosNames', function(admin_id){
        var Campeonatos =new Campeonato();
        var query=("SELECT * FROM public.campeonato WHERE id_admin='"+admin_id+"' ;");
        pool.connect()
        .then((client) => {
            client.query(query)
                .then(res => {
                    for (let row of res.rows) {
                      Campeonatos.addCampeonato(row.id_campeonato,row.fecha,row.nombre_campeonato,row.id_admin,row.Finalizado)
                    }
                    socket.emit('campeonatoNamesData', Campeonatos.campeonatos)   
                })
                .catch(err => {
                    console.error(err);
                });
            client.release(); 
        })
        .catch(err => {
            console.error('error: ' + err.message);
        });
        
    });

    //Devolver loas eventos del Campenato
    socket.on('requestEventos', function(id_campeonato){
        var list_eventos=[];
        var querycategoria=("SELECT * FROM public.evento WHERE id_campeonato="+id_campeonato+" ;");
        pool.connect()
        .then((client) => {
            client.query(querycategoria)
                .then(res => {
                    for (let row of res.rows) {
                        var evento={
                            id_evento:row.id_evento,
                            nombre_evento:row.nombre_evento,
                        };
                        list_eventos.push(evento);
                    }
                    socket.emit('ReceiveEventos', list_eventos)   
                })
                .catch(err => {
                    console.error(err);
                });
            client.release(); 
        })
        .catch(err => {
            console.error('error: ' + err.message);
        });
    });

    //Devolver las Categorias del Campenato
    socket.on('requestCategorias', function(id_campeonato){
        var list_categorias=[];
        var querycategoria=("SELECT * FROM public.categoria WHERE id_campeonato="+id_campeonato+" ;");
        pool.connect()
        .then((client) => {
            client.query(querycategoria)
                .then(res => {
                    for (let row of res.rows) {
                        var categoria={
                            id_categoria:row.id_categoria,
                            nombre_categoria:row.nombre_categoria,
                            nsuman:row.nsuman 
                        };
                       list_categorias.push(categoria);
                    }
                    socket.emit('ReceiveCategorias', list_categorias)   
                })
                .catch(err => {
                    console.error(err);
                });
            client.release(); 
        })
        .catch(err => {
            console.error('error: ' + err.message);
        });
    });
    //DEvolver lista de Equipos
    socket.on('requestEquipos', function(id_campeonato){
        var list_equipos=[];
        var queryequipos=("SELECT * FROM public.equipo WHERE id_campeonato="+id_campeonato+" ;");
        pool.connect()
        .then((client) => {
            client.query(queryequipos)
                .then(res => {
                    for (let row of res.rows) {
                        var equipo={
                            id_equipo:row.id_equipo,
                            nombre_equipo:row.nombre_equipo,
                        };
                        list_equipos.push(equipo);
                    }
                    socket.emit('ReceiveEquipos', list_equipos)   
                })
                .catch(err => {
                    console.error(err);
                });
            client.release(); 
        })
        .catch(err => {
            console.error('error: ' + err.message);
        });
    });

    //DEvolver lista de Participantes correspondiente al equipo y puntajes del aparato de cada uno
    socket.on('requestParticipantes', function(id_categoria,id_equipo,id_evento){
        var list_participantes=[];
        var queryparticipantes=("SELECT * FROM public.participante WHERE id_categoria="+id_categoria+" and id_equipo="+id_equipo+" ;");
        pool.connect()
        .then((client) => {
            client.query(queryparticipantes)
                .then(res => {
                    for (let row of res.rows) {
                        var participante={
                            id_participante:row.id_participante,
                            nombre:row.nombre,
                            puntaje:0,
                        };
                        list_participantes.push(participante);
                    }
                    socket.emit('ReceiveParticipantes', list_participantes)   
                })
                .catch(err => {
                    console.error(err);
                });
            client.release(); 
        })
        .catch(err => {
            console.error('error: ' + err.message);
        });
    });
   //Devolver puntaje de evento
   socket.on('requestPuntajeEvento', function(participante,id_evento){
    pool.connect()
    .then((client) => {
            client.query("SELECT puntaje from public.puntaje WHERE id_participante="+participante.id_participante+" and id_evento= "+id_evento+";")
                 .then(resp =>
                {  var puntaje;
                    for (let row of resp.rows) {
                        puntaje=row.puntaje     
                    }
                    socket.emit('ReceivePuntajeEvento', puntaje,participante.id_participante)   
                })
            .catch(err => {
                console.error(err);
            });
        client.release(); 
    })
    .catch(err => {
        console.error('error: ' + err.message);
    });
});

     //DEvolver lista de Todos los Participantes 
    socket.on('requestDataParticipantes', function(id_campeonato){
        var list_participantes=[];
        var queryparticipantes=("SELECT * FROM public.participante WHERE id_campeonato="+id_campeonato );
        pool.connect()
        .then((client) => {
            client.query(queryparticipantes)
                .then(res => {
                    for (let row of res.rows) {
                        var participante={
                            id_participante:row.id_participante,
                            nombre:row.nombre,
                            puntajes:0,
                            total:0,
                            equipo:row.id_equipo,
                            categoria:row.id_categoria,
                            suma_a_equipo:row.suma_a_equipo
                        };
                        list_participantes.push(participante);
                    }     
                 socket.emit('ReceiveDataParticipantes', list_participantes)   
                })
                .catch(err => {
                    console.error(err);
                });
            client.release(); 
        })
        .catch(err => {
            console.error('error: ' + err.message);
        });
    });

    socket.on('requestPuntajesParticipante', function(participante){
       pool.connect()
        .then((client) => {
                 client.query("SELECT * from public.puntaje WHERE id_participante="+participante.id_participante+" ;")
                .then(resp =>
                    {   var puntajes=[];
                        for (let row of resp.rows) {
                            let puntaje={
                                evento:row.id_evento,
                                valor:row.puntaje
                            };
                            puntajes.push(puntaje);
                        }
                        socket.emit('ReceivePuntajesParticipante', puntajes,participante.id_participante)   
                    })
                .catch(err => {
                    console.error(err);
                });
            
            
            client.release(); 
        })
        .catch(err => {
            console.error('error: ' + err.message);
        });
    });

    //Devolver el Id de campeonato para buscar datos
    socket.on('requestIdCampeonato', function(pin_campeonato){
        var cur_champ= liveCampeonatos.getCampeonato(pin_campeonato);
        socket.emit('receiveIdCampeonato',cur_champ.id);
    });

    //Checkear pin y Devolver los eventos o aparatos desde un pin de campeonato
    socket.on('requestEventsNames',  function(pin){
        var cur_champ= liveCampeonatos.getCampeonato(pin);
        if(cur_champ){
            socket.emit('eventosNamesData', cur_champ.eventos.list_pantallas)
        } else    
        if(cur_champ == null){
            socket.emit('noChampFound'); //sent back to 'join' page because game was not found with pin
        }
    });

    //Eliminar todos los eventos
    socket.on('resetEvento', function(id_campeonato){
        var querydelete=("DELETE FROM public.evento WHERE id_campeonato="+id_campeonato+" ;");
        pool.connect()
        .then((client) => {
            client.query(querydelete)
                .then( socket.emit('EventsReseted',id_campeonato) )
                .catch(err => {
                    console.error(err);
                });
            client.release(); 
        })
        .catch(err => {
            console.error('error: ' + err.message);
        });
    });


    //Nuevo Evento a la base de datos
    socket.on('newEvento', function(id_campeonato,nombre_evento){
        var query=("INSERT INTO evento (id_campeonato, nombre_evento) VALUES ( '"+id_campeonato+"' , '"+nombre_evento+"' ) RETURNING id_evento");
        pool.connect()
        .then((client) => {
            client.query(query)
                .then(res => {
                    for (let row of res.rows) {
                        socket.emit('EventoActualizado', row.id_evento)
                    }
                })
                .catch(err => {
                    console.error(err);
                });
                client.release(); 
        })
        .catch(err => {
            console.error('error: ' + err.message);
        });  
       
    });

    //Eliminar todas las Categorias
    socket.on('resetCategoria', function(id_campeonato){
        var querydelete=("DELETE FROM public.categoria WHERE id_campeonato="+id_campeonato+" ;");
        pool.connect()
        .then((client) => {
            client.query(querydelete)
                .then( socket.emit('CategoriaReseted',id_campeonato) )
                .catch(err => {
                    console.error(err);
                });
            client.release(); 
        })
        .catch(err => {
            console.error('error: ' + err.message);
        });
    });

    //Nueva Categoria a la base de datos
    socket.on('newCategoria', function(id_campeonato,nombre_categorias,nsuman){
        var query=("INSERT INTO categoria (id_campeonato, nombre_categoria, nsuman) VALUES ( '"+id_campeonato+"' , '"+nombre_categorias+"' , "+nsuman+" ) RETURNING id_categoria");
        pool.connect()
        .then((client) => {
            client.query(query)
                .then(res => {
                    for (let row of res.rows) {
                        socket.emit('CategoriaActualizada', row.id_categoria)
                    }
                })
                .catch(err => {
                    console.error(err);
                });
                client.release(); 
        })
        .catch(err => {
            console.error('error: ' + err.message);
        });  
       
    });

     //Eliminar todos los equipos
     socket.on('resetEquipo', function(id_campeonato){
        var querydelete=("DELETE FROM public.equipo WHERE id_campeonato="+id_campeonato+" ;");
        pool.connect()
        .then((client) => {
            client.query(querydelete)
                .then( socket.emit('EquiposReseted',id_campeonato) )
                .catch(err => {
                    console.error(err);
                });
            client.release(); 
        })
        .catch(err => {
            console.error('error: ' + err.message);
        });
    });

    //Nueva Equipo a la base de datos
    socket.on('newEquipo', function(id_campeonato,nombre_equipo){
        var query=("INSERT INTO equipo (id_campeonato, nombre_equipo) VALUES ( '"+id_campeonato+"' , '"+nombre_equipo+"'  ) RETURNING id_equipo");
        pool.connect()
        .then((client) => {
            client.query(query)
                .then(res => {
                    for (let row of res.rows) {
                        socket.emit('CategoriaActualizada', row.equipo)
                    }
                })
                .catch(err => {
                    console.error(err);
                });
                client.release(); 
        })
        .catch(err => {
            console.error('error: ' + err.message);
        });  
    
    });

     //Nueva Equipo a la base de datos
     socket.on('newParticipante', function(id_campeonato,participante){
        var query=("INSERT INTO participante (id_campeonato, nombre, id_equipo, id_categoria, suma_a_equipo) VALUES ( '"+id_campeonato+"' , '"+participante.nombre+"' , '"+ participante.equipo+"'  , '"+ participante.categoria+"' , "+ participante.suma_a_equipo+" ) RETURNING id_participante");
        pool.connect()
        .then((client) => {
            client.query(query)
                .then(res => {
                    for (let row of res.rows) {
                        participante.id_participante=row.id_participante;
                        socket.emit('ParticipanteActualizado', participante)
                    }
                })
                .catch(err => {
                    console.error(err);
                });
                client.release(); 
        })
        .catch(err => {
            console.error('error: ' + err.message);
        });  
    
    });


    socket.on('updateParticipante', function(participante){
        var query=("UPDATE participante SET nombre='"+participante.nombre+"', id_equipo="+participante.equipo+",id_categoria="+participante.categoria+", suma_a_equipo="+participante.suma_a_equipo+" WHERE (id_participante="+participante.id_participante+");");
        pool.connect()
        .then((client) => {
            client.query(query)
                .then(
                        socket.emit('ParticipanteActualizado', participante)
                )
                .catch(err => {
                    console.error(err);
                });
                client.release(); 
        })
        .catch(err => {
            console.error('error: ' + err.message);
        });  
    
    });

    socket.on('deleteParticipante', function(id_participante){
        let query=("DELETE FROM participante WHERE id_participante="+id_participante+" ;");
        pool.connect()
        .then((client) => {
            client.query(query)
                .then( 
                        socket.emit('ParticipanteEliminado')
                )
                .catch(err => {
                    console.error(err);
                });
                client.release(); 
        })
        .catch(err => {
            console.error('error: ' + err.message);
        });  
    
    });


    //
    socket.on('InicializarCampeonato',function(id_campeonato,chaPin){
        var cur_champ;
        chaPin = Math.floor(Math.random()*90000) + 10000; //pin de campeonato
        const query_select_champ = {
            name: 'fetch-campeonato',
            text: 'SELECT fecha,nombre_campeonato,id_admin FROM campeonato WHERE id_campeonato = $1',
            values: [id_campeonato],
          }
        pool.connect()
        .then((client) => {
            client.query(query_select_champ)
                .then(res => {
                    var result=res.rows[0];
                        // socket.id = Host ID
                cur_champ=liveCampeonatos.addLiveCampeonato(chaPin,id_campeonato,result.fecha,result.nombre_campeonato,result.id_admin,socket.id)     
                
                })
                .catch(err => {
                    console.error(err);
                });
              //  var champ = liveCampeonatos.getCampeonato(socket.id); //Gets the game data
                    socket.join(String(chaPin));     //The host is joining a room based on the pin
                    console.log('Campeonato creado con pin:', chaPin); 
                    cur_champ=liveCampeonatos.getCampeonato(chaPin);
                    //Enviar pin a la pantalla
                    socket.emit('showHostPin', {pin: chaPin });

            client.release(); 
        })
        .catch(err => {
            console.error('error: ' + err.message);
        });

        var list_participantes=[];
        pool.connect()
        .then((client) => {
         //Buscar todos los id de participantes para inicializar puntajes
         var query_participante=("SELECT id_participante FROM public.participante WHERE id_campeonato="+id_campeonato+" ;");
         client.query(query_participante)
         .then(res => {
             for (let row of res.rows) {   
                list_participantes.push(row.id_participante);
             }
         })
         .catch(err => {
             console.error(err);
         });
         client.release();
        }) 

        //LLenar con los posibles aparatos o eventos e inicializar puntajes
   
        var query=("SELECT * FROM public.evento WHERE id_campeonato='"+id_campeonato+"' ;");
        pool.connect()
        .then((client) => {
            client.query(query)
                .then(res => {
                    for (let row of res.rows) {    
                    cur_champ.eventos.addPantalla(socket.id,socket.id,row.nombre_evento,row.id_evento)
                    for(var f = 0; f < list_participantes.length; f++){ 
                            pool 
                            .query("INSERT INTO public.puntaje (puntaje, id_participante, id_evento) VALUES (0 , "+list_participantes[f]+" , "+row.id_evento+" ) ON CONFLICT ON CONSTRAINT puntaje_pkey DO UPDATE SET puntaje = 0;")
                            .catch(err => console.error('Error executing query', err.stack))
                        }
                    }
                    socket.emit('eventosNamesData', cur_champ.eventos.list_pantallas)
                })
                .catch(err => {
                    console.error(err);
                });
            client.release(); 
        })
        .catch(err => {
            console.error('error: ' + err.message);
        }); 

     });


    //Comprobar pines ingresados por un juez
    socket.on('LoadScreen',  function(pin_aparato,pin_campeonato,name){ 
    var cur_champ= liveCampeonatos.getCampeonato(pin_campeonato);
    if(cur_champ ){
        var searched_screen= cur_champ.pantallas.getPantallaByPin(pin_aparato);
        }  
    if(cur_champ && searched_screen){ 
        cur_champ.jueces.addJuez(cur_champ.hostId,searched_screen.screenId,socket.id,name,searched_screen.id_evento);
        socket.emit('Confirmed', cur_champ,searched_screen);
        }
        else    
        if(cur_champ == null){
            socket.emit('noChampFound'); //nothing found with pin
        }
        if(searched_screen == null){
            socket.emit('noScreenFound'); //nothing found with pin
        }
    });


    //Pantalla conectada
    socket.on('screen-join',function(params){
        var cur_champ= liveCampeonatos.getCampeonato(params.pin_campeonato);
            //Si se encuentra un campeonato con el pin
            var found=false;
            if(cur_champ){   
                found=true;
                 console.log('Pantalla Conectada con id:',params.id_pantalla );           
                var hostId = cur_champ.hostId; //Get the id of host of game  
                socket.join(String(params.pin_campeonato)); //joining room de campeonato
                
                 var pantallaConectada = cur_champ.eventos.getPantalla(params.id_evento); //Getting evento predefinido
                var screen_id=params.id_pantalla;
                var searched_screen=cur_champ.pantallas.getPantallaById(screen_id)
                 //REvisar si no esta ya en la lista
                //Si no esta en la lista
                  if(searched_screen == null ){
                    cur_champ.pantallas.addPantalla(hostId,screen_id,pantallaConectada.name,pantallaConectada.id_evento)
                    console.log('nueva Pantalla' );  
                }
                  if(cur_champ.status.localeCompare("started")== 0){   
                    socket.emit('Start');
                  }
                     
               }    
        //If the game has not been found
        if(!found){
           socket.emit('noChampFound'); //Player is sent back to 'join' page because game was not found with pin
       }
    
    });


    //Generar Pin de Pantalla
    socket.on('generatePinScreen',function(socketid,screen_id,pin_campeonato){
    
        var cur_champ=liveCampeonatos.getCampeonato(pin_campeonato);
        if(cur_champ){
            var searched_screen=cur_champ.pantallas.getPantallaById(screen_id)
            var screenPin=searched_screen.pin_pantalla;
            //REvisar si no esta ya en la lista
           //Si no esta en la lista
             if(searched_screen.pin_pantalla == null ){
                 screenPin = Math.floor(Math.random()*90000) + 10000; //pin de campeonato
              for (var i in cur_champ.pantallas.list_pantallas) {
                if (cur_champ.pantallas.list_pantallas[i].screenId == screen_id) {
                cur_champ.pantallas.list_pantallas[i].pin_pantalla = screenPin;
                 break; 
                }
               }
               io.to(cur_champ.hostId).emit('updateHostLobby', cur_champ.pantallas.list_pantallas);//Sending host player data to display 
             }
           socket.join(String(screenPin)); //joining room de pantalla 
           if(cur_champ.status.localeCompare("started")!= 0){   
            io.to(socketid).emit('setScreenPin', screenPin,cur_champ.status,searched_screen.name);
          }
          
        }else{
        socket.emit('noChampFound');
        }
    });


     //Juez conectado
     socket.on('judge-join',function(params){
        var cur_champ= liveCampeonatos.getCampeonato(params.pin_campeonato);
            //Si se encuentra un campeonato con el pin
                if(cur_champ){   
                console.log('Juez Conectado, id :',params.id_juez);           
                var hostId = cur_champ.hostId; //Get the id of host of game  
                socket.join(String(params.pin_campeonato)); //joining room de campeonato
                var searched_screen=cur_champ.pantallas.getPantallaByPin(params.pin_aparato)
                if(searched_screen==null){
                    socket.emit('noChampFound'); //Player is sent back to 'join' page because game was not found with pin
                }else{
                    screen_id=searched_screen.screenId;        
                    var searched_judge=cur_champ.jueces.getJuezById(params.id_juez);

                    //Revisar si no esta ya en la lista, si no esta se agrega
                    if(searched_judge == null ){
                    cur_champ.jueces.addJuez(hostId,screen_id,socket.id,params.name,searched_screen.id_evento)
                    }
                    socket.join(String(params.pin_aparato)); //joining room de pantalla          
                    socket.to(String(params.pin_aparato)).emit('JudgeConected',params.name);
                    socket.emit('JudgeConected',params.name,searched_screen.id_evento,searched_screen.name,cur_champ.status);
                    for (var i in cur_champ.pantallas.list_pantallas) {
                        if (cur_champ.pantallas.list_pantallas[i].screenId == screen_id) {
                            cur_champ.pantallas.list_pantallas[i].juez_asociado = params.name;
                           break; 
                        }
                      }
                    socket.to(hostId).emit('updateHostLobby',cur_champ.pantallas.list_pantallas);
                }}   
        //If the game has not been found
        if(cur_champ==null){
           socket.emit('noChampFound'); //Player is sent back because game was not found with pin
       }
    });

    //Cuando el administrator empieza el campeonato 
    socket.on('startChampionship',function(pin_campeonato){
        liveCampeonatos.setStatus(pin_campeonato,"started");
        var cur_champ= liveCampeonatos.getCampeonato(pin_campeonato);
        if(cur_champ){
                for (var i in cur_champ.pantallas.list_pantallas){  
                    pin=String(cur_champ.pantallas.list_pantallas[i].pin_pantalla)    
                    socket.to(pin).emit('Start');       
                }
                socket.emit('Start');
        }
        else if(cur_champ==null){
            socket.emit('noChampFound'); //Player is sent back because game was not found with pin
        }
        });
    
    socket.on('endChampionship',function(pin_campeonato){
            liveCampeonatos.setStatus(pin_campeonato,"finished");
            var cur_champ= liveCampeonatos.getCampeonato(pin_campeonato);
            if(cur_champ){
                    for (var i in cur_champ.pantallas.list_pantallas){  
                        pin=String(cur_champ.pantallas.list_pantallas[i].pin_pantalla)    
                        socket.to(pin).emit('End');       
                    }

                    pool.connect()
                     .then((client) => {          
                        pool
                        .query("UPDATE public.campeonato SET Finalizado="+true+" WHERE (id_campeonato="+cur_champ.id+");")
                        .catch(err => console.error('Error executing query', err.stack))
                    client.release(); 
                });
                    socket.emit('End');
            }
            else if(cur_champ==null){
                socket.emit('noChampFound'); //Player is sent back because game was not found with pin
            }
    });

    socket.on('inputPuntaje',function(params,id_aparato,id_participante,nombre_aparato,nombre_categoria,nombre_equipo,nombre_participante,puntaje){
        var cur_champ= liveCampeonatos.getCampeonato(params.pin_campeonato);
        //Si se encuentra un campeonato con el pin
        if(cur_champ){  
        console.log('Ingresando puntaje a participante, id :',id_participante); 
        console.log('Puntaje, :',puntaje);  
        var hostId = cur_champ.hostId; //Get the id of host of game    
        var searched_screen=cur_champ.pantallas.getPantallaByPin(params.pin_aparato)  
            if(searched_screen==null){
                socket.emit('noChampFound'); //Player is sent back to 'join' page because game was not found with pin
            }else{
           // Actualizar puntaje;    
                pool.connect()
                .then((client) => {          
                    pool
                    .query("UPDATE public.puntaje SET puntaje="+puntaje+" WHERE (id_participante="+id_participante+" and id_evento="+id_aparato+");")
                    .catch(err => console.error('Error executing query', err.stack))
                    client.release(); 
                });
            socket.to(String(params.pin_aparato)).emit('PuntajeIngresado',nombre_aparato,nombre_categoria,nombre_equipo,nombre_participante,puntaje);//Enviar datos
            socket.to(hostId).emit('PuntajeIngresado',nombre_aparato,nombre_categoria,nombre_equipo,nombre_participante,puntaje);//Enviar datos
            }   
        }        
        //If the game has not been found
        if(cur_champ==null){
            socket.emit('noChampFound'); //Player is sent back because game was not found with pin
        }
    });


   
});//Fin de Las funciones de Socket




///CAMBIAR POR SERVIDOR
server.listen(3000, 
    console.log("Server started on port 3000")
);



// var clients = {};

// io.on('connection', function(io) {
//   clients[io.id] = io;

//   io.on('disconnect', function() {
//     delete clients[io.id];
//   });
// });


//Codigo Para Sorting
/*
var people = [{
    name: 'a75',
    item1: 5,
    item2: false
  },
  {
    name: 'z32',
    item1: 3,
    item2: false
  },
  {
    name: 'e77',
    item1: 9,
    item2: false
  },
];

function sorting(json_object, key_to_sort_by) {
    // a,b de menor a mayor 
    //  b,a de mayor a menor
  function sortByKey(a, b) {
    var x = a[key_to_sort_by];
    var y = b[key_to_sort_by];
    return ((x < y) ? -1 : ((x > y) ? 1 : 0));
  }

  json_object.sort(sortByKey);
}

document.write('Before<br />');
document.write(people[0].name + '<br />');
document.write(people[1].name + '<br />');
document.write(people[2].name + '<br /><br />');

sorting(people, 'item1');

document.write('After<br />');
document.write(people[0].name + '<br />');
document.write(people[1].name + '<br />');
document.write(people[2].name + '<br />');

////*/
