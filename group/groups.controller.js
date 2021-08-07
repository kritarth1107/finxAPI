const groupModel = require("./groups.model");
const investorssModel = require("../investors/investors.model");
const manageService = require("../manage/manages.service");

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



const getGroups = async (req, res) => {
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


        const f = await groupModel.find({DISTRIBUTOR:key_n[1]});
        if(f.length<1)
        {
            return res.status(500).json({ success:false,status:500,message: "Error!!" });
        }
        else
        {
            for(var i = 0; i < f.length; i++)
            {
                const inv = await investorssModel.findOne({DISTRIBUTOR:key_n[1],PAN_NO:f[i].GROUP_ADMIN});
                var upds = ({
                    INV_NAME:inv.INV_NAME,
                    MOBILE_NO:inv.MOBILE_NO,
                    PAN_NO:inv.PAN_NO,
                    INV_PROFILE:inv.INV_PROFILE,
                    GROUP_TITLE:f[i].GROUP_TITLE,
                    GID:f[i]._id,
                });

                finalsData.push(upds);

            }

            return res.status(200).json({ success:true,status:200,message: "Groups!!",group:finalsData });

        }
    }
    catch(error)
    {
        console.log(error);
        res.json(error);

    }
}
 const members = async (req,res) => {
    try
    {
        const { groupID } = req.body;
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

        const findGroup = await groupModel.findById(groupID);

        if(findGroup==null)
        {
            return res.status(500).json({ success:false,status:500,message: "Error!!" });
        }
        else
        {

        const findInv = await investorssModel.find({INV_GROUP:groupID,DISTRIBUTOR:key_n[1]});
        const inv = await investorssModel.findOne({DISTRIBUTOR:key_n[1],PAN_NO:findGroup.GROUP_ADMIN});

            var upds = ({
                    success:true,status:200,
                    GROUP_LEADER_NAME:inv.INV_NAME,
                    GROUP_LEADER_MOBILE_NO:inv.MOBILE_NO,
                    GROUP_LEADER_PAN_NO:inv.PAN_NO,
                    GROUP_LEADER_INV_PROFILE:inv.INV_PROFILE,
                    GROUP_TITLE:findGroup.GROUP_TITLE,
                    GID:findGroup._id,
                    MEMBERS:findInv
                });
            return res.status(200).json(upds);
        }
        


    }
    catch(error)
    {
        res.json(error);
    }
 }


  const deleteMember = async (req,res) => {
    try
    {
        const { groupID,pan } = req.body;
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

        const findGroup = await groupModel.findById(groupID);

        if(findGroup==null)
        {
            return res.status(500).json({ success:false,status:500,message: "Error!!" });
        }
        else
        {

            const inv = await investorssModel.findOne({DISTRIBUTOR:key_n[1],PAN_NO:pan,INV_GROUP:groupID});
            if(inv==null)
            {
                return res.status(500).json({ success:false,status:500,message: "Invalid Investor!!" });
            }
            else
            {
                if(findGroup.GROUP_ADMIN==pan)
                {
                    return res.status(500).json({ success:false,status:500,message: "Group leader Can not be removed!!" });
                }
                else
                {
                    const changeT = await investorssModel.findOneAndUpdate({DISTRIBUTOR:key_n[1],PAN_NO:pan},{
                        INV_GROUP:"NOT ASSIGNED"
                    });
                    return res.status(200).json({ success:true,status:200,message: "Member Removed!!" });
                }
                
            }

        }
        


    }
    catch(error)
    {
        res.json(error);
    }
 }


  const changeLeader = async (req,res) => {
    try
    {
        const { groupID,pan } = req.body;
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

        const findGroup = await groupModel.findById(groupID);

        if(findGroup==null)
        {
            return res.status(500).json({ success:false,status:500,message: "Error!!" });
        }
        else
        {

            const inv = await investorssModel.findOne({DISTRIBUTOR:key_n[1],PAN_NO:pan,INV_GROUP:groupID});
            if(inv==null)
            {
                return res.status(500).json({ success:false,status:500,message: "Invalid Investor!!" });
            }
            else
            {
                if(findGroup.GROUP_ADMIN==pan)
                {
                    return res.status(500).json({ success:false,status:500,message: "Already Group Leader!!" });
                }
                else
                {
                    const changeT = await groupModel.findByIdAndUpdate(groupID,{
                        GROUP_ADMIN:pan
                    });
                    return res.status(200).json({ success:true,status:200,message: "Leader Changed!!" });
                }
                
            }

        }
        


    }
    catch(error)
    {
        res.json(error);
    }
 }



const create = async (req, res) => {

    try
    {
        const { admin,title } = req.body;
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


        const findGroup = await groupModel.findOne({GROUP_TITLE:title,DISTRIBUTOR:key_n[1]});
        if(findGroup==null)
        {
            const findInv = await investorssModel.findOne({PAN_NO:admin,DISTRIBUTOR:key_n[1]});
            if(findInv==null)
            {
                return res.status(500).json({ success:false,status:500,message: "Invalid Group Leader!!" });
            }
            else
            {
                var groupBody = ({
                        GROUP_TITLE:title,
                        GROUP_ADMIN:admin,
                        GROUP_MEMS:"1",
                        DISTRIBUTOR:key_n[1]
                    });
                const createGroup = await groupModel.create(groupBody);
                if(createGroup==null)
                {
                    return res.status(500).json({ success:false,status:500,message: "Error!!" });
                }
                else
                {
                    const changeT = await investorssModel.findOneAndUpdate({DISTRIBUTOR:key_n[1],PAN_NO:admin},{
                        INV_GROUP:createGroup._id
                    });
                    return res.status(200).json({ success:true,status:200,message: "Group Created!!",group:createGroup._id });
                }
            }

            
        }
        else
        {
            return res.status(500).json({ success:false,status:500,message: "Group with name already exists!!" });
        }


        
    }
    catch(error)
    {
        res.json(error);

    }

}



module.exports = {
    create,getGroups,members
}