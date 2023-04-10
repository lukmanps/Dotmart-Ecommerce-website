const MongoClient = require("mongodb").MongoClient;
const state = {
    db: null
}


//mongodb://0.0.0.0:27017/
//mongodb+srv://lukman:Lukmanps6@dotmart.sw6jazg.mongodb.net/?retryWrites=true&w=majority
//mongodb+srv://lukman:Lukmanps6@dotmart.sw6jazg.mongodb.net/?retryWrites=true&w=majority
module.exports.connect = function (done) {
    const url = "mongodb+srv://lukman:Lukmanps6@dotmart.sw6jazg.mongodb.net/?retryWrites=true&w=majority";
    const dbname = "Dotmart";

    MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, (err, data) => {
        if (err) {
            return done(err);
        }

        state.db = data.db(dbname);
        done();
    })

}

module.exports.get = function () {
    return state.db
}




