const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const investorsSchema = new Schema({
    INV_NAME:{
        type:String,
        required:true   
    },
    ADDRESS1:{
        default:" ",
        type:String,   
    },
    ADDRESS2:{
        default:" ",
        type:String,
    },
    ADDRESS3:{
        default:" ",
        type:String
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
        default:"NOT PROVIDED",
        type:String,
    },
    MOBILE_NO:{
        default:"NOT PROVIDED",
        type:String, 
    },
    OCCUPATION:{
        default:"08",
        type:String
    },
    EMAIL:{
        default:"NOT PROVIDED",
        type:String,
    },
    PAN_NO:{
        type:String,
        required:true   
    },
    AADHAAR:{
        default:"NOT PROVIDED",
        type:String
    },
    PASSWORD:{
        type:String,
        required:true   
    },
    BANK_NAME:{
        type:String,
        default:"NOT PROVIDED"  
    },
    BRANCH:{
        type:String,
        default:"NOT PROVIDED"   
    },
    AC_TYPE:{
        type:String,
        default:"SA"   
    },
    AC_NO:{
        type:String,
        default:"NOT PROVIDED"  
    },
    HOLDING_NA:{
        default:"SI",
        type:String,  
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
        default:"NONE",
        type:String, 
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
        default:"NO",
        type:String,
    },
});

const Users = mongoose.model("investors",investorsSchema);

module.exports = Users;