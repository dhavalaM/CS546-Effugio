
 (function($) {
    
  
    
        try {
          // hide containers by default
          //users=suggestedUsers;
        //   [].slice.call(document.querySelectorAll("div"));
        
          var users;
        //   console.log("users:"+myusers);
          var x=document.getElementById("ConnectionsTable").getElementsByTagName('tbody')[0];
          console.log("users ::"+users);
          // deep clone the targeted row
          for (var j = 0; j < users.length; j++) {
          var new_row = x.insertRow(x.rows.length);
          
           var name  = new_row.insertCell(0);
           var nameText  = document.createTextNode(users[j].name);
           name.appendChild(nameText);
           new_row.appendChild(name);
           x.appendChild(new_row);
           console.log("appended ::"+users[j].name);
          }
          
        } catch (e) {
          const message = typeof e === "string" ? e : e.message;
          console.log(e);
        }
      
    
  })();