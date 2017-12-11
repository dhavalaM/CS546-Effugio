(function ($) {
  
    console.log("Ajax");
    
    profilearea = $("#profilearea");
    //profilearea.children().each(function(index, element) {
    profilearea.find("#connectrequeststatus").each(function(index, element){
        bindEventsToCheckProfile($(element));
      });
    
    
  function bindEventsToCheckProfile(checkprofile) {
      console.log("bind events");
    checkprofile.find(".finishItem").on("click", function(event) {
      event.preventDefault();
      var currentLink = $(this);
      var currentUser = currentLink.data("user");
      var userChecking = currentLink.data("id");
      console.log("currentUser:: "+currentUser);
      console.log("userChecking:: "+userChecking);
      var requestConfig = {
        method: "POST",
        url: "/users/checkprofile" ,
        contentType: "application/json",
        data: JSON.stringify({
          user: currentUser,
          checkuser: userChecking
        })
      };

      $.ajax(requestConfig).then(function(responseMessage) {
        console.log("Response from Ajax: ");
        console.log(responseMessage);
        var newElement = $(responseMessage);
        bindEventsToCheckProfile(newElement);
        checkprofile.replaceWith(newElement);
      });
    });

    
  }

 
  
  
  })(window.jQuery);