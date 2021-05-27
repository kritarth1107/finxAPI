const usersModel = require("./users.model");

module.exports = {
    create:(data)=>{
        return usersModel.create(data);
    },
    list:()=>{
        return usersModel.find();
    },
    getUsersByID:(id)=>{
        return usersModel.findById(id);
    },
    getUsersByMobile:(mob)=>{
        return usersModel.findOne({mobile:mob});
    },
    uodateuser:(id, data)=>{
        return usersModel.findByIdAndUpdate(id,data);
    },
    deleteUser:(id)=>{
        return usersModel.deleteOne({_id:id});
    }
}