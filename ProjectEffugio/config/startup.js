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
        //_id: uuidv1(),
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
    userJack._id ="245b3e48-f959-464b-9615-b07d187d78a8";
    
    //password: password

    var userRose = makeDoc("rose_d", "Rose Dewitt", "", "11/03/1995", "F", "Hoboken", "Dancer", "S", "5516787000","rose_d@gmail.com",
        [travelData[1]._id, travelData[2]._id], "1", []);
    userRose.hashedPassword = "$2a$16$biOzgZ.pj1lMO.sRg5MFZuAXLm5FCiWIuDu3hBO6.QXlEwrImJ28W";
    userRose._id="fc650072-441c-43f0-b50d-d681294488c5";    
    //password: password2

    userlily = makeDoc("lilly", "Lilly Evans", "", "11/27/1989", "F", "Jerseycity", "Student", "L",
    "5516786000","lilly_evans123@gmail.com", [travelData[1]._id, travelData[2]._id], "1", []);
    userlily._id="ea8cbd84-3e7f-48e6-a728-9fa314e943a1";
    
    usermartina = makeDoc("martina", "Martina Navratilova", "", "11/27/1989", "F", "Jersey City", "Sportswoman", "L",
    "55167861111","martina_nav123@gmail.com", [travelData[1]._id], "5", []);
    usermartina.hashedPassword = "$2a$16$KJmxifBk6RayA7SmsXyhcuKqQNv.uaxwy/krRtuUODQ6VhqhV1biC";
    usermartina._id="03aad18c-f71d-4593-945b-56a878264504";
    
    //password: password5

    usermary = makeDoc("mary", "Mary Morgan", "", "11/27/1990", "F", "New York", "Bartender", "S", "2416788900",
        "mary657@gmail.com", [travelData[3]._id, travelData[1]._id], "2", []);
    usermary._id="33aad18c-f41d-4593-945b-56a378264504";
        

    userjamesdean = makeDoc("jamesd", "James Dean", "", "11/27/1989", "M", "Newark", "Pet shop owner", "S",
    "2216788900","james_dean@gmail.com", [travelData[4]._id, travelData[1]._id], "3", []);
    userjamesdean.hashedPassword = "$2a$16$QIKZ.4E5fQ/SMViy2R4YpOtdd1OG.oWboEa8eYGwdkS1coFUJ/GRS";
    userjamesdean._id="97bya930-167d-453a-9513-b6da678c2c9b";
    
    //password: password3

    userjessi = makeDoc("jessi", "Jessica Charles", "", "11/27/1989", "F", "Beverly hills", "Chef", "S", "5516787777",
        "jessica.baker@gmail.com", [travelData[0]._id, travelData[2]._id], "1", []);
    userjessi._id="94f55a9e-5d23-4f92-a54c-d9ce59a47904";
        

    userthomas = makeDoc("thomas", "Tom Marvolo", "", "11/27/1989", "M", "Cliffton", "Software Engineer", "G", "5511118900",
        "tom.riddle@gmail.com", [travelData[2]._id, travelData[1]._id], "1", []);
    userthomas.hashedPassword = "$2a$16$Gyci2gGIPlr3lsAAuel.hOEK97aLjCqFaYE56RDURWdspHRiEUdTO";
    userthomas._id="9de813e6-fc51-422f-98e2-49b4316d2788";
    
    //password: password4


    userdane = makeDoc("dani", "Daniel Cliff", "", "11/27/1989", "M", "Chicago", "Dancer", "G", "5512228900",
        "daniel.cliff@gmail.com", [travelData[3]._id, travelData[1]._id], "2", []);
    userdane._id="7812ef31-40a9-4e79-900e-5947521738c6";
        
    
    userkate = makeDoc("kate", "Kate Winslet", "", "11/27/1998", "F", "New York", "Programmer", "S", "5512221111",
        "kate.winslet@gmail.com", [travelData[2]._id, travelData[3]._id, travelData[4]._id], "4", []);
    userkate._id="3817ef31-40a9-4e99-900e-5947981738c6";
        
    userleo = makeDoc("leo", "Leo Nardo Di Caprio", "", "11/27/1981", "M", "Cliffton", "Software Engineer", "S", "5511118900",
    "leo.caprio@gmail.com", [travelData[2]._id, travelData[1]._id], "1", []);
    userleo._id="9997ef31-40a9-4e99-900e-5947981738c9";
    
    // adding connections data seed
    //NM - Commenting the below collection drop line as starting the application gives 'MongoError: ns not found' error
    //await db.collection(connections).drop();
    connectionsColl = await db.createCollection(connections);
    coonection1=makeConDoc(userJack._id,userRose._id,"pending","","11/27/2017");
    connection2=makeConDoc(userRose._id,userjamesdean._id,"rejected","","11/27/2017");
    //connection3=makeConDoc(userkate._id,userJack._id,"pending","","12/27/2017");

    await connectionsColl.insert(coonection1);
    await connectionsColl.insert(connection2);
    //await connectionsColl.insert(connection3);
    console.log("\n\Connections Data inserted");
    connins = await connectionsColl.find().toArray();
    console.log(connins);
    //end add connections

    userJack.connections.push(coonection1._id);
    //userJack.connections.push(connection3._id);
    userRose.connections.push(coonection1._id);
    userRose.connections.push(connection2._id);
    userjamesdean.connections.push(connection2._id);
    //userkate.connections.push(connection3._id);
    

    usersList = [];
    usersList.push(userJack);
    usersList.push(userRose);
    usersList.push(userlily);
    usersList.push(usermary);
    usersList.push(usermartina);
    usersList.push(userjamesdean);
    usersList.push(userjessi);
    usersList.push(userthomas);
    usersList.push(userdane);
    usersList.push(userkate);
    usersList.push(userleo);

    res = await userCollection.insertMany(usersList);
    usersins = await userCollection.find().toArray();
    // console.log(usersins);

    return usersins;

}


var exports = module.exports = runSetup;