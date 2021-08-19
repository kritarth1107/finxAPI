const investorsService = require("./investors.service");
const managesService = require("../manage/manages.service");
const managesModel = require("../manage/manages.model");
const investorssModel = require("../investors/investors.model");
const optionssModel = require("../manage/options.model");
const bliingsModel = require("../manage/bliings.model");
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
   

const login  = async (req, res) => {
    try
    {
        const body = req.body;
        const header = req.headers;
        var website = header.website;
        var pan = body.PAN_CARD;
        var password = body.PASSWORD;
        var mKey = null;
        const manage = await managesModel.findOne({mWebsite:website,mFlag:1}).lean();
        if(manage==null)
        {
            res.json({
                success:false,
                status:500,
                message:"Invalid Host"
            });
        }

        const inv = await investorssModel.findOne({PAN_NO:pan,DISTRIBUTOR:manage.mKey}).lean();
        if(inv==null)
        {
            res.json({
                success:false,
                status:500,
                message:"Invalid PAN Number!!" 
            });
        }
        else
        {
            //const results = compareSync(password, inv.PASSWORD);
            if (md5(password)==inv.PASSWORD)
            {
                var string = "CLIENT|"+inv._id;
                var userID = encrypt(string);

                res.json({
                    success:true,
                    status:200,
                    type:"CLIENT",
                    message:"Login Success!!",
                    user_id:userID
                });

            }
            else
            {
                res.json({
                    status:500,
                    success:false,
                    message:"Invalid Password"
                });
            }
        }



    }
    catch(error)
    {
        res.json({
            success:false,
            status:500,
            message:error
        });
    }
}


const changePassword = async(req,res)=>{
    
        try
        {
            var body = req.body;
            var headers = req.headers;
            var website = headers.website;
            body.password = md5(body.password);
            var old_password = body.old_password;
            const manage = await managesModel.findOne({mWebsite:website,mFlag:1}).lean();
            if(manage==null)
            {
                res.json({
                    success:false,
                    status:500,
                    message:"Invalid Host"
                });
            }


            var key = decrypt(headers.auth);
            var key_n = key.split("|");
            if(key_n[0]!="CLIENT")
            {
                return res.status(403).json({ success:false,status:403,message: "Unauthorised Access!!" });
            }

            const invCheck = await investorssModel.findById(key_n[1]).lean();
            if(invCheck==null)
            {
                return res.status(403).json({ success:false,status:403,message: "Unauthorised Access: Invalid Client" });
            }
            //const results = compareSync(old_password, invCheck.PASSWORD);
            if(md5(old_password)!=invCheck.PASSWORD)
            {
                return res.status(500).json({ success:false,status:500,message: "Wrong Old Password" });
            }

            const invUpdate = await investorssModel.findByIdAndUpdate(key_n[1],{PASSWORD:body.password});
            
            if(invUpdate==null)
            {
                
                res.status(500).json({
                    status:500,
                    success:false,
                    message:"Failed to update password!!"
                });
            }
            else
            {
                res.status(500).json({
                    status:200,
                    success:true,
                    message:"Successfully changed password!!"
                });
            }
        }
        catch(error)
        {
            console.log(error);
            res.status(500).json({
                status:500,
                success:false,
                message:"Something went Wrong"
            });
        }
}

const create = async(req,res)=>{
    const body = req.body;
    const header = req.headers;
    var website = header.website;
    var key = decrypt(header.auth);
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
            status:500,
            message:"Invalid Host"
        });
    }

}

