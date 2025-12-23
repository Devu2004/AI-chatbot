const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique:true
    },
    username:{
        type:String,
        required:true
    },
    password:{
        type:String
    }
},
{
timestamps:true
}
)

const usermodel = mongoose.model('users',userSchema);

module.exports = usermodel

