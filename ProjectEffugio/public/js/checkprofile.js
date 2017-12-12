(function ($) {
  
    console.log("Ajax");
    
    profilearea = $("#profilearea");
    //profilearea.children().each(function(index, element) {
    profilearea.find("#connectrequeststatus").each(function(index, element){
        bindEventsToCheckProfile($(element));
        bindEventsToAcceptRequest($(element));
        bindEventsToRejectRequest($(element));
      });
    
   //Ajax code to handle click of Connect hyperlink i.e. adding a connection with pending staus and showing on page
   //that request sent 
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
          checkuser: userChecking,
          sendConnReq: true,
          sendAcceptReq: false,
          sendRejectReq: false
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

  //Ajax code to handle click of Accept Request hyperlink i.e. updating connection status to accepted and showing on 
  //page that request accepted
  function bindEventsToAcceptRequest(checkprofile) {
    console.log("bind events of Accept Request");
  checkprofile.find(".acceptItem").on("click", function(event) {
    event.preventDefault();
    var currentLink = $(this);
    var currentUser = currentLink.data("user");
    var userChecking = currentLink.data("id");
    console.log("Accept Request currentUser:: "+currentUser);
    console.log("Accept Request userChecking:: "+userChecking);
    var requestConfig = {
      method: "POST",
      url: "/users/checkprofile" ,
      contentType: "application/json",
      data: JSON.stringify({
        user: currentUser,
        checkuser: userChecking,
        sendConnReq: false,
        sendAcceptReq: true,
        sendRejectReq: false
      })
    };

    $.ajax(requestConfig).then(function(responseMessage) {
      console.log("Response from Ajax: ");
      console.log(responseMessage);
      var newElement = $(responseMessage);
      bindEventsToAcceptRequest(newElement);
      checkprofile.replaceWith(newElement);
    });
  });
}

 //Ajax code to handle click of Reject Request hyperlink i.e. updating connection status to rejected and showing on 
  //page that request rejected
  function bindEventsToRejectRequest(checkprofile) {
    console.log("bind events of Reject Request");
  checkprofile.find(".rejectItem").on("click", function(event) {
    event.preventDefault();
    var currentLink = $(this);
    var currentUser = currentLink.data("user");
    var userChecking = currentLink.data("id");
    console.log("Reject Request currentUser:: "+currentUser);
    console.log("Reject Request userChecking:: "+userChecking);
    var requestConfig = {
      method: "POST",
      url: "/users/checkprofile" ,
      contentType: "application/json",
      data: JSON.stringify({
        user: currentUser,
        checkuser: userChecking,
        sendConnReq: false,
        sendAcceptReq: false,
        sendRejectReq: true
      })
    };

    $.ajax(requestConfig).then(function(responseMessage) {
      console.log("Response from Ajax: ");
      console.log(responseMessage);
      var newElement = $(responseMessage);
      bindEventsToRejectRequest(newElement);
      checkprofile.replaceWith(newElement);
    });
  });
}
  
  })(window.jQuery);