const getOne = async(req,res)=>{
    try
    {
        const body = req.body;
        const header = req.headers;
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

        const getAll = await investorssModel.findOne({DISTRIBUTOR:key_n[1],PAN_NO:body.PAN_NO});
        if(getAll==null)
        {
            res.json({
                success:false,
                status:500,
                message:"No Investor with PAN "+body.PAN_NO
            });
        }
        else
        {
            res.json({
                success:true,
                status:200,
                INV_NAME:getAll.INV_NAME,
                EMAIL:getAll.EMAIL,
                MOBILE_NO:getAll.MOBILE_NO,
                INV_DOB:getAll.INV_DOB,
                ADDRESS1:getAll.ADDRESS1,
                ADDRESS2:getAll.ADDRESS2,
                INV_PROFILE:getAll.INV_PROFILE,
                PAN_NO:getAll.PAN_NO,
                OCCUPATION:getAll.OCCUPATION,
                ADDRESS3:getAll.ADDRESS3,
                CITY:getAll.CITY,
                PINCODE:getAll.PINCODE,
                INV_MOBILE:getAll.INV_MOBILE
            });
        }
    }
    catch(error)
    {
        res.json({
            success:false,
            status:500,
            message:error
        });
    }
}


const get = async(req,res)=>{
    try
    {
        const header = req.headers;
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

        const getAll = await investorssModel.find({DISTRIBUTOR:key_n[1]});
        if(getAll.length==0)
        {
            res.json({
                success:false,
                status:500,
                message:"No Investor(s)",
                records:records
            });
        }
        else
        {
            for(var i=0;i<getAll.length;i++)
            {
                var x = ({
                    INV_NAME:getAll[i].INV_NAME,
                    INV_DOB:getAll[i].INV_DOB,
                    ADDRESS1:getAll[i].ADDRESS1,
                    ADDRESS2:getAll[i].ADDRESS2,
                    ADDRESS3:getAll[i].ADDRESS3,
                    PINCODE:getAll[i].PINCODE,
                    CITY:getAll[i].CITY,
                    MOBILE_NO:getAll[i].MOBILE_NO,
                    EMAIL:getAll[i].EMAIL,
                    PAN_NO:getAll[i].PAN_NO
                });
                records.push(x);
            }
            res.json({
                success:false,
                status:500,
                message:"No Investor(s)",
                records:records
            });
        }
    }
    catch(error)
    {
        console.log(error);
        res.json({
            success:false,
            status:500,
            message:error
        });
    }

}

