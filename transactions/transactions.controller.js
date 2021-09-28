const transactionsService = require("./transactions.service");
const foliosService = require("../folios/folios.service");
const investorsService = require("../investors/investors.service");
const transactionsModel = require("./transactions.model");
const foliosModel = require("../folios/folios.model");
const manageService = require("../manage/manages.service");
const investorsModel = require("../investors/investors.model");
const managesModel = require("../manage/manages.model");
const schemesModel = require("../schemes/schemes.model");

const requestHTTP = require('request');
const { json } = require("express");
const crypto = require('crypto');
require("dotenv").config();
const ENCRYPTION_KEY = process.env.ENC_KEY; // Must be 256 bits (32 characters)


function decrypt(text) {
    let textParts = text.split(':');
    let iv = Buffer.from(textParts.shift(), 'hex');
    let encryptedText = Buffer.from(textParts.join(':'), 'hex');
    let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText);
   
    decrypted = Buffer.concat([decrypted, decipher.final()]);
   
    return decrypted.toString();
}

const transactionEntry = async (req,res) => {
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

        const checkTransaction = await transactionsModel.find({PRODCODE:body.PRODCODE,TRXNNO:body.TRXNNO,FOLIO_NO:body.FOLIO_NO,DISTRIBUTOR:key_n[1]});
        if(checkTransaction!=null)
        {
            const checkScheme = await schemesModel.findOne({productCode:body.PRODCODE});
            if(checkScheme!=null)
            {
                var transData = ({
                    PRODCODE:checkScheme.productCode,
                    FOLIO_NO:body.FOLIO_NO,
                    TRXNNO:body.TRXNNO,
                    TRX_DATE:body.TRX_DATE,
                    UNITS:body.UNITS,
                    PURPRICE:body.PURPRICE,
                    AMOUNT:body.AMOUNT,
                    TD_NAV:body.PURPRICE,
                    STAMP_DUTY:body.STAMP_DUTY,
                    TRX_NATURE:body.TRX_NATURE,
                    SCH_NAME:checkScheme.fundDescription,
                    SCH_AMC:checkScheme.fundAMC,
                    SCH_CATEGORY:checkScheme.fundCategory,
                    REGISTRAR:checkScheme.fundRegistrar,
                    DISTRIBUTOR:key_n[1],
                    CREATEDATE:body.CREATEDATE, 
                    TRX_FLAG:"1"
                });
                const addTrans = await transactionsModel.create(transData);
                if(addTrans!=null)
                {
                    res.json({
                        success:true,
                        status:200,
                        message:"Transaction Entry Success!!"
                    });
                }
                else
                {
                    res.json({
                        success:false,
                        status:500,
                        message:"Failed to insert transaction"
                    });
                }
            }
            else
            {
                res.json({
                    success:false,
                    status:500,
                    message:"Invalid Scheme"
                });
            }
        }
        else
        {
            res.json({
                success:false,
                status:500,
                message:"Transaction Details Already Present"
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
const transactionsGETx = async (req, res) => {
    var Transcations = new Array();
    var finalsData= [];
    try
    {
        const { start,end,folio } = req.body;
        var website = req.headers.website;
        var key = decrypt(req.headers.auth);
        var key_n = key.split("|");
        if(key_n[0]!="DISTRIBUTOR")
        {
            return res.status(403).json({ success:false,status:403,message: "Unauthorised Access!!" });
        }

        manageService.checkManage(website,key_n[1],1).then(result=>{
        if(result==null)
        {
            return res.status(403).json({ success:false,status:403,message: "Unauthorised Access!!" });
        }
        }).catch(error=>{

        });

        var f =null;

        if(folio=="all" || folio==null || folio=="")
        { 
            f = await transactionsModel
            .find({ TRX_DATE: { $gt: start, $lt: end },DISTRIBUTOR:key_n[1] })
            .lean();
        }
        else
        {
            f = await transactionsModel
            .find({ TRX_DATE: { $gt: start, $lt: end },DISTRIBUTOR:key_n[1],FOLIO_NO:folio })
            .lean();
        }

        if (f.length < 1) {
          return res.status(404).json({ success:false,status:404,message: "No Folios Found!!" });
        }

        for (var i = 0; i < f.length; i++)
        {
            var FOLIONO = f[i].FOLIO_NO;
            var PRODCODE = f[i].PRODCODE;

            var folioData = await foliosModel
            .findOne({ FOLIOCHK:FOLIONO,PRODUCT:PRODCODE,DISTRIBUTOR:key_n[1] });

            /*var invData = await investorsModel
            .findOne({ PAN_NO:folioData.PAN_NO,DISTRIBUTOR:key_n[1] });

            var upds = ({
                    TID:f[i].TID,
                    PRODCODE:f[i].PRODCODE,
                    FOLIO_NO:f[i].FOLIO_NO,
                    TRXNNO:f[i].TRXNNO,
                    TRX_DATE:f[i].TRX_DATE,
                    UNITS:f[i].UNITS,
                    PURPRICE:f[i].PURPRICE,
                    AMOUNT:f[i].AMOUNT,
                    STAMP_DUTY:f[i].STAMP_DUTY,
                    TRX_NATURE:f[i].TRX_NATURE,
                    SCH_NAME:folioData.SCH_NAME,
                    SCH_IISN:folioData.SCH_IISN,
                    SCH_CATEGORY:folioData.SCH_CATEGORY,
                    SCH_AMC:folioData.SCH_AMC,
                    FOLIO_DATE:folioData.FOLIO_DATE,
                    INV_NAME:invData.INV_NAME,
                    PAN_NO:invData.PAN_NO,
                    MOBILE_NO:invData.MOBILE_NO,
                    EMAIL:invData.EMAIL,
                    INV_DOB:invData.INV_DOB,
                    PINCODE:invData.PINCODE,
                    ADDRESS1:invData.ADDRESS1,
                    ADDRESS2:invData.ADDRESS2,
                    CITY:invData.CITY
                });*/

            finalsData.push(folioData);


        }

        res.status(200).json({status:200,success:true,records:finalsData});


    }
    catch (error) {
        console.log(error);
        res.status(500).json({status:500,success:false,records:error});
    }


    };

const folioGET = async (req, res) => {
  var Transcations = new Array();
  var finalsData= [];
  try {
    const { start,end,folio } = req.body;
    var website = req.headers.website;
    var key = decrypt(req.headers.auth);
    var key_n = key.split("|");
    if(key_n[0]!="DISTRIBUTOR")
    {
        return res.status(403).json({ success:false,status:403,message: "Unauthorised Access!!" });
    }

    manageService.checkManage(website,key_n[1],1).then(result=>{
        if(result==null)
        {
            return res.status(403).json({ success:false,status:403,message: "Unauthorised Access!!" });
        }
    }).catch(error=>{

    });

    var f = null;
    

        if(folio=="all" || folio==null || folio=="")
        {
            
            f = await transactionsModel
            .find({ TRX_DATE: { $gt: start, $lt: end },DISTRIBUTOR:key_n[1] })
            .lean();
        }
        else
        {
            f = await transactionsModel
            .find({ TRX_DATE: { $gt: start, $lt: end },DISTRIBUTOR:key_n[1],FOLIO_NO:folio })
            .lean();
        }
        

    res.status(200).json({status:200,success:true,records:f});
  } catch (error) {
      console.log(error);
    res.json(error);
  }
};

module.exports = {
    transactionsGETx,folioGET,transactionEntry
}