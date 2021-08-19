const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const manageSchema = new Schema({
    mKey:{
        type:String,
        required:true   
    },
    mUser:{
        type:String,
        required:true   
    },
    mEmail:{
        type:String,
        required:true   
    },
    mPassword:{
        type:String,
        required:true   
    },
    mPerson:{
        type:String,
        required:true   
    },
    mBusiness:{
        type:String,
        required:true   
    },
    mWebsite:{
        type:String,
        required:true   
    },
    mFlag:{
        type:String,
        required:true   
    },
    mLogo:{
        type:String,
        required:true   
    },
    mLogoLight:{
        type:String,
        required:true   
    },
    mMobile:{
        type:String,
        required: [true, 'User phone number required']
    }
});

const Manages = mongoose.model("manages",manageSchema);
module.exports = Manages;