const checkHost = async(req,res)=>{
    try
    {
        const header = req.headers;
        var website = header.website;
        var key = decrypt(header.auth);
        var key_n = key.split("|");
        if(key_n[0]!="CLIENT")
        {
            return res.status(403).json({ success:false,status:403,message: "Unauthorised Access!!" });
        }
        const manage = await managesModel.findOne({mWebsite:website,mFlag:1}).lean();
        if(manage==null)
        {
            res.json({
                success:false,
                status:500,
                message:"Invalid Host"
            });
        }

        const invCheck = await investorssModel.findById(key_n[1]);
        if(invCheck==null)
        {
            res.json({
                success:false,
                status:500,
                message:"Invalid User"
            });
        }
        else
        {
            const theme = await optionssModel.findOne({DISTRIBUTOR:key_n[1],option_type:"CLIENTTHEME"});
            if(theme==null)
            {
                var themeBody = ({
                    leftSideBarTheme:"dark",
                    darkMode:"false",
                    layoutBoxed:"false",
                    option_type:"CLIENTTHEME",
                    DISTRIBUTOR:key_n[1]
                });
                const createTheme = await optionssModel.create(themeBody);
                if(createTheme==null)
                {
                    res.json({
                        success:true,
                        status:200,
                        leftSideBarTheme:"dark",
                        darkMode:"false",
                        layoutBoxed:"false",
                        INV_NAME:invCheck.INV_NAME,
                        ADDRESS1:invCheck.ADDRESS1,
                        ADDRESS2:invCheck.ADDRESS2,
                        ADDRESS3:invCheck.ADDRESS3,
                        CITY:invCheck.CITY,
                        PINCODE:invCheck.PINCODE,
                        INV_DOB:invCheck.INV_DOB,
                        MOBILE_NO:invCheck.MOBILE_NO,
                        OCCUPATION:invCheck.OCCUPATION,
                        EMAIL:invCheck.EMAIL,
                        PAN_NO:invCheck.PAN_NO,
                        AADHAAR:invCheck.AADHAAR,
                        INV_PROFILE:invCheck.INV_PROFILE,
                        mBusiness:manage.mBusiness,
                        mLogo:manage.mLogo,
                        mLogoLight:manage.mLogoLight,
                        mWebsite:manage.mWebsite
                    });
                }
                else
                {
                    res.json({
                        success:true,
                        status:200,
                        leftSideBarTheme:theme.leftSideBarTheme,
                        darkMode:theme.darkMode,
                        layoutBoxed:theme.layoutBoxed,
                        INV_NAME:invCheck.INV_NAME,
                        ADDRESS1:invCheck.ADDRESS1,
                        ADDRESS2:invCheck.ADDRESS2,
                        ADDRESS3:invCheck.ADDRESS3,
                        CITY:invCheck.CITY,
                        PINCODE:invCheck.PINCODE,
                        INV_DOB:invCheck.INV_DOB,
                        MOBILE_NO:invCheck.MOBILE_NO,
                        OCCUPATION:invCheck.OCCUPATION,
                        EMAIL:invCheck.EMAIL,
                        PAN_NO:invCheck.PAN_NO,
                        AADHAAR:invCheck.AADHAAR,
                        INV_PROFILE:invCheck.INV_PROFILE,
                        mBusiness:manage.mBusiness,
                        mLogo:manage.mLogo,
                        mLogoLight:manage.mLogoLight,
                        mWebsite:manage.mWebsite
                    });
                }
            }
            else
            {
                res.json({
                    success:true,
                    status:200,
                    leftSideBarTheme:theme.leftSideBarTheme,
                    darkMode:theme.darkMode,
                    layoutBoxed:theme.layoutBoxed,
                    INV_NAME:invCheck.INV_NAME,
                    ADDRESS1:invCheck.ADDRESS1,
                    ADDRESS2:invCheck.ADDRESS2,
                    ADDRESS3:invCheck.ADDRESS3,
                    CITY:invCheck.CITY,
                    PINCODE:invCheck.PINCODE,
                    INV_DOB:invCheck.INV_DOB,
                    MOBILE_NO:invCheck.MOBILE_NO,
                    OCCUPATION:invCheck.OCCUPATION,
                    EMAIL:invCheck.EMAIL,
                    PAN_NO:invCheck.PAN_NO,
                    AADHAAR:invCheck.AADHAAR,
                    INV_PROFILE:invCheck.INV_PROFILE,
                    mBusiness:manage.mBusiness,
                    mWebsite:manage.mWebsite
                });
            }
        }
    }
    catch(error)
    {
        console.log(error);
        res.json({
            success:false,
            status:500,
            message:error
        });
    }
}

const chnageTheme = async(req,res) =>{
    try
    {
            var body = req.body;
            var headers = req.headers;
            var website = headers.website;
            
            const manage = await managesModel.findOne({mWebsite:website,mFlag:1}).lean();
            if(manage==null)
            {
                res.json({
                    success:false,
                    status:500,
                    message:"Invalid Host"
                });
            }


            var key = decrypt(headers.auth);
            var key_n = key.split("|");
            if(key_n[0]!="CLIENT")
            {
                return res.status(403).json({ success:false,status:403,message: "Unauthorised Access!!" });
            }

            const invCheck = await investorssModel.findById(key_n[1]).lean();
            if(invCheck==null)
            {
                return res.status(403).json({ success:false,status:403,message: "Unauthorised Access: Invalid Client" });
            }

            const changeT = await optionssModel.findOneAndUpdate({DISTRIBUTOR:key_n[1],option_type:"CLIENTTHEME"},{
                leftSideBarTheme:body.leftSideBarTheme,
                darkMode:body.darkMode
            });
            if(changeT==null)
            {
                res.status(500).json({
                    success:false,
                    status:500,
                    message:"Failed to update Theme"
                });
            }
            else
            {
                res.status(200).json({
                    success:true,
                    status:200,
                    message:"Theme Updated!!"
                });
            }

    }
    catch(error)
        {
            //console.log(error);
            res.status(500).json({
                status:500,
                success:false,
                message:"Something went Wrong"
            });
        }
}

