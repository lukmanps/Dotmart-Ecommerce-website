const MongoClient = require("mongodb").MongoClient;
require('dotenv').config();

const { MONGODB_LINK } = process.env;

const state = {
    db: null
};

module.exports.connect = function (done) {
    const dbname = "Dotmart";

    MongoClient.connect(MONGODB_LINK, { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
        if (err) {
            console.error('Error connecting to MongoDB:', err.message);
            return done(err);
        }

        state.db = client.db(dbname);
        console.log('Connected to MongoDB successfully!');
        done();
    });
};

module.exports.get = function () {
    return state.db;
};