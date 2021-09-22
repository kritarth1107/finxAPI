const schemesService = require("./schemes.service");
const schemesmodel = require("./schemes.model");
const parametersModel = require("../parameters/parameters.model");


const getParameters = async (req,res)=>{
    // /const amc = schemesmodel.find
        const parametersX = await parametersModel.find();
        if(parametersX.length>0)
        {
            return res.status(200).json({ success:true,status:200,message: "Parameters!!",parameters:parametersX });
        }
        else
        {
            return res.status(500).json({ success:false,status:500,message: "No Parameters Found!!" });
        }
}

const updateSchemes = async (req,res) =>{
    try
    {
        const body = req.body;
        const header = req.headers;
        var upd=0;
        var total=0;
        if(header.auth=="7d3c660eba7dccd51bcf1ecbe22221a7")
        {
            const deleteData = await schemesmodel.remove({});
            var obj = JSON.parse(body.records);
            for(var i=0;i<obj.length;i++)
            {
                const create = await schemesmodel.create(obj[i]);
                if(create!=null)
                {
                    upd++;
                }
                total++;
            }

            return res.status(200).json({ success:false,status:200,message:"DONE",UPD:upd,TOTAL:total});
        }
        else
        {
            return res.status(403).json({ success:false,status:403,message:"Unauthorised Access"});
        }
    }
    catch(error)
    {
        console.log(error);
        return res.status(500).json({ success:false,status:500});
    }
}
module.exports = {
    updateSchemes,
    getParameters,
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