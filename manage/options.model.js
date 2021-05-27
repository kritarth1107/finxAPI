const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const optionsSchema = new Schema({
    leftSideBarTheme:{
        type:String,
        required:true   
    },
    darkMode:{
        type:String,
        required:true   
    },
    layoutBoxed:{
        type:String,
        required:true   
    },
    option_type:{
        type:String ,
        required:true  
    },
    DISTRIBUTOR:{
        type:String ,
        required:true 
    }


});

const Options = mongoose.model("options",optionsSchema);
module.exports = Options;