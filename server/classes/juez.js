class  Juez{

    constructor () {
        this.list_jueces = [];
    }
    addJuez(hostId, screenId, JudgeID, name, id_evento){
        var juez = {hostId, screenId,JudgeID, name, id_evento};
        this.list_jueces.push(juez);
        return juez;
    }
    //Get juez por id
    getJuezById(id_juez){
        var found=this.list_jueces.find((juez) => juez.id_juez == id_juez) ;
    return found;
    }
}


module.exports = {Juez};