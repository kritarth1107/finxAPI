const managesService = require("../manage/manages.service");
const managesModel = require("../manage/manages.model");
const investorsModel = require("../investors/investors.model");
const schemesModel = require("../schemes/schemes.model");
const foliosModel = require("../folios/folios.model");
const transactionsModel = require("../transactions/transactions.model");
const cartModel = require("./carts.model");
const requestHTTP = require('request');
const md5 = require('md5');
const PASSKEY = "abcd1234";

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

function getPassword(USERID,PASSWORD) {
    var respo = [];
    var bodyParam = '<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:bses="http://bsestarmf.in/">';
    bodyParam += '<soap:Header xmlns:wsa="http://www.w3.org/2005/08/addressing"><wsa:Action>http://bsestarmf.in/MFOrderEntry/getPassword</wsa:Action><wsa:To>https://bsestarmfdemo.bseindia.com/MFOrderEntry/MFOrder.svc/Secure</wsa:To></soap:Header>';
    bodyParam += '<soap:Body>';
    bodyParam += '<bses:getPassword>';
    bodyParam += '<bses:UserId>'+USERID+'</bses:UserId>';
    bodyParam += '<bses:Password>'+PASSWORD+'</bses:Password>';
    bodyParam += '<bses:PassKey>'+PASSKEY+'</bses:PassKey>';
    bodyParam += '</bses:getPassword>';
    bodyParam += '</soap:Body>';
    bodyParam += '</soap:Envelope>';


    var options = {
        'method': 'POST',
        'url': 'https://bsestarmfdemo.bseindia.com/MFOrderEntry/MFOrder.svc/Secure',
        'headers': {
            'Content-Type': 'application/soap+xml'
        },
        body: bodyParam
        };


    requestHTTP(options, function(error, response, body) {
        if (!error) {
            console.log(response);
            var dataS = ({
                STATUS: 200,
                MESSAGE: response,
            });
            respo.push(dataS);
            
        } else {
            var dataS = ({
                STATUS: 500,
                MESSAGE: "ERROR",
            });
            respo.push(dataS);
        }
    });
    return respo;
}



