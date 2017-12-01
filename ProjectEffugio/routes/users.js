const express = require('express');
const router = express.Router();
var passport = require('passport');
var Strategy = require('passport-local').Strategy;
const data = require("../data");
const userData= data.users;
const travelData=data.travel;
const budgetData=data.budget;

var setCookie = require('set-cookie-parser');

passport.use(new Strategy(
    function(username, password, cb) {
        console.log("user: pass:"+username+" "+password);
        userData.getUserbyUserId(username).then((user)=> {
          // if (err) { return cb(err); }
          //if (!user) { return cb(null, false); }
          if(!user){
            return cb(null, false, { message: 'Unknown User'});
          }
          userData.comparePassword(password, user.hashedPassword).then((isMatch)=>{
            // if(err) throw err;
            if(isMatch){
              return cb(null, user);
            } else {
              return cb(null, false, { message: 'Invalid password'});
            }
        });
      });
}));


passport.serializeUser(function(user, cb) {
    cb(null, user._id);
  });
  
passport.deserializeUser(function(id, cb) {
  userData.getUser(id).then((user)=> {
      
      cb(null, user);
    });
});


router.get('/login',
function(req, res) {
  if (!req.isAuthenticated || !req.isAuthenticated()) {      
    res.render('users/login', { message: req.flash('error') });    
    
  }else{
    res.redirect('/profile');  
  }

  /************************************************************************** */
  //For test
  /*userData.getAllUsers().then((result)=>{
    console.log("Got all users:: ");
    console.log(result);

    userData.getUser(result[0]._id).then((firstUser)=>{
      console.log("Got first users:: ");
      console.log(firstUser);
      userData.addConnection(result[0]._id,result[1]._id).then((updated)=>{
        console.log("Updated first users:: ");
        console.log(updated);
        userData.getConnections(updated._id).then((connections)=>{
          console.log("connections of id:: "+updated._id);
          console.log(connections);
          userToAdd={
            user_id:"",
            name:"Jamie Randall",
            hashedpassword:"",
            age:30,
            gender:"M",
            location:"Hoboken",
            occupation:"Fireman",
            orientation:"S",
            contact_info:"4567891234",
            location_pref:[],
            connections:[]
          }
          userData.addUser(userToAdd,"password").then((addedUser)=>{
            console.log("added new user");
            console.log(addedUser);
            userToAdd._id=addedUser._id;
            userData.removeConnection(result[0]._id,result[1]._id).then((rem)=>{
              console.log("removed:: ");
              console.log(rem);
              userData.getAllUsers().then((all)=>{
                console.log("Got first users:: ");
                console.log(all);
                userToAdd.name="Jamie Randall R"
                userData.updateUser(userToAdd).then((s)=>{
                  console.log("updated:: ");
                  console.log(s);
                  res.json(s);
                });
              });
            });
          });
          
        });
        
      });
      
    });
    
  });*/
  /************************************************************************** */
});
/* router.get("/profile",(req, res) => {
  console.log("user"+req.user);
    res.render("users/profile", {});
}); */

//NM - Declaring errors empty list variable and adding new parameters - errors, hasErrors, updSuccess to res.render
router.get('/profile',
require('connect-ensure-login').ensureLoggedIn("/"),
async function(req, res){
  let errors = [];
  let alllocationprefs = [];
  let budgetranges = [];
  //let userLocPrefList = [];
  //let userBudgetList = [];

  try{
    budgetranges = await budgetData.getAllBudget();
    alllocationprefs = await travelData.getAllTravel();
    //userLocPrefList = await userData.getLocPrefList(req.user._id);
    //userBudgetList = await userData.getBudgetObj(req.user._id);
  
    res.render('users/profile', {
      errors: errors,
      hasErrors: false,
      updSuccess: false,
      user: req.user,
      //userLocPrefs:userLocPrefList,
      //userBudget:userBudgetList,
      locations:alllocationprefs, 
      budgetranges:budgetranges
    });
  }
  catch(e){
    errors.push(e);
    res.render('users/profile', {
      errors: errors,
      hasErrors: true,
      updSuccess: false,
      user: req.user,
      //userLocPrefs:userLocPrefList,
      //userBudget:userBudgetList,
      locations:alllocationprefs, 
      budgetranges:budgetranges
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
  //let userLocPrefList = [];
  //let userBudgetList = [];

  budgetranges = await budgetData.getAllBudget();
  alllocationprefs = await travelData.getAllTravel();
  //userLocPrefList = await userData.getLocPrefList(updatedProfileData._id);
  //userBudgetList = await userData.getBudgetObj(updatedProfileData._id);

  //Converting the age from string (default datatype from HTML forms) to number for storing in database as integer
  //if (updatedProfileData.age) {
  //  updatedProfileData.age = Number(updatedProfileData.age);
  //}

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
    //userLocPrefs:userLocPrefList,
    //userBudget:userBudgetList,
    locations:alllocationprefs, 
    budgetranges:budgetranges
  });
  return;
}

try{
  //console.log("Inside try");
  if(req.body.location_pref){
    let locationPrefList=[];
    //console.log("location pref length:"+req.body.location_pref.length);
    if(typeof(req.body.location_pref) === "object" ){
      for (i = 0; i < req.body.location_pref.length; i++) { 
        let myloc=req.body.location_pref[i]; 
        locationPrefList.push(myloc);
      }
    }else{
      let myloc=req.body.location_pref;
      locationPrefList.push(myloc);
    }
    updatedProfileData.location_pref=locationPrefList;
  }
  
  let updatedUserProfile = await userData.updateUser(updatedProfileData,updatedProfileData.hashedPassword);
  res.render('users/profile', {
    errors: errors,
    hasErrors: false,
    updSuccess: true,
    user: updatedProfileData,
    //userLocPrefs:userLocPrefList,
    //userBudget:userBudgetList,
    locations:alllocationprefs, 
    budgetranges:budgetranges
  });
  return;
}
catch(e){
  //console.log("Inside catch");
  //res.status(500).json({ error: e });
  errors.push(e);
  res.render('users/profile', {
    errors: errors,
    hasErrors: true,
    updSuccess: false,
    user: updatedProfileData,
    //userLocPrefs:userLocPrefList,
    //userBudget:userBudgetList,
    locations:alllocationprefs, 
    budgetranges:budgetranges
  });
}
});

