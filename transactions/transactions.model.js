const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const transactionsSchema = new Schema({
    PRODCODE:{
        type:String,
        required:true   
    },
    FOLIO_NO:{
        type:String,
        required:true   
    },
    TRXNNO:{
        type:String,
        required:true   
    },
    TRX_DATE:{
        type:String,
        required:true   
    },
    UNITS:{
        type:String,
        required:true   
    },
    PURPRICE:{
        type:String,
        required:true   
    },
    AMOUNT:{
        type:String,
        required:true   
    },
    TD_NAV:{
        type:String,
        required:true   
    },
    STAMP_DUTY:{
        type:String,
        required:true   
    },
    TRX_NATURE:{
        type:String,
        required:true   
    },
    REGISTRAR:{
        type:String,
        required:true   
    },
    DISTRIBUTOR:{
        type:String,
        required:true   
    },
    CREATEDATE:{
        type:String,
        required:true   
    },
    TRX_FLAG:{
        type:String,
        required:true   
    }
});

const Schemes = mongoose.model("transactions",transactionsSchema);

module.exports = Schemes;