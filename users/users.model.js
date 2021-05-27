const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const usersSchema = new Schema({
    name:{
        type:String,
        required:true   
    },
    password:{
        type:String,
        required:true   
    },
    mobile:{
        
        type:String,
        required: [true, 'User phone number required']
    }
});

const Users = mongoose.model("users",usersSchema);

module.exports = Users;