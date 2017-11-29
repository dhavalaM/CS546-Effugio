const express = require('express');
const router = express.Router();
var passport = require('passport');
var Strategy = require('passport-local').Strategy;
const data = require("../data");
const userData= data.users;
const travelData=data.travel;
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

router.get('/profile',
require('connect-ensure-login').ensureLoggedIn("/"),
function(req, res){
  res.render('users/profile', { user: req.user});
});

router.get('/dashboard',
require('connect-ensure-login').ensureLoggedIn("/"),
function(req, res){
  userData.getSuggestedUsers(req.user).then(suggestedUsers=>{
    if(suggestedUsers!= null){
      // for (user in users){
        // req.body.addUser(user);
        
        res.render('users/dashboard', { users: suggestedUsers,
          user:req.user,
          helpers: {
            toage: function (dob) { return getAge(dob); }
        }},
      );
          // }
          // res.render('users/dashboard', { user: users});
    }
  });
  
  
  //res.render('users/dashboard', { user: null});
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
router.get('/register', function(req, res){
	res.render('users/register');
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
    req.checkBody('budgetPreference', 'Budget Preference must be a number').isInt();
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
      budget:req.body.budgetPreference
    };
    console.log(errors_user.location);
    res.render('users/register',{
      errors:errors,user:errors_user
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
        travelData.getIdByLocation(myloc).then(function(loc) {
          _location_pref.push(loc._id);
      }, function(errorMessage) {
          response.status(500).json({ error: errorMessage });
      });
      }
    }else{
      var myloc=req.body.locationpref;
      travelData.getIdByLocation(myloc).then(function(loc) {
        //console.log("loc"+loc._id);
        _location_pref.push(loc._id);
    }, function(errorMessage) {
        response.status(500).json({ error: errorMessage });
    });
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
    });
  
		req.flash('success_msg', 'You are registered and can now login');

    res.redirect('/users/login');
    
	}
});
module.exports = router;