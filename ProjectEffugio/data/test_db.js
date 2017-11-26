connections = require("./connection");
travels = require("./travel");

function makeConDoc(req_id, con_id, stat, loc_id, date){

    conData={
        requestor_id:req_id,
        connected_id:con_id,
        status:stat,
        location_id:loc_id,
        date_initiated:date
    };
    return conData; 
}

function makeTravelDoc(name,des){
    travelDoc={
        name:name,
        description:des



    };
    return travelDoc;
}

async function test_travel(){
    /*
    travelData =  makeTravelDoc("Vegas", "Elope");
    newTravel = await travels.addTravelData(travelData);
    console.log(newTravel);
    
    alltravel = await travels.getAllTravel()
    console.log(alltravel);
    */
    locId = await travels.getIdByLocation("Vegas");
    console.log(locId);



}

test_travel();

async function create_connection(){
    /*
    conData = makeConDoc("ff2410d9-3df9-4e08-888e-8b6cf3dba930","7126051c-c903-4391-92bf-4601ca089825",
                                "pending","loc", "11/25/2017");
    newCon = await connections.addConnection(conData);
    console.log(newCon);


    conFromReqid = await connections.getConnectionByRequestorId("ff2410d9-3df9-4e08-888e-8b6cf3dba930");

    console.log(conFromReqid);
    
    conFromConid = await connections.getConnectionByConnectedId("7126051c-c903-4391-92bf-4601ca089825");
    
    console.log(conFromConid);
    */

    //listCons= await connections.getAllConnections();
    //console.log(listCons);
    console.log(connections);

    //await connections.removeConnection('8d0675f7-ab19-4add-a38d-a0f6728fcfbd');

    listCons= await connections.getAllConnections();
    console.log(listCons);

    
    
    

}
//for testing the connections
//create_connection();