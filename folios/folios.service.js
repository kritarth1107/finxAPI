const foliosModel = require("./folios.model");

module.exports = {
    list:()=>{
        return foliosModel.find();
    },
    getFolios:(pan,dist)=>{
        return foliosModel.find({PAN_NO:pan,DISTRIBUTOR:dist});
    }
}