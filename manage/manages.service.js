const managesModel = require("./manages.model");

module.exports = {
    create:(data)=>{
        return managesModel.create(data);
    },
    getManageByMobile:(mob)=>{
        return managesModel.find();
    },
    getManageByWebsite:(web,mob,key)=>{
        return managesModel.find({mWebsite:web,mMobile:mob,mKey:key});
    },
    checkHost:(host,flag)=>{
        return managesModel.findOne({mWebsite:host,mFlag:flag});
    },
    getManageLogin:(web,email)=>{
        return managesModel.findOne({mWebsite:web,mEmail:email});
    },
    checkManage:(web,key,flag)=>{
        return managesModel.findOne({mWebsite:web,mKey:key,mFlag:flag});
    }
}