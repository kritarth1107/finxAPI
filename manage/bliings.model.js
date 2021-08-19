const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bliingschema = new Schema({
    DISTRIBUTOR:{
        type:String,
        required:true   
    },
    PLAN:{
        type:String,
        required:true   
    },
    VALIDITY:{
        type:String,
        required:true   
    },
    MESSAGE:{
        type:String,
        required:true   
    }
});

const bliings = mongoose.model("bliings",bliingschema);
module.exports = bliings;
