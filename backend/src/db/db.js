const mongoose = require('mongoose')

function connectToDB(){
    mongoose.connect(process.env.MONGO_DB_URI).then(()=>{
        console.log('Db Successfully connected!');
    }).catch((err)=>{
        console.log(err);
    })
}

module.exports = connectToDB