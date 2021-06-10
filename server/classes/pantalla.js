class  Pantalla{

    constructor () {
        this.list_pantallas = [];
    }
    addPantalla(hostId, screenId, name, id_evento){
        var pin_pantalla=null;
        var juez_asociado;
        var pantalla = {hostId, screenId, name, id_evento,pin_pantalla,juez_asociado};
        this.list_pantallas.push(pantalla);
        return pantalla;
    }
    //Get pantalla o evento por id de evento
    getPantalla(id_evento){
        var found=this.list_pantallas.find((pantalla) => pantalla.id_evento == id_evento) ;
    return found;
}
    //Get pantalla o evento por id de host
    getPantallas(hostId){
    var found=this.list_pantallas.find((pantalla) => pantalla.hostId == hostId) ;
    return found;   
    }
     //Get pantalla o evento por pin de pantalla
    getPantallaByPin(pin_pantalla){
        var found=this.list_pantallas.find((pantalla) => pantalla.pin_pantalla == pin_pantalla) ;
    return found;
    }
     //Get pantalla o evento por id generado
     getPantallaById(screenId){
        var found=this.list_pantallas.find((pantalla) => pantalla.screenId == screenId) ;
    return found;
    }
}


module.exports = {Pantalla};