const updateInv = async(req,res) => {
    try
        {
            var body = req.body;
            var headers = req.headers;
            var website = headers.website;
            
            const manage = await managesModel.findOne({mWebsite:website,mFlag:1}).lean();
            if(manage==null)
            {
                res.json({
                    success:false,
                    status:500,
                    message:"Invalid Host"
                });
            }


            var key = decrypt(headers.auth);
            var key_n = key.split("|");
            if(key_n[0]!="CLIENT")
            {
                return res.status(403).json({ success:false,status:403,message: "Unauthorised Access!!" });
            }

            const invCheck = await investorssModel.findById(key_n[1]).lean();
            if(invCheck==null)
            {
                return res.status(403).json({ success:false,status:403,message: "Unauthorised Access: Invalid Client" });
            }
            
            if(body.INV_NAME===null || body.MOBILE_NO===null || body.OCCUPATION===null || body.EMAIL===null || body.ADDRESS1===null || body.ADDRESS2===null ||body.DATE===null)
            {
                return res.status(500).json({ success:false,status:500,message: "Missing Parameters or Blank Parameters" });
            }

            const invUpdate = await investorssModel.findByIdAndUpdate(key_n[1],
                {INV_NAME:body.INV_NAME,
MOBILE_NO:body.MOBILE_NO,
OCCUPATION:body.OCCUPATION,
EMAIL:body.EMAIL,
ADDRESS1:body.ADDRESS1,
ADDRESS2:body.ADDRESS2,
ADDRESS3:body.ADDRESS3,
LASTUPDATE:body.DATE}
                );
            
            if(invUpdate==null)
            {
                
                res.status(500).json({
                    status:500,
                    success:false,
                    message:"Failed to update profile!!"
                });
            }
            else
            {
                res.status(200).json({
                    status:200,
                    success:true,
                    message:"Successfully updated!!"
                });
            }
        }
        catch(error)
        {
            //console.log(error);
            res.status(500).json({
                status:500,
                success:false,
                message:"Something went Wrong"
            });
        }
}

const updateInvDistributor = async(req,res)=>{
    try
    {
        const header = req.headers;
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

        const getInv = await investorssModel.findOne({PAN_NO:body.PAN_NO,DISTRIBUTOR:key_n[1]});
        if(getInv==null)
        {
            res.json({
                success:false,
                status:500,
                message:"No Investor(s)",
                records:records
            });
        }
        else
        {
            
           const invUpdate = await investorssModel.findByOneAndUpdate({PAN_NO:body.PAN_NO},
                {INV_NAME:body.INV_NAME,
MOBILE_NO:body.MOBILE_NO,
OCCUPATION:body.OCCUPATION,
EMAIL:body.EMAIL,
ADDRESS1:body.ADDRESS1,
ADDRESS2:body.ADDRESS2,
ADDRESS3:body.ADDRESS3,
LASTUPDATE:body.DATE}
                );
            
            if(invUpdate==null)
            {
                
                res.status(500).json({
                    status:500,
                    success:false,
                    message:"Failed to update profile!!"
                });
            }
            else
            {
                res.status(500).json({
                    status:200,
                    success:true,
                    message:"Successfully updatedd!!"
                });
            }
        }
    }
    catch(error)
    {
        res.json({
            success:false,
            status:500,
            message:error
        });
    }
}

