const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const navSchema = new Schema({
    ISIN_1:{
        type:String,
        required:true   
    },
    ISIN_2:{
        type:String,
        required:true   
    },
    NAV:{
        type:String,
        required:true   
    },
    NAV_DATE:{
        type:String,
        required:true   
    }
});

const Navs = mongoose.model("navs",navSchema);
module.exports = Navs;