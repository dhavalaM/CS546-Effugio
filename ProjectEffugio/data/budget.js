const budget={
    "1":"100-200",
    "2":"200-300",
    "3":"300-400",
    "4":"400-500",
    "5":"500>"
}
module.exports={
getBudgetById:  function(id){
    return budget[id];
},

getIdByBudget:  function(inputBudget){
    for(var key in budget) {
        if(budget[key]==inputBudget)
        return key;

    }
    return null;
}
};