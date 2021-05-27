const foliosService = require("./folios.service");
const investorsService = require("../investors/investors.service");
const transactionsService = require("../transactions/transactions.service");

module.exports = {
    getFolios:(req,res)=>{
        const body = req.body;
        const header = req.headers;
        var folioResult; 
        var invResult; 
        investorsService.getSingle(body.pancard,header.authenticate).then(result=>{
            if(result)
            {
                invResult = result;
            }
            else
            {
                invResult = false;
            }
        });

        foliosService.getFolios(body.pancard,header.authenticate).then(result=>{
            if(result.length==0)
            {
                res.json({
                    success:false,
                    status:500
                });
            }
            else
            {
                folioResult = result;
                res.json({
                    success:true,
                    status:200,
                    ID:result._id,
                    INV_NAME:invResult.INV_NAME,
                    ADDRESS1:invResult.ADDRESS1,
                    ADDRESS2:invResult.ADDRESS2,
                    ADDRESS3:invResult.ADDRESS3,
                    CITY:invResult.CITY,
                    PINCODE:invResult.PINCODE,
                    INV_DOB:invResult.INV_DOB,
                    MOBILE_NO:invResult.MOBILE_NO,
                    OCCUPATION:invResult.OCCUPATION,
                    CRDATE:invResult.CRDATE,
                    INV_PROFILE:invResult.INV_PROFILE,
                    PAN_NO:invResult.PAN_NO,
                    EMAIL:invResult.EMAIL,
                    FOLIOS:folioResult
                });
            }
        });
    }
}