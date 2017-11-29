connections = require("./connection");
travels = require("./travel");
budgets = require("./budget");
users = require("./users");


    
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

var makeDoc = function(user_id, name,hashedPassword,dob,gender,location,occupation,orientation,
    contact_info, loc_pref, bud, con) {
    return {
        //_id: uuidv1(),
        user_id:user_id,
        name:name,
        hashedPassword:"",
        dob:dob,
        gender:gender,
        location:location,
        occupation:occupation,
        orientation:orientation,
        contact_info:contact_info,
        location_pref:loc_pref,
        budget:bud,
        connections:con
        
    }
};

async function userStartup(){
    newTravel = await travelStartup();

    allusers = await users.getAllUsers();
    

    for(i=0;i<allusers.length;i++){
        await users.removeUser(allusers[i]._id);
    }
    userJack = makeDoc("jack_d", "Jack", "", "11/27/1987", "M", "Boston","Gambler","S",
    "jack@titanic.com", [newTravel[0]._id, newTravel[1]._id],"1",[]);
    
    userRose = makeDoc("rose_d", "Rose", "", "11/27/1989", "F", "Princeton","Dancer","S",
    "rose@titanic.com", [newTravel[0]._id, newTravel[1]._id],"1",[]);
    
    jackdb= await users.addUser(userJack,"iamagambler");
   
    rosedb= await users.addUser(userRose, "iliketodance");

    return [jackdb, rosedb];

}

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

    module.exports =    connectionStartup = async function (){

    allConnections = await connections.getAllConnections();
    for(var key in allConnections){
        
        await connections.removeConnection(allConnections[key]._id);
    }

    newUsers = await userStartup();
    
    connectionData = makeConDoc(newUsers[0]._id,newUsers[1]._id,"pending",newUsers[0].location_pref[0],"11/27/2017");
    newConnection = await connections.addConnection(connectionData);
    jackUser = await users.addConnection(newUsers[0]._id, newConnection._id);
    roseUser = await users.addConnection(newUsers[1]._id, newConnection._id);
    //console.log(jackUser);
    //console.log(roseUser);
    return [jackUser, roseUser];

}

//connectionStartup();

