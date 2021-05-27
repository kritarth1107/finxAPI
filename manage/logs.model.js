const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const logsSchema = new Schema({
    logIP:{
        type:String,
        required:true   
    },
    logHost:{
        type:String,
        required:true   
    },
    logPage:{
        type:String,
        required:true   
    },
    logUser:{
        type:String ,
        required:true  
    },
    logDate:{
        type:Date,
        default: Date.now  
    }


});

const Logs = mongoose.model("logs",logsSchema);
module.exports = Logs;