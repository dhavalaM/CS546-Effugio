const express = require('express');
const router = express.Router();
var passport = require('passport');
var Strategy = require('passport-local').Strategy;
const data = require("../data");
const userData = data.users;
const travelData = data.travel;
const budgetData = data.budget;
const connectionData=data.connection;

var setCookie = require('set-cookie-parser');

passport.use(new Strategy(
  async function(username, password, cb) {
      console.log("user: pass:"+username+" "+password);
      var user= await userData.getUserbyUserId(username);
      if(!user){
          return cb(null, false, { message: 'Unknown User'});
      }
      var isMatch = await userData.comparePassword(password, user.hashedPassword);
      if(isMatch){
        return cb(null, user);
      } else {
            return cb(null, false, { message: 'Invalid password'});
      }

}));

passport.serializeUser( function(user, cb) {
    cb(null, user._id);
  });
  
passport.deserializeUser(async function(id, cb) {
  var user = await userData.getUser(id);
  cb(null, user);
  
});


router.get('/login',
function(req, res) {
  if (!req.isAuthenticated || !req.isAuthenticated()) {      
    res.render('users/login', { message: req.flash('error') });    
    
  }else{
    res.redirect('/profile');  
  }
});
//NM - Declaring errors empty list variable and adding new parameters - errors, hasErrors, updSuccess to res.render
router.get('/profile',
  require('connect-ensure-login').ensureLoggedIn("/"),
  async function (req, res) {
    let errors = [];
    let alllocationprefs = [];
    let budgetranges = [];

    try {
      budgetranges = budgetData.getAllBudget();
      alllocationprefs = await travelData.getAllTravel();

      res.render('users/profile', {
        errors: errors,
        hasErrors: false,
        updSuccess: false,
        user: req.user,
        locations: alllocationprefs,
        budgetranges: budgetranges
      });
    }
    catch (e) {
      errors.push(e);
      res.render('users/profile', {
        errors: errors,
        hasErrors: true,
        updSuccess: false,
        user: req.user,
        locations: alllocationprefs,
        budgetranges: budgetranges
      });
    }
  });

//NM - added a post method for My Profile page to send user profile updates to the database
router.post("/profile", async (req, res) => {
  let updatedProfileData = req.body;
  console.log("body: %j", req.body);
  let errors = [];
  let alllocationprefs = [];
  let budgetranges = [];

  if ((updatedProfileData.newPwd) || (updatedProfileData.newPwdConfirm)){
    if (updatedProfileData.newPwd !== updatedProfileData.newPwdConfirm){
    //console.log("Coming into if");
    errors.push("New Password and Confirm New Password don't match");
    }
  } 


  budgetranges = budgetData.getAllBudget();
  alllocationprefs = await travelData.getAllTravel();

  /*
  if (!blogPostData.body) {
    errors.push("No body provided");
  }
*/

  if (errors.length > 0) {
    //console.log("Inside errors.length if");
    res.render('users/profile', {
      errors: errors,
      hasErrors: true,
      updSuccess: false,
      user: updatedProfileData,
      locations: alllocationprefs,
      budgetranges: budgetranges
    });
    return;
  }

  try {
    //console.log("Inside try");
    if (req.body.location_pref) {
      let locationPrefList = [];
      //console.log("location pref length:"+req.body.location_pref.length);
      if (typeof (req.body.location_pref) === "object") {
        for (i = 0; i < req.body.location_pref.length; i++) {
          let myloc = req.body.location_pref[i];
          locationPrefList.push(myloc);
        }
      } else {
        let myloc = req.body.location_pref;
        locationPrefList.push(myloc);
      }
      updatedProfileData.location_pref = locationPrefList;
    }

    let updatedUserProfile = await userData.updateUser(updatedProfileData);
    res.render('users/profile', {
      errors: errors,
      hasErrors: false,
      updSuccess: true,
      user: updatedProfileData,
      locations: alllocationprefs,
      budgetranges: budgetranges
    });
    return;
  }
  catch (e) {
    //console.log("Inside catch");
    //res.status(500).json({ error: e });
    errors.push(e);
    res.render('users/profile', {
      errors: errors,
      hasErrors: true,
      updSuccess: false,
      user: updatedProfileData,
      locations: alllocationprefs,
      budgetranges: budgetranges
    });
  }
});

