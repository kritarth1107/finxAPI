const schemesModel = require("./schemes.model");

module.exports = {
    list:()=>{
        return schemesModel.find();
    },
    getSingle:(code)=>{
        return schemesModel.findOne({productCode:code});
    }
}