module.exports = {login,changePassword,create,get,getOne,checkHost,updateInv,updateInvDistributor,chnageTheme}const investorsService = require("./investors.service");
const managesService = require("../manage/manages.service");
const managesModel = require("../manage/manages.model");
const investorssModel = require("../investors/investors.model");
const optionssModel = require("../manage/options.model");
const bliingsModel = require("../manage/bliings.model");
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
   

const login  = async (req, res) => {
    try
    {
        const body = req.body;
        const header = req.headers;
        var website = header.website;
        var pan = body.PAN_CARD;
        var password = body.PASSWORD;
        var mKey = null;
        const manage = await managesModel.findOne({mWebsite:website,mFlag:1}).lean();
        if(manage==null)
        {
            res.json({
                success:false,
                status:500,
                message:"Invalid Host"
            });
        }

        const inv = await investorssModel.findOne({PAN_NO:pan,DISTRIBUTOR:manage.mKey}).lean();
        if(inv==null)
        {
            res.json({
                success:false,
                status:500,
                message:"Invalid PAN Number!!" 
            });
        }
        else
        {
            //const results = compareSync(password, inv.PASSWORD);
            if (md5(password)==inv.PASSWORD)
            {
                var string = "CLIENT|"+inv._id;
                var userID = encrypt(string);

                res.json({
                    success:true,
                    status:200,
                    type:"CLIENT",
                    message:"Login Success!!",
                    user_id:userID
                });

            }
            else
            {
                res.json({
                    status:500,
                    success:false,
                    message:"Invalid Password"
                });
            }
        }



    }
    catch(error)
    {
        res.json({
            success:false,
            status:500,
            message:error
        });
    }
}


const changePassword = async(req,res)=>{
    
        try
        {
            var body = req.body;
            var headers = req.headers;
            var website = headers.website;
            body.password = md5(body.password);
            var old_password = body.old_password;
            const manage = await managesModel.findOne({mWebsite:website,mFlag:1}).lean();
            if(manage==null)
            {
                res.json({
                    success:false,
                    status:500,
                    message:"Invalid Host"
                });
            }


            var key = decrypt(headers.auth);
            var key_n = key.split("|");
            if(key_n[0]!="CLIENT")
            {
                return res.status(403).json({ success:false,status:403,message: "Unauthorised Access!!" });
            }

            const invCheck = await investorssModel.findById(key_n[1]).lean();
            if(invCheck==null)
            {
                return res.status(403).json({ success:false,status:403,message: "Unauthorised Access: Invalid Client" });
            }
            //const results = compareSync(old_password, invCheck.PASSWORD);
            if(md5(old_password)!=invCheck.PASSWORD)
            {
                return res.status(500).json({ success:false,status:500,message: "Wrong Old Password" });
            }

            const invUpdate = await investorssModel.findByIdAndUpdate(key_n[1],{PASSWORD:body.password});
            
            if(invUpdate==null)
            {
                
                res.status(500).json({
                    status:500,
                    success:false,
                    message:"Failed to update password!!"
                });
            }
            else
            {
                res.status(500).json({
                    status:200,
                    success:true,
                    message:"Successfully changed password!!"
                });
            }
        }
        catch(error)
        {
            console.log(error);
            res.status(500).json({
                status:500,
                success:false,
                message:"Something went Wrong"
            });
        }
}

const create = async(req,res)=>{
    const body = req.body;
    const header = req.headers;
    var website = header.website;
    var key = decrypt(header.auth);
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
            status:500,
            message:"Invalid Host"
        });
    }

}

