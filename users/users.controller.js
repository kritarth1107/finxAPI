const usersService = require("./users.service");
const { hashSync, genSaltSync, compareSync } = require("bcrypt");
const { sign } = require("jsonwebtoken");

module.exports = {
    create:(req,res)=>{
        const body = req.body;
        const salt = genSaltSync(10);
        body.password = hashSync(body.password, salt);

        if(body.mobile.length!=10)
        {
            res.json({
                success:false,
                message:"XYS Failed to add user",
            });  
        }
        usersService.getUsersByMobile(body.mobile).then(result=>{
            if(result)
            {
                res.json({
                    success:false,
                    message:"Mobile Already Exist",
                });
            }
            else
            {
                

                usersService.create(body).then(result=>{

                    if(result)
                    {
                        res.json({
                            success:true,
                            message:"User Added Successfully",
                            data:result
                        });
                    }
                    else
                    {
                        res.json({
                            success:false,
                            message:"Failed to add user",
                        });
                    }
                    
                }).catch(error=>{
                    res.json({
                        success:false,
                        message:error.errors,
                    });
                });
            }
            
        });
        /**/
    },
    login:(req,res)=>{
        const body = req.body;

        usersService.getUsersByMobile(body.mobile).then(result=>{
            if(result)
            {
                const results = compareSync(body.password, result.password);
                if (results) {
                    result.password = undefined;
                    const jsontoken = sign({ result: body }, "KRITARTHAGRAWAL@!#1107", {
                        expiresIn: "1h"
                      });
                    res.json({
                        success:1,
                        message:"Login Success",
                        token:jsontoken
                    });
                }
                else
                {
                    res.json({
                        success:3,
                        message:"Invalid Password",
                    });
                }
            }
            else
            {
                res.json({
                    success:404,
                    message:"No user found",
                });
            }
        }).catch(error=>{
            res.json({
                success:false,
                message:error.errors,
            });
        });
    },
    getUserDetail:(req,res)=>{
        const body = req.body;
        usersService.getUsersByMobile(body.mobile).then(result=>{
            if(result)
            {
                    result.password = undefined;
                    
                    res.json({
                        success:1,
                        message:"User Detail(s)",
                        id:result._id,
                        name:result.name,
                        mobile:result.mobile
                    });
                
            }
            else
            {
                res.json({
                    success:404,
                    message:"No user found",
                });
            }
        }).catch(error=>{
            res.json({
                success:false,
                message:error.errors,
            });
        });
    }
}