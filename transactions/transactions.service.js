const transactionsModel = require("./transactions.model");

module.exports = {
    getTransactions:(prod,folio,dist)=>{
        return transactionsModel.find({PRODCODE:prod,FOLIO_NO:folio,DISTRIBUTOR:dist});
    },
    getSingle:(code)=>{
        return transactionsModel.findOne({productCode:code});
    }
}