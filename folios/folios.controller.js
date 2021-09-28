const foliosService = require("./folios.service");
const investorsService = require("../investors/investors.service");
const transactionsService = require("../transactions/transactions.service");
const managesModel = require("../manage/manages.model");
const investorssModel = require("../investors/investors.model");
const schemesModel = require("../schemes/schemes.model");
const foliosModel = require("../folios/folios.model");


const md5 = require('md5');
const crypto = require('crypto');
require("dotenv").config();
const ENCRYPTION_KEY = process.env.ENC_KEY; // Must be 256 bits (32 characters)


function encrypt(text) {
    //let iv = process.env.ENC_IV;
    let iv = crypto.randomBytes(16);
    let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(text);
   
    encrypted = Buffer.concat([encrypted, cipher.final()]);
   
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
    let textParts = text.split(':');
    let iv = Buffer.from(textParts.shift(), 'hex');
    let encryptedText = Buffer.from(textParts.join(':'), 'hex');
    let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText);
   
    decrypted = Buffer.concat([decrypted, decipher.final()]);
   
    return decrypted.toString();
}

const manualEntry = async(req,res)=>{
    try
    {
        const header = req.headers;
        const body = req.body;
        var website = header.website;
        var key = decrypt(header.auth);
        var key_n = key.split("|");
        var records = [];
        if(key_n[0]!="DISTRIBUTOR")
        {
            return res.status(403).json({ success:false,status:403,message: "Unauthorised Access!!" });
        }
        const manage = await managesModel.findOne({mWebsite:website,mFlag:1,mKey:key_n[1]}).lean();
        if(manage==null)
        {
            res.json({
                success:false,
                status:500,
                message:"Invalid Host"
            });
        }

        const checkScheme = await schemesModel.findOne({productCode:body.PRODUCT});
        if(checkScheme!=null)
        {
            const invChk = await investorssModel.findOne({PAN_NO:body.PAN_NO,DISTRIBUTOR:key_n[1]});
            if(invChk!=null)
            {
                const folioCheck = await foliosModel.findOne({
                                DISTRIBUTOR:key_n[1],
                                PAN_NO:body.PAN_NO,
                                FOLIOCHK:body.FOLIOCHK,
                                FOLIO_DATE:body.FOLIO_DATE,
                                PRODUCT:body.PRODUCT});
                if(folioCheck==null)
                {
                    var dataFolio = ({
                        BROKER_COD:manage.mARN,
                        FOLIOCHK:body.FOLIOCHK,
                        PAN_NO:body.PAN_NO,
                        PRODUCT:checkScheme.productCode,
                        SCH_CODE:checkScheme.schemeCode,
                        SCH_IISN:checkScheme.productIISN,
                        SCH_NAME:checkScheme.fundDescription,
                        SCH_AMC:checkScheme.fundAMC,
                        SCH_CATEGORY:checkScheme.fundCategory,
                        REP_DATE:body.FOLIO_DATE,
                        FOLIO_DATE:body.FOLIO_DATE,
                        REGISTRAR:body.REGISTRAR,
                        CREATEDON:body.CREATEDON,
                        LASTUPDATE:body.CREATEDON,
                        DISTRIBUTOR:key_n[1],
                        REGISTRAR:checkScheme.fundRegistrar,
                        FOLIO_FLAG:"1"
                     });
                    const newFolio = await foliosModel.create(dataFolio);
                    if(newFolio==null)
                    {
                        res.json({
                            success:false,
                            status:500,
                            message:"Failed to create Folio"
                        });
                    }
                    else
                    {
                        res.json({
                            success:true,
                            status:200,
                            message:"Folio Created Successfully!!"
                        });
                    }
                }
                else
                {
                    res.json({
                        success:false,
                        status:500,
                        message:"Folio Already Present"
                    });
                }
            }
            else
            {
                res.json({
                    success:false,
                    status:500,
                    message:"Invalid Investor Selected"
                });
            }
            
        }
        else
        {
            res.json({
                success:false,
                status:500,
                message:"Invalid Scheme Selected"
            });
        }


    }
    catch(error)
    {
        console.log(error);
        res.json({
            status: 500,
            success: false,
            message: error
        });
    }
}
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
    },
    manualEntry
}