router.get('/dashboard',
require('connect-ensure-login').ensureLoggedIn("/"),
async function(req, res){
  suggestedUsers= await userData.getSuggestedUsers(req.user);
  if(suggestedUsers!= null){
    //console.log("suggested users:: ");
    //console.log(suggestedUsers);
      
      res.render('users/dashboard', { users: suggestedUsers,
        user:req.user,
        helpers: {
          toage: function (dob) { return getAge(dob); }
      }},
    );
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

router.post('/dashboard',
function(req,res){

});

router.post('/login',
passport.authenticate('local', {successRedirect:'/dashboard', failureRedirect:'/login',failureFlash: true}),
function(req, res) {
   console.log('You are authenticated');    
    res.redirect('/profile');
});

router.get('/logout',function(req, res){
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/login');
});
// Register
router.get('/register', async function(req, res){
  
  try{
    let locations = await travelData.getAllTravel();
    let budgetranges = await budgetData.getAllBudget();

    res.render('users/register', {locations:locations, budgetranges:budgetranges} );
  }
  catch(e){
    response.status(500).json({ error: e });
  }
  /*
  travelData.getAllTravel().then(function(locations) {
    //console.log(locations);
    
    budgetranges=await budgetData.getAllBudget();
   //console.log(budgetranges);
    res.render('users/register', {locations:locations, budgetranges:budgetranges} );
    
}, function(errorMessage) {
    response.status(500).json({ error: errorMessage });
});*/
	
});
// Register User
router.post('/register', function(req, res){

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
    //req.checkBody('budgetPreference', 'Budget Preference must be a number').isInt();
  var errors = req.validationErrors();
  
	if(errors){
  /*   res.render('users/register',{
      errors:errors,
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
      budget:req.body.budgetPreference
    }); */
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
    console.log(errors_user.location);
   /*  res.render('users/register',{
      errors:errors,user:errors_user
    }); */
  travelData.getAllTravel().then(function(locations) {
      //console.log(locations);
      
      budgetranges=budgetData.getAllBudget();
      //console.log(budgetranges);
      res.render('users/register', {locations:locations, budgetranges:budgetranges,errors:errors,user:errors_user} );
      
  }, function(errorMessage) {
      response.status(500).json({ error: errorMessage });
  });


	} else {
    /* userData.getUserbyUserId(req.body.user_id).then(function(user) {
      if(user){
        console.log("user"+user.name);
        let errorMessage="Username already exists";
      }
    }); */
    if(req.body.locationpref){
      var _location_pref=[];
      console.log("location pref length:"+req.body.locationpref.length);
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
      user_id:req.body.user_id,
      hashedPassword:"",
      password:req.body.password,
      name:req.body.name,
      dob:req.body.dob,
      gender:req.body.gender,
      location:req.body.location,
      occupation:req.body.occupation,
      orientation:req.body.orientation,
      contact_info:req.body.contactInformation,
      email:req.body.email,
      budget:req.body.budgetPreference,
      location_pref:_location_pref,
      connections:[]
    };
    userData.addUser(newUser,newUser.password).then((addedUser)=>{
    console.log("added new user");
    console.log(addedUser);
    
    req.flash('success_msg', 'You are registered and can now login');
    res.redirect('/users/login');
    });
  
		
    
	}
});
module.exports = router;