const express = require('express');
const router = express.Router();
var passport = require('passport');
var Strategy = require('passport-local').Strategy;
const data = require("../data");
const userData = data.users;
const travelData = data.travel;
const budgetData = data.budget;
const connectionData=data.connection;
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloud_name: 'effugio',
  api_key: '266718785839255',
  api_secret: 'YoIwSpXNsaiRXNNB1EDp_gGmhOs'
});
var setCookie = require('set-cookie-parser');
var xss = require("xss");

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
        budgetranges: budgetranges,
        profilePicID:req.user._id
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
        budgetranges: budgetranges,
        profilePicID:req.user._id
      });
    }
  });

//NM - added a post method for My Profile page to send user profile updates to the database
router.post("/profile", multipartMiddleware,async (req, res) => {
    let updatedProfileData = req.body;
    
    updatedProfileData.location = xss(req.body.location, {
      whiteList:          [],        // empty, means filter out all tags
      stripIgnoreTag:     true,      // filter out all HTML not in the whilelist
      stripIgnoreTagBody: ['script'] // the script tag is a special case, we need
                                     // to filter out its content
    });
    updatedProfileData.occupation = xss(req.body.occupation, {
      whiteList:          [],        
      stripIgnoreTag:     true,      
      stripIgnoreTagBody: ['script']
    });
    updatedProfileData.contact_info = xss(req.body.contact_info, {
      whiteList:          [],        
      stripIgnoreTag:     true,      
      stripIgnoreTagBody: ['script']
    });
    updatedProfileData.email = xss(req.body.email, {
      whiteList:          [],        
      stripIgnoreTag:     true,      
      stripIgnoreTagBody: ['script']
    });
    updatedProfileData.newPwd = xss(req.body.newPwd, {
      whiteList:          [],        
      stripIgnoreTag:     true,      
      stripIgnoreTagBody: ['script']
    });
    updatedProfileData.newPwdConfirm = xss(req.body.newPwdConfirm, {
      whiteList:          [],        
      stripIgnoreTag:     true,      
      stripIgnoreTagBody: ['script']
    });

  //console.log("body: %j", req.body);
  console.log("Updated Profile Info: ");
  console.log(updatedProfileData);

  let errors = [];
  let alllocationprefs = [];
  let budgetranges = [];

  if(updatedProfileData.location.length===0){
    let error_msg="Valid location not provided";
    errors.push(error_msg);
  }
  if(updatedProfileData.occupation.length===0){
    let error_msg="Valid occupation not provided";
    errors.push(error_msg);
  }
  if(updatedProfileData.email.length===0){
    let error_msg="Valid email not provided";
    errors.push(error_msg);
  }

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
      budgetranges: budgetranges,
      profilePicID:req.user._id
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
      budgetranges: budgetranges,
      profilePicID:req.user._id
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
      budgetranges: budgetranges,
      profilePicID:req.user._id
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
    //console.log("Inside Connections GET Route");
    connectionsToDisplay=[];    
    userConnections = await userData.getConnections(req.user._id);
    //console.log(userConnections);
    if(userConnections!= null){
      
      //console.log("Inside if condition passed userConnections!=null check");
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
      user: req.user, checkuser: checkuser, conn:connObj,profilePicID:checkuser._id,
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

  router.get('/delete/:id',
  require('connect-ensure-login').ensureLoggedIn("/"),
  async function (req, res) {
    console.log("id:: " + req.params.id);
    connection = await userData.getConnections(req.params.id);
    console.log("connections ::"+ connection)

    requestorConnections=await connectionData.getConnectionByRequestorId(req.params.id);
    if(requestorConnections != null){
      for  (var i = 0; i < requestorConnections.length; i++) {
        deleteConn= await userData.removeConnection(requestorConnections[i].connected_id,requestorConnections[i]._id);
        // if(deleteConn != null){
        //   console.log("deletd where req: "+deleteConn);
        // }
  
    }
  }
  
    receivedConnections=await connectionData.getConnectionByConnectedId(req.params.id);
    if(receivedConnections != null){
      for  (var i = 0; i < receivedConnections.length; i++) {
        deleteConn1= await userData.removeConnection(receivedConnections[i].connected_id,receivedConnections[i]._id);
        // if(deleteConn1 != null){
        //   console.log("deletd where req: "+deleteConn1);
        // }
  
    }
  }
    
    for  (var i = 0; i < connection.length; i++) {
      deleteConn2= await connectionData.removeConnection(connection[i]);
      // if(deleteConn2 != null){
      //   console.log("deletd: "+deleteConn2);
      // }
  }
  removeUser = await userData.removeUser(req.params.id);
    // if(removeUser  != null){
    //   console.log("Removed count:: "+removeUser)
    // }
    name=req.user.name
    req.logout();
    res.render('users/deleted', {
      name: name, 
      
    });
  });

  router.post('/checkprofile',
  require('connect-ensure-login').ensureLoggedIn("/"),
  async function (req, res) {
    console.log("Post of checkprofile");
    if(req.body.sendConnReq){
      //console.log("Inside if condition of sendConnReq");
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
    }
    else if(req.body.sendAcceptReq){
      //console.log("Inside if condition of sendAcceptReq");
      var statusVal = "accepted";
      acceptReq = await connectionData.getConnectionByUserIds(req.body.checkuser,req.body.user);
      if(acceptReq!= null){
        updConnReq = await connectionData.updateConnStatus(acceptReq._id, statusVal);
      }
        connObj=await checkConnection(req.body.checkuser,req.body.user);
        res.render("partials/connect_item", { layout: null, conn: connObj });
    }
    else{
      //console.log("Inside else i.e. sendRejectReq is true");
      var statusVal = "rejected";
      rejectReq = await connectionData.getConnectionByUserIds(req.body.checkuser,req.body.user);
      if(rejectReq!= null){
        updConnReq = await connectionData.updateConnStatus(rejectReq._id, statusVal);
      }
        connObj=await checkConnection(req.body.checkuser,req.body.user);
        res.render("partials/connect_item", { layout: null, conn: connObj });

    }

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
router.post('/register', multipartMiddleware, async function(req, res){

	// Validation
    req.checkBody('name', 'Name is required').notEmpty();
    req.checkBody('gender', 'Gender is required').notEmpty().not().equals('Select Gender');
  	req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email', 'Email is not valid').isEmail();
    req.checkBody('dob', 'Date of birth is required and should be a date').notEmpty();
    req.checkBody('location', 'Location is required').notEmpty();
    req.checkBody('occupation', 'Occupation is required').notEmpty();
    req.checkBody('orientation', 'Orientation is required').notEmpty().not().equals('Select Orientation');;
    req.checkBody('contactInformation', 'Contact Information is required').notEmpty();
	  req.checkBody('user_id', 'Username is required').notEmpty();
	  req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('password2', 'Passwords do not match').equals(req.body.password);
    req.checkBody('budgetPreference', 'Budget Preference must be specified').notEmpty();
    req.checkBody('locationpref', 'Atleast one Location preference is required').notEmpty();
  var errors = req.validationErrors();
  //console.log(errors.length);
 // console.log(typeof(errors));
  
  //console.log("Filename :"+req.body.uploadPicture);
  var imageFile = req.files.uploadPicture.path;
  var imageFileName = xss(req.files.uploadPicture.name, {
    whiteList:          [],        // empty, means filter out all tags
    stripIgnoreTag:     true,      // filter out all HTML not in the whilelist
    stripIgnoreTagBody: ['script'] // the script tag is a special case, we need
                                   // to filter out its content
  });
 
if(!imageFileName) {
  let error_msg={"msg" :"Please select a profile picture for upload",
                 "param":"uploadPicture" };
    if(!errors){
      errors=[];
      errors.push(error_msg);
      //console.log(typeof(errors));
    }else{
      errors.push(error_msg);
    }
    console.log("no file selected!!");
  }else{

   // let ext = (imageFileName.split("."))[1];
    var ext = imageFileName.split(".").pop().toLowerCase();
    if(ext != "png" && ext !="jpg" ){
      let error_msg={"msg" :"Profile picture must be a .png or .jpg file",
      "param":"uploadPictureext" };
      if(!errors){
        errors=[];
        errors.push(error_msg);
        //console.log(typeof(errors));
      }else{
        errors.push(error_msg);
      }
    }
    console.log("ext is "+ext);

  }

  if(xss(req.body.user_id, {
    whiteList:          [],        // empty, means filter out all tags
    stripIgnoreTag:     true,      // filter out all HTML not in the whilelist
    stripIgnoreTagBody: ['script'] // the script tag is a special case, we need
                                   // to filter out its content
  })){
    user=await userData.getUserbyUserId(xss(req.body.user_id, {
      whiteList:          [],        // empty, means filter out all tags
      stripIgnoreTag:     true,      // filter out all HTML not in the whilelist
      stripIgnoreTagBody: ['script'] // the script tag is a special case, we need
                                     // to filter out its content
    }));
    if(user){
        console.log("Username "+user.name+" already exists");
        //let errorMessage="Username already exists";
        let error_msg={"msg" :"Username already exists",
        "param":"user_id" };
        if(!errors){
          errors=[];
          errors.push(error_msg);
          //console.log(typeof(errors));
        }else{
          errors.push(error_msg);
        }
    }
}

const newUser = {
  user_id: xss(req.body.user_id, {
    whiteList:          [],        // empty, means filter out all tags
    stripIgnoreTag:     true,      // filter out all HTML not in the whilelist
    stripIgnoreTagBody: ['script'] // the script tag is a special case, we need
                                   // to filter out its content
  }),
  hashedPassword: "",
  password: xss(req.body.password, {
    whiteList:          [],       
    stripIgnoreTag:     true,      
    stripIgnoreTagBody: ['script']
  }),
  name: xss(req.body.name, {
    whiteList:          [],       
    stripIgnoreTag:     true,      
    stripIgnoreTagBody: ['script'] 
  }),
  dob: xss(req.body.dob, {
    whiteList:          [],       
    stripIgnoreTag:     true,      
    stripIgnoreTagBody: ['script'] 
  }),
  gender: req.body.gender,
  location: xss(req.body.location, {
    whiteList:          [],       
    stripIgnoreTag:     true,      
    stripIgnoreTagBody: ['script'] 
  }),
  occupation: xss(req.body.occupation, {
    whiteList:          [],       
    stripIgnoreTag:     true,      
    stripIgnoreTagBody: ['script']
  }),
  orientation: req.body.orientation,
  contact_info: xss(req.body.contactInformation, {
    whiteList:          [],        // empty, means filter out all tags
    stripIgnoreTag:     true,      // filter out all HTML not in the whilelist
    stripIgnoreTagBody: ['script'] // the script tag is a special case, we need
                                   // to filter out its content
  }),
  email: xss(req.body.email, {
    whiteList:          [],        // empty, means filter out all tags
    stripIgnoreTag:     true,      // filter out all HTML not in the whilelist
    stripIgnoreTagBody: ['script'] // the script tag is a special case, we need
                                   // to filter out its content
  }),
};

if(newUser.user_id.length===0){
  let error_msg={"msg" :"Valid username not provided",
  "param":"user_id" };
  if(!errors){
    errors=[];
    errors.push(error_msg);
    //console.log(typeof(errors));
  }else{
    errors.push(error_msg);
  }
}
if(newUser.password.length===0){
  let error_msg={"msg" :"Valid password not provided",
  "param":"password" };
  if(!errors){
    errors=[];
    errors.push(error_msg);
    //console.log(typeof(errors));
  }else{
    errors.push(error_msg);
  }
}
if(newUser.name.length===0){
  let error_msg={"msg" :"Valid name not provided",
  "param":"name" };
  if(!errors){
    errors=[];
    errors.push(error_msg);
    //console.log(typeof(errors));
  }else{
    errors.push(error_msg);
  }
}
if(newUser.dob.length===0){
  let error_msg={"msg" :"Valid date of birth not provided",
  "param":"dob" };
  if(!errors){
    errors=[];
    errors.push(error_msg);
    //console.log(typeof(errors));
  }else{
    errors.push(error_msg);
  }
}
if(newUser.location.length===0){
  let error_msg={"msg" :"Valid location not provided",
  "param":"location" };
  if(!errors){
    errors=[];
    errors.push(error_msg);
    //console.log(typeof(errors));
  }else{
    errors.push(error_msg);
  }
}
if(newUser.occupation.length===0){
  let error_msg={"msg" :"Valid occupation not provided",
  "param":"occupation" };
  if(!errors){
    errors=[];
    errors.push(error_msg);
    //console.log(typeof(errors));
  }else{
    errors.push(error_msg);
  }
}
if(newUser.email.length===0){
  let error_msg={"msg" :"Valid email not provided",
  "param":"email" };
  if(!errors){
    errors=[];
    errors.push(error_msg);
    //console.log(typeof(errors));
  }else{
    errors.push(error_msg);
  }
}

	if(errors){

    var errors_user={
      name:xss(req.body.name, {
        whiteList:          [],        // empty, means filter out all tags
        stripIgnoreTag:     true,      // filter out all HTML not in the whilelist
        stripIgnoreTagBody: ['script'] // the script tag is a special case, we need
                                       // to filter out its content
      }) ,
      user_id:xss(req.body.user_id, {
        whiteList:          [],        // empty, means filter out all tags
        stripIgnoreTag:     true,      // filter out all HTML not in the whilelist
        stripIgnoreTagBody: ['script'] // the script tag is a special case, we need
                                       // to filter out its content
      }),
      password:xss(req.body.password, {
        whiteList:          [],        // empty, means filter out all tags
        stripIgnoreTag:     true,      // filter out all HTML not in the whilelist
        stripIgnoreTagBody: ['script'] // the script tag is a special case, we need
                                       // to filter out its content
      }),
      password2:xss(req.body.password2, {
        whiteList:          [],        // empty, means filter out all tags
        stripIgnoreTag:     true,      // filter out all HTML not in the whilelist
        stripIgnoreTagBody: ['script'] // the script tag is a special case, we need
                                       // to filter out its content
      }),
      dob:xss(req.body.dob, {
        whiteList:          [],        // empty, means filter out all tags
        stripIgnoreTag:     true,      // filter out all HTML not in the whilelist
        stripIgnoreTagBody: ['script'] // the script tag is a special case, we need
                                       // to filter out its content
      }),
      gender:req.body.gender,
      location:xss(req.body.location, {
        whiteList:          [],        // empty, means filter out all tags
        stripIgnoreTag:     true,      // filter out all HTML not in the whilelist
        stripIgnoreTagBody: ['script'] // the script tag is a special case, we need
                                       // to filter out its content
      }),
      occupation:xss(req.body.occupation, {
        whiteList:          [],        // empty, means filter out all tags
        stripIgnoreTag:     true,      // filter out all HTML not in the whilelist
        stripIgnoreTagBody: ['script'] // the script tag is a special case, we need
                                       // to filter out its content
      }),
      orientation:req.body.orientation,
      contactInformation:xss(req.body.contactInformation, {
        whiteList:          [],        // empty, means filter out all tags
        stripIgnoreTag:     true,      // filter out all HTML not in the whilelist
        stripIgnoreTagBody: ['script'] // the script tag is a special case, we need
                                       // to filter out its content
      }),
      email:xss(req.body.email, {
        whiteList:          [],        // empty, means filter out all tags
        stripIgnoreTag:     true,      // filter out all HTML not in the whilelist
        stripIgnoreTagBody: ['script'] // the script tag is a special case, we need
                                       // to filter out its content
      }) ,
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
    /*
    const newUser = {
      user_id: xss(req.body.user_id, {
        whiteList:          [],        // empty, means filter out all tags
        stripIgnoreTag:     true,      // filter out all HTML not in the whilelist
        stripIgnoreTagBody: ['script'] // the script tag is a special case, we need
                                       // to filter out its content
      }),
      hashedPassword: "",
      password: xss(req.body.password, {
        whiteList:          [],        // empty, means filter out all tags
        stripIgnoreTag:     true,      // filter out all HTML not in the whilelist
        stripIgnoreTagBody: ['script'] // the script tag is a special case, we need
                                       // to filter out its content
      }),
      name: xss(req.body.name, {
        whiteList:          [],        // empty, means filter out all tags
        stripIgnoreTag:     true,      // filter out all HTML not in the whilelist
        stripIgnoreTagBody: ['script'] // the script tag is a special case, we need
                                       // to filter out its content
      }),
      dob: xss(req.body.dob, {
        whiteList:          [],        // empty, means filter out all tags
        stripIgnoreTag:     true,      // filter out all HTML not in the whilelist
        stripIgnoreTagBody: ['script'] // the script tag is a special case, we need
                                       // to filter out its content
      }),
      gender: xss(req.body.gender),
      location: xss(req.body.location, {
        whiteList:          [],        // empty, means filter out all tags
        stripIgnoreTag:     true,      // filter out all HTML not in the whilelist
        stripIgnoreTagBody: ['script'] // the script tag is a special case, we need
                                       // to filter out its content
      }),
      occupation: xss(req.body.occupation, {
        whiteList:          [],        // empty, means filter out all tags
        stripIgnoreTag:     true,      // filter out all HTML not in the whilelist
        stripIgnoreTagBody: ['script'] // the script tag is a special case, we need
                                       // to filter out its content
      }),
      orientation: xss(req.body.orientation),
      contact_info: xss(req.body.contactInformation, {
        whiteList:          [],        // empty, means filter out all tags
        stripIgnoreTag:     true,      // filter out all HTML not in the whilelist
        stripIgnoreTagBody: ['script'] // the script tag is a special case, we need
                                       // to filter out its content
      }),
      email: xss(req.body.email, {
        whiteList:          [],        // empty, means filter out all tags
        stripIgnoreTag:     true,      // filter out all HTML not in the whilelist
        stripIgnoreTagBody: ['script'] // the script tag is a special case, we need
                                       // to filter out its content
      }),*/
      newUser.budget = req.body.budgetPreference;
      newUser.location_pref = _location_pref;
      newUser.connections = conns;
    //};
    addedUser=await userData.addUser(newUser,newUser.password);
    console.log("added new user");
    console.log(addedUser);
    if(imageFileName){
      //let result=await cloudinary.api.resource(imageFile); 
      console.log("imageFile :"+imageFile);
      var addedUserid=addedUser._id;
      var result =await cloudinary.uploader.upload(imageFile,{public_id:addedUserid});
      //console.log("Result :"+result); 
      console.log("Result :"+result.url); 
    
    } 
    req.flash('success_msg', 'You are registered and can now login');
    res.redirect('/users/login');  
    
	}
});
module.exports = router;