const getOne = async(req,res)=>{
    try
    {
        const body = req.body;
        const header = req.headers;
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

        const getAll = await investorssModel.findOne({DISTRIBUTOR:key_n[1],PAN_NO:body.PAN_NO});
        if(getAll==null)
        {
            res.json({
                success:false,
                status:500,
                message:"No Investor with PAN "+body.PAN_NO
            });
        }
        else
        {
            res.json({
                success:true,
                status:200,
                INV_NAME:getAll.INV_NAME,
                EMAIL:getAll.EMAIL,
                MOBILE_NO:getAll.MOBILE_NO,
                INV_DOB:getAll.INV_DOB,
                ADDRESS1:getAll.ADDRESS1,
                ADDRESS2:getAll.ADDRESS2,
                INV_PROFILE:getAll.INV_PROFILE,
                PAN_NO:getAll.PAN_NO,
                OCCUPATION:getAll.OCCUPATION,
                ADDRESS3:getAll.ADDRESS3,
                CITY:getAll.CITY,
                PINCODE:getAll.PINCODE,
                INV_MOBILE:getAll.INV_MOBILE
            });
        }
    }
    catch(error)
    {
        res.json({
            success:false,
            status:500,
            message:error
        });
    }
}


const get = async(req,res)=>{
    try
    {
        const header = req.headers;
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

        const getAll = await investorssModel.find({DISTRIBUTOR:key_n[1]});
        if(getAll.length==0)
        {
            res.json({
                success:false,
                status:500,
                message:"No Investor(s)",
                records:records
            });
        }
        else
        {
            for(var i=0;i<getAll.length;i++)
            {
                var x = ({
                    INV_NAME:getAll[i].INV_NAME,
                    INV_DOB:getAll[i].INV_DOB,
                    ADDRESS1:getAll[i].ADDRESS1,
                    ADDRESS2:getAll[i].ADDRESS2,
                    ADDRESS3:getAll[i].ADDRESS3,
                    PINCODE:getAll[i].PINCODE,
                    CITY:getAll[i].CITY,
                    MOBILE_NO:getAll[i].MOBILE_NO,
                    EMAIL:getAll[i].EMAIL,
                    PAN_NO:getAll[i].PAN_NO
                });
                records.push(x);
            }
            res.json({
                success:false,
                status:500,
                message:"No Investor(s)",
                records:records
            });
        }
    }
    catch(error)
    {
        console.log(error);
        res.json({
            success:false,
            status:500,
            message:error
        });
    }

}

