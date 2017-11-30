const MongoClient = require("mongodb").MongoClient;
runStartup = require("./startup.js");
//runStartup2 = require("../date/startup2.js");




const settings = {
    mongoConfig: {
        serverUrl: "mongodb://localhost:27017/",
        database: "effugio"
    }
};

let fullMongoUrl = settings.mongoConfig.serverUrl + settings.mongoConfig.database;
let _connection = undefined

runStartup().then(function(alluser) {
    console.log("After the advanced document setup has been complete, we have the following users:");
    console.log(alluser);
});

let connectDb = (async) => {
    if (!_connection) {
        _connection = MongoClient.connect(fullMongoUrl)
            .then((db) => {
                return db;
            });
    }

    return _connection;
};
//console.log(runstartup2);
//allusers = await runStartup2.connectionStartup();
//console.log(allusers);

module.exports = connectDb;
