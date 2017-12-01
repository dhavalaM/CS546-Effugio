const MongoClient = require("mongodb").MongoClient;
const uuidv1 = require('uuid/v4');
const users = "usersData";
const travel = "travelData";
const connections = "connectionsData";

const settings = {
    mongoConfig: {
        serverUrl: "mongodb://localhost:27017/",
        database: "effugio"
    }
};

//NM - added email
var makeDoc = function (user_id, name, hashedPassword, dob, gender, location, occupation, orientation,
    contact_info, email, loc_pref, bud, con) {
    return {
        _id: uuidv1(),
        user_id: user_id,
        name: name,
        hashedPassword: hashedPassword,
        dob: dob,
        gender: gender,
        location: location,
        occupation: occupation,
        orientation: orientation,
        contact_info: contact_info,
        email: email,
        location_pref: loc_pref,
        budget: bud,
        connections: con

    }
};



function makeTravelDoc(name, des) {
    travelDoc = {
        _id: uuidv1(),
        name: name,
        description: des
    };
    return travelDoc;
}


function makeConDoc(req_id, con_id, stat, loc_id, date) {

    conData = {
        _id: uuidv1(),
        requestor_id: req_id,
        connected_id: con_id,
        status: stat,
        location_id: loc_id,
        date_initiated: date
    };
    return conData;
}

let fullMongoUrl = settings.mongoConfig.serverUrl + settings.mongoConfig.database;
let _connection = undefined


async function runSetup() {

    // create db connection
    const db = await MongoClient.connect(fullMongoUrl);

    // adding travel data seed
    //NM - Commenting the below collection drop line as starting the application gives 'MongoError: ns not found' error
    //NM - According to lecturer's code dropping the database rather than a specific collection.
    //await db.collection(travel).drop();
    await db.dropDatabase();
    travelCollection = await db.createCollection(travel);

    placeDes = [["Vegas", "Party, Casinos, Night life"],
    ["Atlantic City", "Casino, Beach, Night Life"],
    ["Arizona", "National Parks, Nature, Scenic"],
    ["Mount Rushmore", "National memorial"],
    ["New York", "City Culture, Night life, Museums, Parks, Bars"]];
    travelData = [];
    for (i = 0; i < placeDes.length; i++) {

        travelData[i] = (makeTravelDoc(placeDes[i][0], placeDes[i][1]));
    }

    await travelCollection.insertMany(travelData);

    travelcreated = await travelCollection.find().toArray();
    console.log("Travel Data inserted");
    console.log(travelcreated);

    //end travel data seed


    //adding users data seed
    //NM - Commenting the below collection drop line as starting the application gives 'MongoError: ns not found' error
   //await db.collection(users).drop();
    userCollection = await db.createCollection(users);


    var userJack = makeDoc("jack_d", "Jack Dawson", "", "01/01/1990", "M", "Hoboken", "Teacher", "S", "5516788900","jack_d@gmail.com",
        [travelData[0]._id, travelData[1]._id], "1", []);
    userJack.hashedPassword = "$2a$16$mEbkQxGZt3a/qidjcCb6O..ah9yyDlGRj2lWpSK/ebQJJjSp1ISmS";
    //password: password

    var userRose = makeDoc("rose_d", "Rose Dewitt", "", "11/03/1995", "F", "Hoboken", "Dancer", "S", "5516787000","rose_d@gmail.com",
        [travelData[1]._id, travelData[2]._id], "1", []);

    userlily = makeDoc("lilly", "Lilly Evans", "", "11/27/1989", "F", "Jerseycity", "Student", "L",
    "5516786000","lilly_evans123@gmail.com", [travelData[1]._id, travelData[2]._id], "1", []);


    usermary = makeDoc("mary", "Mary Morgan", "", "11/27/1990", "F", "New York", "Bartender", "S", "2416788900",
        "mary657@gmail.com", [travelData[3]._id, travelData[1]._id], "2", []);



    useranna = makeDoc("anna", "Anna James", "", "11/27/1989", "M", "Newark", "Pet shop owner", "S",
    "2216788900","anna_james@gmail.com", [travelData[4]._id, travelData[1]._id], "3", []);


    userjessi = makeDoc("jessi", "Jessica Charles", "", "11/27/1989", "F", "Beverly hills", "Chef", "S", "5516787777",
        "jessica.baker@gmail.com", [travelData[0]._id, travelData[2]._id], "1", []);


    userthomas = makeDoc("thomas", "Tom Marvolo", "", "11/27/1989", "M", "Cliffton", "Software Engineer", "G", "5511118900",
        "tom.riddle@gmail.com", [travelData[2]._id, travelData[1]._id], "1", []);


    userdane = makeDoc("dani", "Daniel Cliff", "", "11/27/1989", "F", "Chicago", "Dancer", "L", "5512228900",
        "daniel.cliff@gmail.com", [travelData[3]._id, travelData[1]._id], "2", []);


    // adding connections data seed
    //NM - Commenting the below collection drop line as starting the application gives 'MongoError: ns not found' error
    //await db.collection(connections).drop();
    connectionsColl = await db.createCollection(connections);
    coonection1=makeConDoc(userJack._id,userRose._id,"pending",travelData[1]._id,"11/27/2017");
    await connectionsColl.insert(coonection1);
    console.log("\n\Connections Data inserted");
    connins = await connectionsColl.find().toArray();
    console.log(connins);
    //end add connections

    userJack.connections.push(coonection1._id);
    userRose.connections.push(coonection1._id);

    usersList = [];
    usersList.push(userJack);
    usersList.push(userRose);
    usersList.push(userlily);
    usersList.push(usermary);
    usersList.push(useranna);
    usersList.push(userjessi);
    usersList.push(userthomas);
    usersList.push(userdane);


    res = await userCollection.insertMany(usersList);
    usersins = await userCollection.find().toArray();
    // console.log(usersins);

    


    
    return usersins;

}


var exports = module.exports = runSetup;