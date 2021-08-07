const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const groupschema = new Schema({
    GROUP_TITLE:{
        type:String,
        required:true   
    },
    GROUP_ADMIN:{
        type:String,
        required:true   
    },
    GROUP_MEMS:{
        type:String,
        required:true   
    },
    DISTRIBUTOR:{
        type:String,
        required:true   
    },
    GROUP_CREATION:{
        type:Date,
        default: Date.now  
    }
});

const Groups = mongoose.model("groups",groupschema);
module.exports = Groups;