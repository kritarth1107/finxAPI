const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const foliosSchema = new Schema({
    BROKER_COD:{
        type:String,
        required:true   
    },
    FOLIOCHK:{
        type:String,
        required:true   
    },
    PAN_NO:{
        type:String,
        required:true   
    },
    PRODUCT:{
        type:String,
        required:true   
    },
    SCH_CODE:{
        type:String,
        required:true   
    },
    SCH_IISN:{
        type:String,
        required:true   
    },
    SCH_NAME:{
        type:String,
        required:true   
    },
    SCH_AMC:{
        type:String,
        required:true   
    },
    SCH_CATEGORY:{
        type:String,
        required:true   
    },
    REP_DATE:{
        type:String,
        required:true   
    },
    FOLIO_DATE:{
        type:String,
        required:true   
    },
    REGISTRAR:{
        type:String,
        required:true   
    },
    CREATEDON:{
        type:String,
        required:true   
    },
    LASTUPDATE:{
        type:String,
        required:true   
    },
    DISTRIBUTOR:{
        type:String,
        required:true   
    },
    FOLIO_FLAG:{
        type:String,
        required:true   
    }
});

const Schemes = mongoose.model("folios",foliosSchema);

module.exports = Schemes;