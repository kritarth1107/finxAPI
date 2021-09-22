const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const schemesSchema = new Schema({
    fundAMC:{
        type:String,
        required:true   
    },
    fundPurchase:{
        type:String,
        required:true   
    },
    fundDescription:{
        type:String,
        required:true   
    },
    productCode:{
        type:String,
        required:true   
    },
    productIISN:{
        type:String,
        required:true   
    },
    minPurchase:{
        type:String,
        required:true   
    },
    fundCategory:{
        type:String,
        required:true   
    },
    schemeCode:{
        type:String,
        required:true   
    },
    fundRegistrar:{
        type:String,
        required:true   
    }
});

const Schemes = mongoose.model("Schemes",schemesSchema);

module.exports = Schemes;