const placeOrder = async(req,res)=>{

    const PASSWORD = await getPassword("99991401","Abc@123");
    res.status(500).json({
            success:false,
            status:500,
            message:PASSWORD
        })


    /*try
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


        const checkCart = await cartModel.find({DISTRIBUTOR:key_n[1],PAN_NO:body.PAN_NO});
        if(checkCart.length>0)
        {
            var totalPurchase = 0;
            for(var i=0;i<checkCart.length;i++)
            {
                if(checkCart[i].PURCHASE_TYPE==="PURCAHSE")
                {

                }
                else if(checkCart[i].PURCHASE_TYPE==="SELL")
                {

                }
            }
            
        }
        else
        {
            res.status(500).json({
                success:false,
                message:"Empty Cart",
                status:500,
                records:checkCart
            });
        }




    }
    catch(error)
    {
        console.log(error);
        res.status(500).json({
            success:false,
            status:500
        })
    }*/
}
const showBag = async(req,res)=>{
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


        const checkCart = await cartModel.find({DISTRIBUTOR:key_n[1],PAN_NO:body.PAN_NO});
        if(checkCart.length>0)
        {
            res.status(200).json({
                success:false,
                message:"Cart",
                status:200,
                records:checkCart
            });
            
        }
        else
        {
            res.status(500).json({
                success:false,
                message:"Empty Cart",
                status:500,
                records:checkCart
            });
        }




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
const removeBag = async(req,res)=>{
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


        const checkCart = await cartModel.findById(body.CARTID);
        if(checkCart!=null)
        { 
            const deleteCart = await cartModel.deleteOne({_id:body.CARTID});
            res.status(200).json({
                success:true,
                message:"Item removed from cart",
                status:200
            });
        }
        else
        {
            res.status(500).json({
                success:false,
                message:"Invalid Item Selected",
                status:500
            });
        }




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

const addToBag = async(req,res)=>{
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


        const checkScheme = await schemesModel.find({productCode:body.PRODUCT});
        if(checkScheme.length>0)
        {
            if(body.TYPE==="PURCAHSE")
            {
                if(checkScheme.length>1)
                {
                    var amount = parseFloat(checkScheme[0].minPurchase).toFixed(0);
                    var amount2 = parseFloat(checkScheme[1].minPurchase).toFixed(0);
                    var bodyAMOUNT = parseFloat(body.AMOUNT).toFixed(0);
                    if(bodyAMOUNT<amount)
                    {
                        res.status(500).json({
                            success:false,
                            message:"Minimum Purchase for scheme is "+amount,
                            status:500
                        });
                    }
                    else if(bodyAMOUNT>=amount2)
                    {
                        data = ({
                            PAN_NO : body.PAN_NO,
                            PURCHASE_TYPE : body.TYPE, 
                            PRODUCT_CODE : body.PRODUCT, 
                            FOLIO : body.FOLIO, 
                            SCHEME_NAME : checkScheme[0].fundDescription, 
                            AMOUNT : bodyAMOUNT, 
                            SCHEME_CODE : checkScheme[1].schemeCode, 
                            CART_TYPE : body.F_TYPE, 
                            DISTRIBUTOR : key_n[1]
                        });
                        const addCart = await cartModel.create(data);
                        if(addCart==null)
                        {
                            res.status(500).json({
                                success:false,
                                message:"Failed to add to cart",
                                status:500
                            });
                        }
                        else
                        {
                            res.status(200).json({
                                success:false,
                                message:"Added To cart",
                                status:200
                            });
                        }
                    }
                    else
                    {
                        data = ({
                            PAN_NO : body.PAN_NO,
                            PURCHASE_TYPE : body.TYPE, 
                            PRODUCT_CODE : body.PRODUCT, 
                            FOLIO : body.FOLIO, 
                            SCHEME_NAME : checkScheme[0].fundDescription, 
                            AMOUNT : bodyAMOUNT, 
                            SCHEME_CODE : checkScheme[0].schemeCode, 
                            CART_TYPE : body.F_TYPE, 
                            DISTRIBUTOR : key_n[1]
                        });
                        const addCart = await cartModel.create(data);
                        if(addCart==null)
                        {
                            res.status(500).json({
                                success:false,
                                message:"Failed to add to cart",
                                status:500
                            });
                        }
                        else
                        {
                            res.status(200).json({
                                success:false,
                                message:"Added To cart",
                                status:200
                            });
                        }
                    }
                }
                else
                {
                    var amount = parseFloat(checkScheme[0].minPurchase).toFixed(0);
                    if(bodyAMOUNT<amount)
                    {
                        res.status(500).json({
                            success:false,
                            message:"Minimum Purchase for scheme is "+amount,
                            status:500
                        });
                    }
                    else
                    {
                        data = ({
                            PAN_NO : body.PAN_NO,
                            PURCHASE_TYPE : body.TYPE, 
                            PRODUCT_CODE : body.PRODUCT, 
                            FOLIO : body.FOLIO, 
                            SCHEME_NAME : checkScheme[0].fundDescription, 
                            AMOUNT : bodyAMOUNT, 
                            SCHEME_CODE : checkScheme[0].schemeCode, 
                            CART_TYPE : body.F_TYPE, 
                            DISTRIBUTOR : key_n[1]
                        });
                        const addCart = await cartModel.create(data);
                        if(addCart==null)
                        {
                            res.status(500).json({
                                success:false,
                                message:"Failed to add to cart",
                                status:500
                            });
                        }
                        else
                        {
                            res.status(200).json({
                                success:false,
                                message:"Added To cart",
                                status:200
                            });
                        }
                    }
                }
            }
            else if(body.TYPE==="SELL")
            {

            }
            
        }
        else
        {
            res.status(500).json({
                success:false,
                message:"Invalid Scheme Selected",
                status:500
            });
        }




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


module.exports = {
    addToBag,showBag,removeBag,placeOrder
}