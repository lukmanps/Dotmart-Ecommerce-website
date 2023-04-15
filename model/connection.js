const MongoClient = require("mongodb").MongoClient;
require('dotenv').config();
const state = {
    db: null
}

//mongodb://0.0.0.0:27017/
module.exports.connect = function (done) {
    const url = process.env.MONGODB_LINK;
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