const checkHost = async(req,res)=>{
    try
    {
        const header = req.headers;
        var website = header.website;
        var key = decrypt(header.auth);
        var key_n = key.split("|");
        if(key_n[0]!="CLIENT")
        {
            return res.status(403).json({ success:false,status:403,message: "Unauthorised Access!!" });
        }
        const manage = await managesModel.findOne({mWebsite:website,mFlag:1}).lean();
        if(manage==null)
        {
            res.json({
                success:false,
                status:500,
                message:"Invalid Host"
            });
        }

        const invCheck = await investorssModel.findById(key_n[1]);
        if(invCheck==null)
        {
            res.json({
                success:false,
                status:500,
                message:"Invalid User"
            });
        }
        else
        {
            const theme = await optionssModel.findOne({DISTRIBUTOR:key_n[1],option_type:"CLIENTTHEME"});
            if(theme==null)
            {
                var themeBody = ({
                    leftSideBarTheme:"dark",
                    darkMode:"false",
                    layoutBoxed:"false",
                    option_type:"CLIENTTHEME",
                    DISTRIBUTOR:key_n[1]
                });
                const createTheme = await optionssModel.create(themeBody);
                if(createTheme==null)
                {
                    res.json({
                        success:true,
                        status:200,
                        leftSideBarTheme:"dark",
                        darkMode:"false",
                        layoutBoxed:"false",
                        INV_NAME:invCheck.INV_NAME,
                        ADDRESS1:invCheck.ADDRESS1,
                        ADDRESS2:invCheck.ADDRESS2,
                        ADDRESS3:invCheck.ADDRESS3,
                        CITY:invCheck.CITY,
                        PINCODE:invCheck.PINCODE,
                        INV_DOB:invCheck.INV_DOB,
                        MOBILE_NO:invCheck.MOBILE_NO,
                        OCCUPATION:invCheck.OCCUPATION,
                        EMAIL:invCheck.EMAIL,
                        PAN_NO:invCheck.PAN_NO,
                        AADHAAR:invCheck.AADHAAR,
                        INV_PROFILE:invCheck.INV_PROFILE,
                        mBusiness:manage.mBusiness,
                        mLogo:manage.mLogo,
                        mLogoLight:manage.mLogoLight,
                        mWebsite:manage.mWebsite
                    });
                }
                else
                {
                    res.json({
                        success:true,
                        status:200,
                        leftSideBarTheme:theme.leftSideBarTheme,
                        darkMode:theme.darkMode,
                        layoutBoxed:theme.layoutBoxed,
                        INV_NAME:invCheck.INV_NAME,
                        ADDRESS1:invCheck.ADDRESS1,
                        ADDRESS2:invCheck.ADDRESS2,
                        ADDRESS3:invCheck.ADDRESS3,
                        CITY:invCheck.CITY,
                        PINCODE:invCheck.PINCODE,
                        INV_DOB:invCheck.INV_DOB,
                        MOBILE_NO:invCheck.MOBILE_NO,
                        OCCUPATION:invCheck.OCCUPATION,
                        EMAIL:invCheck.EMAIL,
                        PAN_NO:invCheck.PAN_NO,
                        AADHAAR:invCheck.AADHAAR,
                        INV_PROFILE:invCheck.INV_PROFILE,
                        mBusiness:manage.mBusiness,
                        mLogo:manage.mLogo,
                        mLogoLight:manage.mLogoLight,
                        mWebsite:manage.mWebsite
                    });
                }
            }
            else
            {
                res.json({
                    success:true,
                    status:200,
                    leftSideBarTheme:theme.leftSideBarTheme,
                    darkMode:theme.darkMode,
                    layoutBoxed:theme.layoutBoxed,
                    INV_NAME:invCheck.INV_NAME,
                    ADDRESS1:invCheck.ADDRESS1,
                    ADDRESS2:invCheck.ADDRESS2,
                    ADDRESS3:invCheck.ADDRESS3,
                    CITY:invCheck.CITY,
                    PINCODE:invCheck.PINCODE,
                    INV_DOB:invCheck.INV_DOB,
                    MOBILE_NO:invCheck.MOBILE_NO,
                    OCCUPATION:invCheck.OCCUPATION,
                    EMAIL:invCheck.EMAIL,
                    PAN_NO:invCheck.PAN_NO,
                    AADHAAR:invCheck.AADHAAR,
                    INV_PROFILE:invCheck.INV_PROFILE,
                    mBusiness:manage.mBusiness,
                    mWebsite:manage.mWebsite
                });
            }
        }
    }
    catch(error)
    {
        console.log(error);
        res.json({
            success:false,
            status:500,
            message:error
        });
    }
}

const chnageTheme = async(req,res) =>{
    try
    {
            var body = req.body;
            var headers = req.headers;
            var website = headers.website;
            
            const manage = await managesModel.findOne({mWebsite:website,mFlag:1}).lean();
            if(manage==null)
            {
                res.json({
                    success:false,
                    status:500,
                    message:"Invalid Host"
                });
            }


            var key = decrypt(headers.auth);
            var key_n = key.split("|");
            if(key_n[0]!="CLIENT")
            {
                return res.status(403).json({ success:false,status:403,message: "Unauthorised Access!!" });
            }

            const invCheck = await investorssModel.findById(key_n[1]).lean();
            if(invCheck==null)
            {
                return res.status(403).json({ success:false,status:403,message: "Unauthorised Access: Invalid Client" });
            }

            const changeT = await optionssModel.findOneAndUpdate({DISTRIBUTOR:key_n[1],option_type:"CLIENTTHEME"},{
                leftSideBarTheme:body.leftSideBarTheme,
                darkMode:body.darkMode
            });
            if(changeT==null)
            {
                res.status(500).json({
                    success:false,
                    status:500,
                    message:"Failed to update Theme"
                });
            }
            else
            {
                res.status(200).json({
                    success:true,
                    status:200,
                    message:"Theme Updated!!"
                });
            }

    }
    catch(error)
        {
            //console.log(error);
            res.status(500).json({
                status:500,
                success:false,
                message:"Something went Wrong"
            });
        }
}

