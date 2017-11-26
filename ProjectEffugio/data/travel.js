const uuidv1 = require('uuid/v4');
const bluebird = require("bluebird");
const Promise = bluebird.Promise;
const mongoCollections = require("../config/mongoCollections");
const travelList=mongoCollections.travel;
var ObjectID=require('mongodb').ObjectID;
var bcrypt = Promise.promisifyAll(require("bcrypt"));


let exportedMethods={
    

    async getAllTravel(){
    	const travelConnection = await travelList();
	    const listOfTravels = await travelConnection.find().toArray();
	    travels = [];

	    for(var val of listOfTravels){
	        oneTravel = {};
	        oneTravel._id = val._id;
	        oneTravel.name = val.name;
	        oneTravel.description = val.description;

	        travels.push(oneTravel);
	    }

	    return travels;
    },
    async getTravelById(_id){
	
	    if(!_id) throw 'provide id get the travel details';
	    const travelConnection = await travelList();
	    const listOfTravels = await travelConnection.find({_id: _id}).limit(1).toArray();
	    if (listOfTravels.length ===0) return null;
	    return listOfTravels[0];
    },
    async getIdByLocation(name){
	    if(!name) throw 'provide a name to give the location details';
	    const travelConnection = await travelList();
	    const listOfTravels = await travelConnection.find({name: name}).limit(1).toArray();
	    if (listOfTravels.length ===0) return null;
	    return listOfTravels[0];
    },

    async addTravelData(travelData){
	    const travelConnection = await travelList();
	    const newTravel = {
	        _id: uuidv1(),
	        name: travelData.name,
	        description: travelData.description
	    };
	    console.log(newTravel);
	    const newInsertedInformation = await travelConnection.insertOne(newTravel);
	    const newId = newInsertedInformation.insertedId;
	    console.log("inserted: "+newId);
	    return await this.getTravelById(newId);
	
    }


};

module.exports =  exportedMethods;
