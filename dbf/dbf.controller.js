const managesService = require("../manage/manages.service");
const managesModel = require("../manage/manages.model");
const investorsModel = require("../investors/investors.model");
const schemesModel = require("../schemes/schemes.model");
const foliosModel = require("../folios/folios.model");
const transactionsModel = require("../transactions/transactions.model");
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


const main  = async (req, res) => {
    try
    {
        var body = req.body;
        var headers = req.headers;
        var website = headers.website;
        var key = decrypt(headers.auth);
        var key_n = key.split("|");
        if(key_n[0]!="DISTRIBUTOR")
        {
            return res.status(403).json({ success:false,status:403,message: "Unauthorised Access!!" });
        }
        const manage = await managesModel.findOne({mWebsite:website,mFlag:1,mKey:key_n[1]}).lean();
        if(manage==null)
        {
            res.json({
                success:false,
                status:403,
                message:"Invalid Host"
            });
        }
        var registrar = body.registrar;
        var records = body.records;
        var obj = JSON.parse(records);
        var total_count = 0;
        var updated = 0;
        var opARRAY = [];

        if(manage.mARN!=obj[0].BROKER_COD)
        {
            res.json({
                success:false,
                status:403,
                message:"DBF File Contain data for other ARN"
            });
        }

        

        

        for(var j =0 ;j<obj.length;j++)
        {
            var password = md5("12345678")
            var dataINV = ({
                INV_NAME:obj[j].INV_NAME,
                ADDRESS1:obj[j].ADDRESS1,
                ADDRESS2:obj[j].ADDRESS2,
                ADDRESS3:obj[j].ADDRESS3,
                CITY:obj[j].CITY,
                PINCODE:obj[j].PINCODE,
                INV_DOB:obj[j].INV_DOB,
                MOBILE_NO:obj[j].MOBILE_NO,
                OCCUPATION:obj[j].OCCUPATION,
                EMAIL:obj[j].EMAIL,
                PAN_NO:obj[j].PAN_NO,
                AADHAAR:obj[j].AADHAAR,
                PASSWORD:password,
                BANK_NAME:obj[j].BANK_NAME,
                BRANCH:obj[j].BRANCH,
                AC_TYPE:obj[j].AC_TYPE,
                AC_NO:obj[j].AC_NO,
                CRDATE:obj[j].CRDATE,
                CREATEDON:obj[j].CREATEDON,
                LASTUPDATE:obj[j].CREATEDON,
                PWD_UPD:obj[j].CREATEDON,
                HOLDING_NA:obj[j].HOLDING_NA,
                NOM_1:obj[j].NOM_1,
                NOM_2:obj[j].NOM_2,
                NOM_3:obj[j].NOM_3,
                FATCA:"NO",
                SIGN_IMAGE:"NO",
                GENDER:"NOT_SPECIFIED",
                INV_APP:"NONE",
                UCC:"NO",
                INV_GROUP:"NOT ASSIGNED",
                DISTRIBUTOR:key_n[1],
                INV_PROFILE:"https://quadkubes.com/images/profile-image.jpg",
                INV_FLAG:"1"
            });
            var SCH_CODE = "";
            var SCH_IISN = "";
            var SCH_NAME = "";
            var SCH_AMC = "";
            var SCH_CATEGORY = "";
            const checkScheme = await schemesModel.findOne({productCode:obj[j].PRODUCT});
            if(obj[j].PAN_NO==="" || obj[j].PAN_NO===" " || obj[j].PAN_NO==null)
            {
                        var upDATA = ({
                                    status:false,
                                    identity:obj[j].PAN_NO+" | "+obj[j].INV_NAME+" | "+obj[j].FOLIOCHK,
                                    message:"PAN CARD Not Available"
                                });
                                opARRAY.push(upDATA);
            }
            else
            {
                if(checkScheme!=null)
                {
                    SCH_CODE = checkScheme.schemeCode;
                    SCH_IISN = checkScheme.productIISN;
                    SCH_NAME = checkScheme.fundDescription;
                    SCH_AMC = checkScheme.fundAMC;
                    SCH_CATEGORY = checkScheme.fundCategory;

                    var dataFolio = ({
                        BROKER_COD:obj[j].BROKER_COD,
                        FOLIOCHK:obj[j].FOLIOCHK,
                        PAN_NO:obj[j].PAN_NO,
                        PRODUCT:obj[j].PRODUCT,
                        SCH_CODE:SCH_CODE,
                        SCH_IISN:SCH_IISN,
                        SCH_NAME:SCH_NAME,
                        SCH_AMC:SCH_AMC,
                        SCH_CATEGORY:SCH_CATEGORY,
                        REP_DATE:obj[j].REP_DATE,
                        FOLIO_DATE:obj[j].FOLIO_DATE,
                        REGISTRAR:obj[j].REGISTRAR,
                        CREATEDON:obj[j].CREATEDON,
                        LASTUPDATE:obj[j].CREATEDON,
                        DISTRIBUTOR:key_n[1],
                        FOLIO_FLAG:"1"
                     });


                    const checkINV = await  investorsModel.findOne({PAN_NO:obj[j].PAN_NO,DISTRIBUTOR:key_n[1]});
                    if(checkINV==null)
                    {
                        //NEW INVESTOR HERE
                        const newINV = await investorsModel.create(dataINV);
                        if(newINV==null)
                        {
                            var upDATA = ({
                                status:false,
                                identity:pan+" | "+obj[j].INV_NAME,
                                message:"Failed to create Investor"
                            });
                            opARRAY.push(upDATA);
                        }
                        else
                        {
                            //Add Folio
                            const checkFolio  = await foliosModel.findOne({
                                DISTRIBUTOR:key_n[1],
                                PAN_NO:obj[j].PAN_NO,
                                FOLIOCHK:obj[j].FOLIOCHK,
                                //FOLIO_DATE:obj[j].FOLIO_DATE,
                                PRODUCT:obj[j].PRODUCT
                            });
                            if(checkFolio==null)
                            {
                                const newFolio = await foliosModel.create(dataFolio);
                                if(newFolio==null)
                                {
                                    var upDATA = ({
                                        status:false,
                                        identity:obj[j].PAN_NO+" | "+obj[j].INV_NAME+" | "+obj[j].FOLIOCHK,
                                        message:"Failed to create Folio"
                                    });
                                    opARRAY.push(upDATA);
                                }
                                else
                                {
                                    var upDATA = ({
                                        status:true,
                                        identity:obj[j].PAN_NO+" | "+obj[j].INV_NAME+" | "+obj[j].FOLIOCHK,
                                        message:"Folio Added : New Investor"
                                    });
                                    opARRAY.push(upDATA);
                                    updated++;
                                }
                            }
                            else
                            {
                                var upDATA = ({
                                    status:false,
                                    identity:obj[j].PAN_NO+" | "+obj[j].INV_NAME+" | "+obj[j].FOLIOCHK,
                                    message:"Folio Already Exists"
                                });
                                opARRAY.push(upDATA);
                            }
                        }
                    }
                    else
                    {
                        //Investor Exists
                        //Add Folio
                        const checkFolio  = await foliosModel.findOne({
                            DISTRIBUTOR:key_n[1],
                            PAN_NO:obj[j].PAN_NO,
                            FOLIOCHK:obj[j].FOLIOCHK,
                            FOLIO_DATE:obj[j].FOLIO_DATE,
                            PRODUCT:obj[j].PRODUCT
                        });
                        if(checkFolio==null)
                        {
                            const newFolio = await foliosModel.create(dataFolio);
                            if(newFolio==null)
                            {
                                var upDATA = ({
                                    status:false,
                                    identity:obj[j].PAN_NO+" | "+obj[j].INV_NAME+" | "+obj[j].FOLIOCHK,
                                    message:"Failed to create Folio"
                                });
                                opARRAY.push(upDATA);
                            }
                            else
                            {
                                var upDATA = ({
                                    status:true,
                                    identity:obj[j].PAN_NO+" | "+obj[j].INV_NAME+" | "+obj[j].FOLIOCHK,
                                    message:"Folio Added"
                                });
                                opARRAY.push(upDATA);
                                updated++;
                            }
                        }
                        else
                        {
                            var upDATA = ({
                                status:false,
                                identity:obj[j].PAN_NO+" | "+obj[j].INV_NAME+" | "+obj[j].FOLIOCHK,
                                message:"Folio Already Exists"
                            });
                            opARRAY.push(upDATA);
                        }
                    }

                    total_count++;
                }
                else
                {
                    var upDATA = ({
                                    status:false,
                                    identity:obj[j].PAN_NO+" | "+obj[j].PRODUCT+" | "+obj[j].FOLIOCHK,
                                    message:"Failed to Fetch Scheme Details"
                                });
                                opARRAY.push(upDATA);
                }
            }
            
        }
        
        
        res.json({
                success:true,
                status:200,
                updated:updated,
                total_count:total_count,
                message:"Record(s) Imported",
                records:opARRAY
        });
        


    }
    catch(error)
    {
        console.log(error);
        res.status(500).json({
            success:false,
            status:500
        })
    }
    
}