router.get('/dashboard',
  require('connect-ensure-login').ensureLoggedIn("/"),
  async function (req, res) {
    suggestedUsers = await userData.getSuggestedUsers(req.user);
    if (suggestedUsers != null) {
      //console.log("suggested users:: ");
      //console.log(suggestedUsers);

      res.render('users/dashboard', {
        users: suggestedUsers,
        user: req.user,
        helpers: {
          toage: function (dob) { return getAge(dob); }
        }
      },
      );
    }
  });

  router.get('/connections',
  require('connect-ensure-login').ensureLoggedIn("/"),
  async function(req, res){
    console.log("Inside Connections GET Route");
    connectionsToDisplay=[];    
    userConnections = await userData.getConnections(req.user._id);
    console.log(userConnections);
    if(userConnections!= null){
      
      console.log("Inside if condition passed userConnections!=null check");
      for(i=0;i<userConnections.length;i++){
        oneConnectionDisplay={};
        connectionDetails = await connectionData.getConnectionById(userConnections[i]);
        if(connectionDetails.requestor_id == req.user._id){
          userConnectionID = connectionDetails.connected_id;
        }
        else{
          userConnectionID = connectionDetails.requestor_id;
        }
      
        connectionUser = await userData.getUser(userConnectionID);
        oneConnectionDisplay["_id"] = connectionUser._id;
        oneConnectionDisplay["connection_id"]= connectionDetails._id;
        oneConnectionDisplay["name"] = connectionUser.name;
        oneConnectionDisplay["age"] = getAge(connectionUser.dob);
        oneConnectionDisplay["status"] = connectionDetails.status;
        
        //location = await travelData.getTravelById(connectionDetails.location_id);
        //oneConnectionDisplay["location"] = location.name;
        connectionsToDisplay.push(oneConnectionDisplay);
        
  
      }
      
        //console.log(connectionsToDisplay);
        res.render('users/connections', { users: connectionsToDisplay,
          user:req.user,
          helpers: {
            toage: function (dob) { return getAge(dob); }
        }},
      );
    }
  });

router.get('/checkprofile/:id',
  require('connect-ensure-login').ensureLoggedIn("/"),
  async function (req, res) {
    console.log("id:: " + req.params.id);
    checkuser = await userData.getUser(req.params.id);
    locations = await travelData.getAllTravel();
    connObj=await checkConnection(req.user._id,checkuser._id)
    res.render('users/checkprofile', {
      user: req.user, checkuser: checkuser, conn:connObj,
      helpers: {
        toage: function (dob) { return getAge(dob); },
        getlocation: function (id) {
          for (i = 0; i < locations.length; i++) {
            console.log("i:: " + i + " locations[i]._id:: " + locations[i]._id);
            if (locations[i]._id == id)
              return locations[i].name;
          }
        },
        getbudget: function (id) {
          val = budgetData.getBudgetById(parseInt(id));
          console.log("budget:: " + val);
          return val;
        }

      }
    });
  });

  router.post('/checkprofile',
  require('connect-ensure-login').ensureLoggedIn("/"),
  async function (req, res) {
    console.log("Post of checkprofile");
    connect= await connectionData.addConnection(req.body.user,req.body.checkuser);
    if(connect != null){
      console.log("user ::"+req.body.user)
			res1=await userData.addConnection(req.body.user,connect._id);
			res2=await userData.addConnection(req.body.checkuser,connect._id);
		}
    connObj=await checkConnection(req.user._id,checkuser._id);
    // res.json = {data: [res, dangerRate]};
    //res.json({ success: true, conn: connObj })
    res.render("partials/connect_item", { layout: null, conn: connObj });

  });


function getAge(dateString) {
  var today = new Date();
  var birthDate = new Date(dateString);
  var age = today.getFullYear() - birthDate.getFullYear();
  var m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}


