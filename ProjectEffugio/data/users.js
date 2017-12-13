const uuidv1 = require('uuid/v4');
const bluebird = require("bluebird");
const Promise = bluebird.Promise;
const mongoCollections = require("../config/mongoCollections");
const usersList = mongoCollections.users;
var ObjectID = require('mongodb').ObjectID;
var bcrypt = Promise.promisifyAll(require("bcrypt"));
const connections = require("./connection");
//const travels = require("./travel");
//const budgets = require("./budget");


let exportedMethods = {

    //Get the user based on user id - useful in login
    async  getUserbyUserId(user_id) {
        if (!user_id) throw "You must provide an id to search for a user";

        const userCollection = await usersList();
        const listOfUsers = await userCollection.find({ user_id: user_id }).limit(1).toArray();
        if (listOfUsers.length === 0) return null;

        return listOfUsers[0];
    },

    //Get the user based on uuid _id
    async  getUser(_id) {
        if (!_id) throw "You must provide an id to search for a user";

        const userCollection = await usersList();
        const listOfUsers = await userCollection.find({ _id: _id }).limit(1).toArray();
        if (listOfUsers.length === 0) throw "Could not find user with username " + _id;

        return listOfUsers[0];


    },

    //Get all users in the system
    async getAllUsers() {

        const userCollection = await usersList();
        const listOfUsers = await userCollection.find().toArray();


        allusers = [];
        oneUser = {};

        //NM - Corrected spelling of orientation, added email and contact_info attributes
        for (var val of listOfUsers) {
            oneUser = {};
            oneUser._id = val._id;
            oneUser.user_id = val.user_id;
            oneUser.name = val.name;
            oneUser.hashedPassword = val.hashedPassword;
            oneUser.dob = val.dob;
            oneUser.gender = val.gender;
            oneUser.location = val.location;
            oneUser.occupation = val.occupation;
            oneUser.orientation = val.orientation;
            oneUser.contact_info = val.contact_info;
            oneUser.email = val.email;
            oneUser.location_pref = val.location_pref;
            oneUser.connections = val.connections;
            oneUser.budget = val.budget

            allusers.push(oneUser);
        }

        return allusers;
    },

    //Get connections of a user
    async  getConnections(_id) {
        if (!_id) throw "You must provide an id to search for a recipe";
        console.log("Inside data module getConnections");
        console.log("User Id passed in: " + _id);
        user = await this.getUser(_id);

        return user.connections;
    },

    //add user to the collection
    //NM - Corrected spelling of orientation, added email attribute
    async addUser(user, password) {

        const userCollection = await usersList();

        const newUser = {
            _id: uuidv1(),
            user_id: user.user_id,
            hashedPassword: "",
            name: user.name,
            dob: user.dob,
            gender: user.gender,
            location: user.location,
            occupation: user.occupation,
            orientation: user.orientation,
            contact_info: user.contact_info,
            email: user.email,
            budget: user.budget,
            location_pref: user.location_pref,
            connections: user.connections
        };


        const hash = await bcrypt.hashAsync(password, 16.5);

        newUser.hashedPassword = hash;


        //console.log(newUser);
        const newInsertInformation = await userCollection.insertOne(newUser);
        const newId = newInsertInformation.insertedId;
        //console.log("inserted: "+newId);
        return await this.getUser(newId);
    },

    //add connection to user
    //NM - Corrected spelling of orientation, added email attribute
    async addConnection(id, connectedid) {
        if (typeof connectedid !== "string") throw "No connectedid provided";


        oldUser = await this.getUser(id);

        const newUser = {
            _id: oldUser._id,
            user_id: oldUser.user_id,
            name: oldUser.name,
            dob: oldUser.dob,
            gender: oldUser.gender,
            location: oldUser.location,
            occupation: oldUser.occupation,
            orientation: oldUser.orientation,
            contact_info: oldUser.contact_info,
            email: oldUser.email,
            budget: oldUser.budget,
            location_pref: oldUser.location_pref,
            hashedPassword: oldUser.hashedPassword,
            connections: oldUser.connections

        };
        newUser.connections.push(connectedid);
        const userCollection = await usersList();

        output = await userCollection.updateOne({ _id: newUser._id }, newUser);
        console.log("added user:: "+output.modifiedCount)
        return await this.getUser(newUser._id);
    },

    async updateUser(user) {

        oldUser = await this.getUser(user._id);
        const updatedUser = {
            _id: oldUser._id,
            user_id: oldUser.user_id,
            name: oldUser.name,
            dob: oldUser.dob,
            gender: oldUser.gender,
            location: oldUser.location,
            occupation: oldUser.occupation,
            orientation: oldUser.orientation,
            contact_info: oldUser.contact_info,
            email: oldUser.email,
            budget: oldUser.budget,
            location_pref: oldUser.location_pref,
            hashedPassword: oldUser.hashedPassword,
            connections: oldUser.connections

        };

       /* if (user.user_id) {
            //console.log("Inside duplicate username check in updateUser");
            let usernameExists = await this.getUserbyUserId(user.user_id);
            //console.log(usernameExists);
            if ((usernameExists) && (usernameExists._id !== user._id)) {
                throw "This username already exists. Please pick another username";
                return;
            }
            else {
                updatedUser.user_id = user.user_id;
            }
        }*/

        //TODO: check here or in html??
        if (user.name != null) {
            updatedUser.name = user.name;
        }

        if (user.dob != null) {
            updatedUser.dob = user.dob;
        }

        if (user.gender != null) {
            updatedUser.gender = user.gender;
        }

        if (user.location != null) {
            updatedUser.location = user.location;
        }

        if (user.occupation != null) {
            updatedUser.occupation = user.occupation;
        }

        if (user.orientation != null) {
            updatedUser.orientation = user.orientation;
        }

        if (user.contact_info != null) {
            updatedUser.contact_info = user.contact_info;
        }
        if (user.email != null) {
            updatedUser.email = user.email;
        }
        if (user.budget != null) {
            updatedUser.budget = user.budget;
        }
        if (user.location_pref != null) {
            updatedUser.location_pref = user.location_pref;
        }
        //NM - Added update password functionality on My Profile page
        //console.log("User newPwd Length");
        //console.log(user.newPwd.length);
        if ((user.newPwd !== null) && (user.newPwd.length>0)){
            //console.log("Inside data module updateUser method's Password Update check");
            const hash = await bcrypt.hashAsync(user.newPwd, 16.5);
            updatedUser.hashedPassword = hash;
        }

        /*
        result= await this.comparePassword(password,oldUser.hashedPassword);
        if (!result){
            const hash = await bcrypt.hashAsync(password, 16.5);
            updatedUser.hashedPassword=hash;
        }*/


        const userCollection = await usersList();
        // our first parameters is a way of describing the document to update;
        // our second will be a replacement version of the document;
        output = await userCollection.updateOne({ _id: updatedUser._id }, updatedUser);
        return await this.getUser(updatedUser._id);
    },

    //remove user
    async removeUser(id) {
        const userCollection = await usersList();
        const deletionInfo = await userCollection.removeOne({ _id: id });
        if (deletionInfo.deletedCount === 0) {
            return null;
        }
        return deletionInfo.deletedCount;
    },

    //remove connection
    async removeConnection(id, connectionToRemove) {
        changeUser = await this.getUser(id);
        conn = [];
        
        for (var val of changeUser.connections) {
            if (connectionToRemove != val) {
                conn.push(val);
            }
        };

        changeUser.connections = conn;
        const userCollection = await usersList();
        output = await userCollection.updateOne({ _id: changeUser._id }, changeUser);
        if (output.updatedCount === 0) {
            throw `Could not delete comment with id of ${id}`;
        }
        return await this.getUser(changeUser._id);
    },

    async getSuggestedUsers(user) {

        const userCollection = await usersList();

        connectionsOfUser = await connections.getConnectionByConnectedId(user._id);
        connectionsOfUser2 = await connections.getConnectionByRequestorId(user._id);
        connectionsIds = [];
        if (connectionsOfUser != null) {


            for (i = 0; i < connectionsOfUser.length; i++) {
                connectionsIds.push(connectionsOfUser[i]._id);
            }
        }

        if (connectionsOfUser2 != null) {
            for (i = 0; i < connectionsOfUser2.length; i++) {
                connectionsIds.push(connectionsOfUser2[i]._id);
            }
        }

        var findOrientation = "";
        if (user.orientation == 'S') {
            item = await userCollection.find({
                $and: [
                    // {location_pref:{ $in: user.location_pref }},
                    { _id: { $ne: user._id } },
                    { gender: { $ne: user.gender } },
                    { orientation: user.orientation },
                    { connections: { $nin: connectionsIds } },
                    { location_pref: { $in: user.location_pref } },

                ]
            }).toArray();
            //  console.log(item)
        }
        else {
            item = await userCollection.find({
                $and: [
                    // {location_pref:{ $in: user.location_pref }},
                    { _id: { $ne: user._id } },
                    { gender: user.gender },
                    { orientation: user.orientation },
                    { connections: { $nin: connectionsIds } },
                    { location_pref: { $in: user.location_pref } }

                ]
            }).toArray();
            //  console.log(item)
        }

        return item;

    },

    async checkConnection(userid, checkerid){
        connectionsOfUser = await connections.getConnectionByConnectedId(userid);
        connectionsOfUser2 = await connections.getConnectionByRequestorId(userid);
        if (connectionsOfUser != null) {
                        for (i = 0; i < connectionsOfUser.length; i++) {
                            if(connectionsOfUser[i].requestor_id == checkerid)
                                return connectionsOfUser[i];
                            
                        }
                    }
        if (connectionsOfUser2 != null) {
                        
                        for (i = 0; i < connectionsOfUser2.length; i++) {
                            
                            if(connectionsOfUser2[i].connected_id == checkerid)
                                return connectionsOfUser2[i];
                        }
        }
        return null;
            
    },

    //compare the passwords
    async comparePassword(password, hash) {
        result = await bcrypt.compareAsync(password, hash);
        return result;
    },

    //NM - added email
    async makeDoc(_id, user_id, name, hashedPassword, dob, gender, location, occupation, orientation,
        contact_info, email) {
        return {
            _id: uuidv1(),
            user_id: user_id,
            name: name,
            hashedPassword: "",
            dob: dob,
            gender: gender,
            location: location,
            occupation: occupation,
            orientation: orientation,
            contact_info: contact_info,
            email: email,
            location_pref: [],
            budget: "",
            connections: []

        }
    }

}

module.exports = exportedMethods;