const managesService = require("./manages.service");
const managesModel = require("./manages.model");
const logsModel = require("./logs.model");
const optionsModel = require("./options.model");
const bliingsModel = require("./bliings.model");
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

const changePassword = async (req,res)=>{
    try{
        var body = req.body;
        var headers = req.headers;
        var website = headers.website;
        body.password = md5(body.password);
        var old_password = body.old_password;
        var date = body.date;
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
                status:500,
                message:"Invalid Host"
            });
        }

        //const results = compareSync(old_password, manage.mPassword);
        if(md5(old_password)!=manage.mPassword)
        {
            return res.status(500).json({ success:false,status:500,message: "Wrong Old Password" });
        }
        
        
        const manageUpdate = await managesModel.findByIdAndUpdate(manage._id,{mPassword:body.password});
        if(manageUpdate==null)
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
        res.status(500).json({
            success:false,
            status:500,
            message:error.toString()
        })
    }
}

const updateDetails = async (req,res)=>{
    try{
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
                status:500,
                message:"Invalid Host"
            });
        }
        
        const manageUpdate = await managesModel.findByIdAndUpdate(manage._id,body);
        if(manageUpdate==null)
            {
                
                res.status(500).json({
                    status:500,
                    success:false,
                    message:"Failed to update!!"
                });
            }
            else
            {
                res.status(500).json({
                    status:200,
                    success:true,
                    message:"Successfully updated!!"
                });
            }


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

const checkHost = async(req,res)=>{
    try
    {
        const header = req.headers;
        const body = req.body;
        var data = ({
            logIP:header.ip,
            logHost:header.website,
            logPage:body.page,
            logUser:header.auth
        });
        const addLog = await logsModel.create(data);
        managesService.checkHost(header.website,1).then(result=>{
            if(result==null)
            {
                res.json({
                    success:false,
                    status:500,
                    message:"Looks like it has invalid host to access the page you were looking for."
                });
            }
            else
            {

                const checkValidity = await bliingsModel.findOne({DISTRIBUTOR:result.mKey});
                if(checkValidity==null)
                {
                    res.json({
                        success:false,
                        status:500,
                        message:"Looks like you are not authorised to access the page you were looking for."
                    });
                }
                else
                {
                    var today = new Date();
                    var dd = today.getDate();

                    var mm = today.getMonth()+1; 
                    var yyyy = today.getFullYear();
                    if(dd<10) 
                    {
                        dd='0'+dd;
                    } 

                    if(mm<10) 
                    {
                        mm='0'+mm;
                    } 
                    today = yyyy+mm+dd;

                    if(parseInt(today)>=parseInt(checkValidity.VALIDITY))
                    {
                            res.json({
                        success:true,
                        status:200,
                        mEmail:result.mEmail,
                        mMobile:result.mMobile,
                        mBusiness:result.mBusiness,
                        mWebsite:result.mWebsite,
                        mPerson:result.mPerson
                        });
                    }
                    else
                    {
                        res.json({
                        success:false,
                        status:402,
                        message:"Looks Like the subscription for the service has expired, contact administration to renew."
                        });
                    }
                }
                
                
            }
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

const checkTheme = async(req,res)=>{
    try
    {
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
                status:500,
                message:"Invalid Host"
            });
        }
        else
        {
            const option = await optionsModel.findOne({DISTRIBUTOR:key_n[1],option_type:"ADMINTHEME"});
            if(option==null)
            {
                res.json({
                    status:200,
                    success:true,
                    leftSideBarTheme:"dark",
                    layoutBoxed:"false",
                    darkMode:"false"
                });
            }
            else
            {
                res.json({
                    status:200,
                    success:true,
                    leftSideBarTheme:option.leftSideBarTheme,
                    layoutBoxed:option.layoutBoxed,
                    darkMode:option.darkMode
                });
            }
        }
    }
    catch(error){
        res.json({
            status:200,
            success:true,
            leftSideBarTheme:"dark",
            layoutBoxed:"false",
            darkMode:"false"
        });
    }
}

const changeTheme = async(req,res)=>{
    try
    {
        var headers = req.headers;
        var body = req.body;
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
                status:500,
                message:"Invalid Host"
            });
        }
        else
        {
            const changeT = await optionsModel.findOneAndUpdate({DISTRIBUTOR:key_n[1],option_type:"ADMINTHEME"},{
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
    }
    catch(error)
    {
        res.status(500).json({
            success:false,
            status:500,
            message:error.toString()
        });
    }
}


module.exports = {
    checkHost,checkTheme,changeTheme,
    create:(req,res)=>{
        const body = req.body;
        const header = req.headers;
        body.mPassword = md5(body.mPassword);
        body.mKey = body.mMobile.substring(0, 4)+body.mBusiness.substring(0, 4).toUpperCase();
        body.mFlag = "1";
        body.mUser="ADMIN";

        if(body.mMobile.length!=10)
        {
            res.json({
                success:false,
                message:"Invalid Mobile Number",
            });  
        }

        managesService.getManageByWebsite(body.mWebsite,body.mMobile,body.mKey).then(result=>{

            if(result.length==0)
            {
                managesService.create(body).then(createResult=>{
                    res.json({
                        success:true,
                        status:200,
                        id:createResult._id,
                        message:"Distributor Registered"
                    });
                });
            }
            else
            {
                res.json({
                    success:false,
                    status:500,
                    message:"User Already Exist",
                });
            }
            
        });
        /**/
    },
    login:(req,res)=>{
        const header = req.headers;
        const body = req.body;
        managesService.getManageLogin(header.website,body.email).then(result=>{
            if(result==null)
            {
                res.json({
                    success:false,
                    status:500,
                    type:"DISTRIBUTOR",
                    message:"Invalid Email Adddress"
                });
            }
            else
            {
                //const results = compareSync(body.password, result.mPassword);
                if (md5(body.password)==result.mPassword)
                {
                    result.password = undefined;
                    result._id = undefined;
                    result.__v = undefined;
                    result.mFlag = undefined;
                    var string = "DISTRIBUTOR|"+result.mKey;
                    var userID = encrypt(string);
                    result.mKey = undefined;

                    res.json({
                        success:true,
                        status:200,
                        type:"DISTRIBUTOR",
                        message:"Login Success!!",
                        user_id:userID
                    });

                }
                else
                {
                    res.json({
                        success:false,
                        status:500,
                        type:"DISTRIBUTOR",
                        message:"Incorrect Password!!"
                    });
                }
            }
        }).catch(error=>{

        });

    },changePassword,updateDetails
    
}
