class Campeonato{    
    constructor () {
        this.campeonatos = [];
    }
    //Campeonato para editar
    addCampeonato(id,date, name, admin,finalizado){
        var campeonato = {id,date, name, admin,finalizado};
        this.campeonatos.push(campeonato);
        return campeonato;
    }
    //Campeonato en activado y en vivo,

    addLiveCampeonato(pin,id,date, name, admin,hostId){
        var status="waiting";
        var eventos=new Pantalla();// TOdos los eventos posibles del campeonato
        var pantallas=new Pantalla();// Pantallas ya asociadas a un evento
        var jueces=new Juez();
        var campeonato = {pin,id,date, name, admin,hostId, pantallas,jueces, eventos,status};
        this.campeonatos.push(campeonato);   
        return campeonato;
    }
    
    //Buscar campeonato iniciado por pin
    getCampeonato(pin){
            var found=this.campeonatos.find((campeonato) => campeonato.pin == pin) ; 
        return found;
    }
    
    setStatus(pin,status){ 
        for (var i in this.campeonatos) {
            if (this.campeonatos[i].pin == pin) {
                this.campeonatos[i].status = status;
            break; //Stop this loop, we found it!
            }
        }
    }
}

const {Pantalla} = require('./pantalla');
const {Juez} = require('./juez');
module.exports = {Campeonato};