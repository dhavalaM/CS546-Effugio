connections = require("./connection");
travels = require("./travel");
budgets = require("./budget");
users = require("./users");

//code to test budget
//console.log(budgets.getBudgetById("1"));
//console.log(budgets.getIdByBudget("100-200"));

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


async function travelStartup(){
    removeAllTravel = await travels.getAllTravel();
      
    for(var key in removeAllTravel){
        console.log(removeAllTravel[key]);
        await travels.removeTravelById(removeAllTravel[key]._id);
    }
    placeDes =[["Vegas", "Elope"],["Atlantic City", "Casino"],
                ["Arizona", "Grand Canyon"],["Mount Rushmore", "National memorial"],
                    ["New Work", "Liberty statue"]];
    travelData=[];
    for(i=0;i<placeDes.length;i++){
      
        travelData[i]=(makeTravelDoc(placeDes[i][0],placeDes[i][1]));
    }
  
    newTravel = [];

    for(i=0;i<travelData.length;i++){
        newTravel[i] = await travels.addTravelData(travelData[i]);
    }

    return newTravel;    
}
//travel startup
newTravel = travelStartup();
console.log(newTravel);

async function connectionStartup(){

    allConnections = await connections.getAllConnections();
    for(var key in allConnections){
        console.log(allConnections[key]);
        await travels.removeConnection(allConnections[key]._id);
    }

}

async function test_travel(){
    
    travelData =  makeTravelDoc("Vegas", "Elope");
    newTravel = await travels.addTravelData(travelData);
    console.log(newTravel);
    
    alltravel = await travels.getAllTravel()
    console.log(alltravel);
    
    

    locId = await travels.getIdByLocation("Vegas");
    console.log(locId);



}

//test_travel();

async function create_connection(){
    
    conData = makeConDoc("ff2410d9-3df9-4e08-888e-8b6cf3dba930","7126051c-c903-4391-92bf-4601ca089825",
                                "pending","loc", "11/25/2017");
    newCon = await connections.addConnection(conData);
    console.log(newCon);


    conFromReqid = await connections.getConnectionByRequestorId("ff2410d9-3df9-4e08-888e-8b6cf3dba930");

    console.log(conFromReqid);
    
    conFromConid = await connections.getConnectionByConnectedId("7126051c-c903-4391-92bf-4601ca089825");
    
    console.log(conFromConid);
    

    //listCons= await connections.getAllConnections();
    //console.log(listCons);
    console.log(connections);

    //await connections.removeConnection('8d0675f7-ab19-4add-a38d-a0f6728fcfbd');

    listCons= await connections.getAllConnections();
    console.log(listCons);

    
    
    

}
//for testing the connections
//create_connection();