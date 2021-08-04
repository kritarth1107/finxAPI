const transactionsService = require("./transactions.service");
const foliosService = require("../folios/folios.service");
const investorsService = require("../investors/investors.service");
const transactionsModel = require("./transactions.model");
const foliosModel = require("../folios/folios.model");
const manageService = require("../manage/manages.service");
const investorsModel = require("../investors/investors.model");

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


const transactionsGETx = async (req, res) => {
    var Transcations = new Array();
    var finalsData= [];
    try
    {
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

        var f = await transactionsModel
            .find({ DISTRIBUTOR:key_n[1] })
            .lean();

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
    


        const transactions = await transactionsModel.find({DISTRIBUTOR: key_n[1]}).lean();
        

    res.status(200).json({status:200,success:true,records:transactions});
  } catch (error) {
      console.log(error);
    res.json(error);
  }
};

module.exports = {
    transactionsGETx,folioGET
}