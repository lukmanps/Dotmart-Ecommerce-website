const MongoClient = require("mongodb").MongoClient;
const state={
    db:null
}

module.exports.connect=function (done) 
{
    const url="mongodb+srv://luqmansha6:LukmanpsDot6@dotmart.sw6jazg.mongodb.net/test";
    const dbname="Dotmart"; 

    MongoClient.connect(url,{ useNewUrlParser: true, useUnifiedTopology:true}, (err,data)=>
    {
        if(err)
        {
            return done(err);
        }
        else{
            state.db=data.db(dbname);
        }
    })
    done();
}

module.exports.get=function()
{
    return state.db
}
    



