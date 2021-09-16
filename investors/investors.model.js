const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const investorsSchema = new Schema({
    INV_NAME:{
        type:String,
        required:true   
    },
    ADDRESS1:{
        type:String,
        required:true   
    },
    ADDRESS2:{
        type:String,
        required:true   
    },
    ADDRESS3:{
        type:String,
        required:true   
    },
    CITY:{
        type:String,
        required:true   
    },
    PINCODE:{
        type:String,
        required:true   
    },
    INV_DOB:{
        type:String,
        required:true   
    },
    MOBILE_NO:{
        type:String,
        required:true   
    },
    OCCUPATION:{
        type:String,
        required:true   
    },
    EMAIL:{
        type:String,
        required:true   
    },
    PAN_NO:{
        type:String,
        required:true   
    },
    AADHAAR:{
        type:String,
        required:true   
    },
    PASSWORD:{
        type:String,
        required:true   
    },
    BANK_NAME:{
        type:String,
        required:true   
    },
    BRANCH:{
        type:String,
        required:true   
    },
    AC_TYPE:{
        type:String,
        required:true   
    },
    AC_NO:{
        type:String,
        required:true   
    },
    HOLDING_NA:{
        type:String,
        required:true   
    },
    CRDATE:{
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
    PWD_UPD:{
        type:String,
        required:true   
    },
    INV_APP:{
        type:String,
        required:true   
    },
    INV_GROUP:{
        type:String,
        required:true   
    },
    DISTRIBUTOR:{
        type:String,
        required:true   
    },
    INV_PROFILE:{
        type:String,
        required:true   
    },
    INV_FLAG:{
        type:String,
        required:true   
    },
    UCC:{
        type:String,
        required:true   
    },
});

const Users = mongoose.model("investors",investorsSchema);

module.exports = Users;