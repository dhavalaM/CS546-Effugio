const uuidv1 = require('uuid/v4');
const bluebird = require("bluebird");
const Promise = bluebird.Promise;
const mongoCollections = require("../config/mongoCollections");
const connectionList=mongoCollections.connection;
var ObjectID=require('mongodb').ObjectID;
var bcrypt = Promise.promisifyAll(require("bcrypt"));
var dateTime = require('node-datetime');
const userdata=require('./users');

let exportedMethods={
    async getConnectionById(_id){
        if(!_id){
            throw 'you must provide an connection id to search';
        }

        const connectionCollection = await connectionList();
	    const listOfConnections = await connectionCollection.find({_id: _id}).limit(1).toArray();
	    if (listOfConnections.length ===0) return null;
	    return listOfConnections[0];
    },
    async getConnectionByRequestorId(requestor_id){
	    if(!requestor_id) throw 'provide an requestor id'
        const connectionCollection = await connectionList();
	    const listOfConnections = await connectionCollection.find({requestor_id: requestor_id}).toArray();
	    if (listOfConnections.length ===0) return null;
	    return listOfConnections;
	
    },
    async getConnectionByConnectedId(connected_id){
	    if(!connected_id) throw 'provide an connector id'
        const connectionCollection = await connectionList();
	    const listOfConnections = await connectionCollection.find({connected_id: connected_id}).toArray();
	    if (listOfConnections.length ===0) return null;
	    return listOfConnections;

	},
	
	async getConnectionByUserIds(requestoruserid1, receiveruserid2){
		if((!requestoruserid1)||(!receiveruserid2)){
			throw "Provide both the user ids to get the connection between two users";
			return null;
		}
		const connectionCollection = await connectionList();
		const conn = await connectionCollection.findOne({
			$and: [
				// {location_pref:{ $in: user.location_pref }},
				{ requestor_id: requestoruserid1 },
				{ connected_id: receiveruserid2 }
			]
		});
		if(conn){
			return conn;
		}
		else {
			throw "No connection found for these two users";
			return null;
		}

	},

    async getAllConnections(){
        const connectionCollection = await connectionList();
	    const listOfConnections = await connectionCollection.find().toArray();
	    allConnections = [];


	    for(var val of listOfConnections){
	        oneConnection={};
	        oneConnection._id = val._id;
	        oneConnection.requestor_id = val.requestor_id;
	        oneConnection.connected_id = val.connected_id;
	        oneConnection.status = val.status;
	        oneConnection.location_id = val.location_id;
	        oneConnection.date_initiated = val.date_initiated;

	        allConnections.push(oneConnection);
	    }

	    return allConnections;
	},
	
    async addConnection(requestorid,connectedid){
        const connectionCollection = await connectionList();
		var dt = dateTime.create();
		var formatted = dt.format('m/d/Y H:M:S');
		console.log(formatted);
	    const newConnection = {
	        _id: uuidv1(),
	        requestor_id: requestorid,
	        connected_id: connectedid,
	        status: "pending",
	        location_id: "",
	        date_initiated: formatted
	    };

	    console.log(newConnection);
	    const newInsertedInformation = await connectionCollection.insertOne(newConnection);
	    const newId = newInsertedInformation.insertedId;
	    console.log("inserted: "+newId);
		conn= await this.getConnectionById(newId);
		
		return conn;
	},
	
	async updateConnStatus(connId, statusVal){
		//console.log("Inside updateConnStatus in data module");
		//console.log("Status value passed to the method: "+statusVal);
		const validStatus = ['accepted', 'rejected','pending'];

		if(!connId){
			throw 'You must provide a connection id to update connection status';
			return null;
		}

		if(!validStatus.includes(statusVal)){
			throw 'You must provide a valid status to update the connection status';
			return null;
		}

        const connectionCollection = await connectionList();
		const updateConn = await connectionCollection.updateOne({ _id: connId }, {$set: {"status":statusVal}});
		if (updateConn.modifiedCount === 0) {
			throw "Could not update the connection status successfully";
			return null;
		  }
		  return await this.getConnectionById(connId);
	},

    async removeConnection(_id){
	    if(!_id) throw 'provide an id to delete';
        const connectionCollection = await connectionList();
	    const deletionInfo = await connectionCollection.removeOne({ _id: _id});
	    if (deletionInfo.deletedCount ===0){
	        return null;
		}
		return deletionInfo.deletedCount;
    }




};

module.exports =  exportedMethods;