const transaction = async (req,res)=>{
    try
    {
        var body = req.body;
        var headers = req.headers;
        var website = headers.website;
        var key = decrypt(headers.auth);
        var key_n = key.split("|");
        if(key_n[0]!="DISTRIBUTOR")
        {
            return res.status(403).json({ success:false,status:403,message: "Unauthorised Access!!" });
        }
        const manage = await managesModel.findOne({mWebsite:website,mFlag:1,mKey:key_n[1]}).lean();
        if(manage==null)
        {
            res.json({
                success:false,
                status:403,
                message:"Invalid Host"
            });
        }
        var registrar = body.registrar;
        var records = body.records;
        var obj = JSON.parse(records);
        var total_count = 0;
        var updated = 0;
        var opARRAY = [];
        for(var j =0 ;j<obj.length;j++)
        {
            total_count++;
            var SCH_NAME = "-";
            var SCH_AMC = "-";
            var SCH_CATEGORY = "-";

            const schemeD = await schemesModel.findOne({productCode:obj[j].PRODCODE});
            if(schemeD!=null)
            {
                SCH_NAME = schemeD.fundDescription;
                SCH_AMC = schemeD.fundAMC;
                SCH_CATEGORY = schemeD.fundCategory;

            }
            var transData = ({
                PRODCODE:obj[j].PRODCODE,
                FOLIO_NO:obj[j].FOLIO_NO,
                TRXNNO:obj[j].TRXNNO,
                TRX_DATE:obj[j].TRX_DATE,
                UNITS:obj[j].UNITS,
                PURPRICE:obj[j].PURPRICE,
                AMOUNT:obj[j].AMOUNT,
                TD_NAV:obj[j].TD_NAV,
                STAMP_DUTY:obj[j].STAMP_DUTY,
                TRX_NATURE:obj[j].TRX_NATURE,
                SCH_NAME:SCH_NAME,
                SCH_AMC:SCH_AMC,
                SCH_CATEGORY:SCH_CATEGORY,
                REGISTRAR:obj[j].REGISTRAR,
                DISTRIBUTOR:key_n[1],
                CREATEDATE:obj[j].CREATEDATE,
                TRX_FLAG:"1"
            });
            const tCheck = await transactionsModel.findOne({FOLIO_NO:obj[j].FOLIO_NO,
                TRXNNO:obj[j].TRXNNO,
                DISTRIBUTOR:key_n[1],
                PRODCODE:obj[j].PRODCODE});
            
            if(tCheck==null)
            {
                const addTrans = await transactionsModel.create(transData);
                if(addTrans==null)
                {
                    var upDATA = ({
                        status:false,
                        identity:obj[j].FOLIO_NO+" | "+obj[j].TRXNNO,
                        message:"Failed to add Transaction"
                    });
                    opARRAY.push(upDATA);
                }
                else
                {
                    var upDATA = ({
                        status:true,
                        identity:obj[j].FOLIO_NO+" | "+obj[j].TRXNNO,
                        message:"Transaction added"
                    });
                    opARRAY.push(upDATA);
                }
            }
            else
            {
                var upDATA = ({
                    status:false,
                    identity:obj[j].FOLIO_NO+" | "+obj[j].TRXNNO,
                    message:"Transaction already exists"
                });
                opARRAY.push(upDATA);
            }
        }

        res.json({
            success:true,
            status:200,
            updated:updated,
            total_count:total_count,
            message:"Record(s) Imported",
            records:opARRAY
        });
    }
    catch(error)
    {
        res.status(500).json({
            success:false,
            status:500,
            message:error.toString()
        })
    }
}

module.exports = {main,transaction}