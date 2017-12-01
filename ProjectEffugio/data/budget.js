const budget = [{id:1,range:"100-200"},{id:2,range:"200-300"},{id:3,range:"300-400"},{id:4,range:"400-500"},
{id:5,range:">500"}];

module.exports={
getBudgetById:  function(id){
    for (var i = 0, len = budget.length; i < len; i++) {
        var record = budget[i];
        if (record.id === id) {
          return record.range;
        }
      }
      return null;
    //return budget[id];
},

getIdByBudget:  function(inputBudget){
    for (var i = 0, len = budget.length; i < len; i++) {
        var record = budget[i];
        if (record.range === inputBudget) {
          return record.id;
        }
      }
    return null;
},
getAllBudget:   function(){
    return budget;
}

}; 

