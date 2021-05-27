const investorsModel = require("./investors.model");

module.exports = {
    getSingle:(pan,dist)=>{
        return investorsModel.findOne({PAN_NO:pan,DISTRIBUTOR:dist});
    }
}