async function checkConnection(userid,checkuserid){

  connection = await userData.checkConnection(userid,checkuserid);
  connObj={
    notConnected:false,
    connected: false,
    requestSent:false,
    requestReceieved:false,
    rejected:false
  }
  if(connection != null){
      if(connection.status == "accepted")
        connObj.connected=true;
      else if(connection.status == "rejected")
        connObj.rejected=true;
      else if(connection.status == "pending"){
        if(connection.requestor_id == userid)
          connObj.requestSent= true;
        else
          connObj.requestReceieved=true;
      }
      
    }
    else
      connObj.notConnected=true;

    return connObj;

}
router.post('/dashboard',
  function (req, res) {

  });

router.post('/login',
  passport.authenticate('local', { successRedirect: '/dashboard', failureRedirect: '/login', failureFlash: true }),
  function (req, res) {
    console.log('You are authenticated');
    res.redirect('/profile');
  });

router.get('/logout', function (req, res) {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/login');
});
// Register
router.get('/register', async function (req, res) {

  try {
    let locations = await travelData.getAllTravel();
    let budgetranges = budgetData.getAllBudget();

    res.render('users/register', { locations: locations, budgetranges: budgetranges });
  }
  catch (e) {
    response.status(500).json({ error: e });
  }
	
});
// Register User
router.post('/register', async function(req, res){

	// Validation
    req.checkBody('name', 'Name is required').notEmpty();
    req.checkBody('gender', 'Gender is required').notEmpty().not().equals('Select Gender');
  	req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email', 'Email is not valid').isEmail();
    req.checkBody('dob', 'Date of birth is required and should be a date').notEmpty();
    //req.checkBody('location', 'Location is required').notEmpty();
    req.checkBody('occupation', 'Occupation is required').notEmpty();
    req.checkBody('orientation', 'Orientation is required').notEmpty().not().equals('Select Orientation');;
    req.checkBody('contactInformation', 'Contact Information is required').notEmpty();
	  req.checkBody('user_id', 'Username is required').notEmpty();
	  req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('password2', 'Passwords do not match').equals(req.body.password);
    req.checkBody('budgetPreference', 'Budget Preference must be specified').notEmpty();
    req.checkBody('locationpref', 'Atleast one Location preference is required').notEmpty();
  var errors = req.validationErrors();
  
	if(errors){

    var errors_user={
      name:req.body.name ,
      user_id:req.body.user_id,
      password:req.body.password,
      password2:req.body.password2,
      dob:req.body.dob,
      gender:req.body.gender,
      location:req.body.location,
      occupation:req.body.occupation,
      orientation:req.body.orientation,
      contactInformation:req.body.contactInformation,
      email:req.body.email ,
      budget:req.body.budgetPreference,
      locationpref:req.body.locationpref
    };

    var locations = await travelData.getAllTravel();
    budgetranges=budgetData.getAllBudget();
    res.render('users/register', {locations:locations, budgetranges:budgetranges,errors:errors,user:errors_user} );


  } else {
    //NM - initiating new variable 'conns' and using this to set empty connections list for newUser. Otherwise connections
    //property does not get set for new users. This causes rejected promise errors later on in addConnection method of users data module where
    //push is called on user's connection property.
    var conns = [];
    /* userData.getUserbyUserId(req.body.user_id).then(function(user) {
      if(user){
        console.log("user"+user.name);
        let errorMessage="Username already exists";
      }
    }); */
    if(req.body.locationpref){
      var _location_pref=[];
      //console.log("location pref length:"+req.body.locationpref.length);
      if(typeof(req.body.locationpref) === "object" ){
        for (i = 0; i < req.body.locationpref.length; i++) { 
          var myloc=req.body.locationpref[i]; 
          _location_pref.push(myloc);
        }
      }else{
        var myloc=req.body.locationpref;
        _location_pref.push(myloc);
      }
    }
    const newUser = {
      user_id: req.body.user_id,
      hashedPassword: "",
      password: req.body.password,
      name: req.body.name,
      dob: req.body.dob,
      gender: req.body.gender,
      location: req.body.location,
      occupation: req.body.occupation,
      orientation: req.body.orientation,
      contact_info: req.body.contactInformation,
      email: req.body.email,
      budget: req.body.budgetPreference,
      location_pref: _location_pref,
      connections: conns
    };
    addedUser=await userData.addUser(newUser,newUser.password);
    console.log("added new user");
    console.log(addedUser);

    req.flash('success_msg', 'You are registered and can now login');
    res.redirect('/users/login');  
    
	}
});
module.exports = router;