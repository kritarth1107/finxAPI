const schemesService = require("./schemes.service");
const schemesmodel = require("./schemes.model");


const getALlAMC = async (req,res)=>{
    // /const amc = schemesmodel.find
}
module.exports = {
    getAllSchemes:(req,res)=>{
        schemesService.list().then(result=>{
            if(result.length==0)
            {
                res.json({
                    success:false,
                    status:500,
                    RECORDS:result
                });
            }
            else
            {
                res.json({
                    success:true,
                    status:200,
                    RECORDS:result
                });
            }
        });
    },
    getSingleSchemes:(req,res)=>{
        const body = req.body;
        schemesService.getSingle(body.productCode).then(result=>{
            if(!result)
            {

                res.json({
                    success:false,
                    status:500
                });
            }
            else
            {
                res.json({
                    success:true,
                    status:200,
                    schemeCode:result.schemeCode,
                    fundAMC:result.fundAMC,
                    fundName:result.fundName,
                    fundDescription:result.fundDescription,
                    productCode:result.productCode,
                    fundRegistrar:result.fundRegistrar,
                    productIISN:result.productIISN
                });
            }
        });
    }
    
}