const updateInv = async(req,res) => {
    try
        {
            var body = req.body;
            var headers = req.headers;
            var website = headers.website;
            
            const manage = await managesModel.findOne({mWebsite:website,mFlag:1}).lean();
            if(manage==null)
            {
                res.json({
                    success:false,
                    status:500,
                    message:"Invalid Host"
                });
            }


            var key = decrypt(headers.auth);
            var key_n = key.split("|");
            if(key_n[0]!="CLIENT")
            {
                return res.status(403).json({ success:false,status:403,message: "Unauthorised Access!!" });
            }

            const invCheck = await investorssModel.findById(key_n[1]).lean();
            if(invCheck==null)
            {
                return res.status(403).json({ success:false,status:403,message: "Unauthorised Access: Invalid Client" });
            }
            
            if(body.INV_NAME===null || body.MOBILE_NO===null || body.OCCUPATION===null || body.EMAIL===null || body.ADDRESS1===null || body.ADDRESS2===null ||body.DATE===null)
            {
                return res.status(500).json({ success:false,status:500,message: "Missing Parameters or Blank Parameters" });
            }

            const invUpdate = await investorssModel.findByIdAndUpdate(key_n[1],
                {INV_NAME:body.INV_NAME,
MOBILE_NO:body.MOBILE_NO,
OCCUPATION:body.OCCUPATION,
EMAIL:body.EMAIL,
ADDRESS1:body.ADDRESS1,
ADDRESS2:body.ADDRESS2,
ADDRESS3:body.ADDRESS3,
LASTUPDATE:body.DATE}
                );
            
            if(invUpdate==null)
            {
                
                res.status(500).json({
                    status:500,
                    success:false,
                    message:"Failed to update profile!!"
                });
            }
            else
            {
                res.status(200).json({
                    status:200,
                    success:true,
                    message:"Successfully updated!!"
                });
            }
        }
        catch(error)
        {
            //console.log(error);
            res.status(500).json({
                status:500,
                success:false,
                message:"Something went Wrong"
            });
        }
}

const updateInvDistributor = async(req,res)=>{
    try
    {
        const header = req.headers;
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

        const getInv = await investorssModel.findOne({PAN_NO:body.PAN_NO,DISTRIBUTOR:key_n[1]});
        if(getInv==null)
        {
            res.json({
                success:false,
                status:500,
                message:"No Investor(s)",
                records:records
            });
        }
        else
        {
            
           const invUpdate = await investorssModel.findByOneAndUpdate({PAN_NO:body.PAN_NO},
                {INV_NAME:body.INV_NAME,
MOBILE_NO:body.MOBILE_NO,
OCCUPATION:body.OCCUPATION,
EMAIL:body.EMAIL,
ADDRESS1:body.ADDRESS1,
ADDRESS2:body.ADDRESS2,
ADDRESS3:body.ADDRESS3,
LASTUPDATE:body.DATE}
                );
            
            if(invUpdate==null)
            {
                
                res.status(500).json({
                    status:500,
                    success:false,
                    message:"Failed to update profile!!"
                });
            }
            else
            {
                res.status(500).json({
                    status:200,
                    success:true,
                    message:"Successfully updatedd!!"
                });
            }
        }
    }
    catch(error)
    {
        res.json({
            success:false,
            status:500,
            message:error
        });
    }
}

module.exports = {login,changePassword,create,get,getOne,checkHost,updateInv,updateInvDistributor,chnageTheme}
