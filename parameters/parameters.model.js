const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const parametersSchema = new Schema({
    P_TYPE:{
        type:String,
        required:true   
    },
    P_VALUE_BSE:{
        type:String,
        required:true   
    },
    P_PLACEHOLDER:{
        type:String,
        required:true   
    }
});

const Parameters = mongoose.model("parameters",parametersSchema);
module.exports = Parameters;
