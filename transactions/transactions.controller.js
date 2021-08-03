const transactionsService = require("./transactions.service");
const foliosService = require("../folios/folios.service");
const investorsService = require("../investors/investors.service");
const transactionsModel = require("./transactions.model");
const foliosModel = require("../folios/folios.model");
const manageService = require("../manage/manages.service");
const investorsModel = require("../investors/investors.model");



function getProperTrans(string)
{
    string = string.toLowerCase();
    if(string.indexOf("systematic")>-1 || string.indexOf("sip")>-1)
    {
        return "SIP";
    }
    else if(string.indexOf("redemption")>-1 || string.indexOf("redeem")>-1)
    {
        return "REDEMPTION";
    }
    else if(string.indexOf("purchase")>-1)
    {
        return "PURCHASE";
    }
    else if(string.indexOf("dividendreinvest")>-1 || string.indexOf("dividend reinvest")>-1
    || string.indexOf("dividend-reinvest")>-1 || string.indexOf("dividend-re")>-1 || string.indexOf("dividend re")>-1)
    {
        return "DIV_REINVEST";
    }
    else if(string.indexOf("dividendpaid")>-1 || string.indexOf("dividend paid")>-1
    || string.indexOf("dividend-paid")>-1 || string.indexOf("dividend-pa")>-1 || string.indexOf("dividend pa")>-1)
    {
        return "DIV_PAID";
    }
    else if(string.indexOf("switchout")>-1 || string.indexOf("switch-out")>-1
    || string.indexOf("shiftout")>-1 || string.indexOf("shift-out")>-1 || string.indexOf("shift out")>-1
    || string.indexOf("switch out")>-1 || string.indexOf("shift ou")>-1 || string.indexOf("switch ou")>-1
    || string.indexOf("transfer out")>-1 || string.indexOf("transfer-out")>-1 || string.indexOf("transferout")>-1
    || string.indexOf("transfer ou")>-1)
    {
        return "SHIFT_OUT";
    }
    else if(string.indexOf("switchin")>-1 || string.indexOf("switch-in")>-1
    || string.indexOf("shiftin")>-1 || string.indexOf("shift-in")>-1 || string.indexOf("shift in")>-1
    || string.indexOf("switch in")>-1 || string.indexOf("shift i")>-1 || string.indexOf("switch i")>-1
    || string.indexOf("transfer in")>-1 || string.indexOf("transfer-in")>-1 || string.indexOf("transferin")>-1
    || string.indexOf("transfer i")>-1)
    {
        return "SHIFT_IN";
    }
}

function transactionsGET(PRODUCT,FOLIO,dist)
{
    var mainResult =[];
    /*transactionsService.getTransactions(PRODUCT,FOLIO,dist).then(results=>{
        if(results.length==0)
        { 
            return null;
        }
        else
        {   
            
            mainResult.push(results);
           
        }
    }).catch(error=>{
        return null;
    });*/
    const resu = transactionsModel.find({PRODUCT,FOLIO,dist});
    mainResult.push(resu);
    return mainResult;
}


function getFoliosOn(data,distributor_id)
{

    return  transactionsGET(data.PRODUCT,data.FOLIOCHK,distributor_id);
    var nav_date = null;
    var nav_price = null;
    var  final_units = 0.0;
    var redemptionStatus = false;
    var pprice = 0;
    var fDate = null;
    var days = 0;
    var tDays = 0;
    var daysCount = 0;
    var transactions = [];
    var product = [];
    var result = new Array();


    if(data.SCH_CODE=="" || data.SCH_CODE==" ")
    {

    }
    console.log(transactionsGET(data.PRODUCT,data.FOLIOCHK,distributor_id));
    /*transactionsService.getTransactions(data.PRODUCT,data.FOLIOCHK,distributor_id).then(results=>{
        if(results.length==0)
        { 
            console.log("mmust")
        }
        else
        {   
            result.push(results);
            //console.log(result);  
           
        }
    }).catch(error=>{
        return null;
        // return results;
    }).then(()=>{
        //console.log(result)
        // return result;
    })**/

   console.log(result)
   return null;

    var pos=0;
    var j=0;

    for(j=0;j<result.length;j++)
    {
        var transaction_nature = getProperTrans(result[j].TRX_NATURE);
        var transaction_units = parseFloat(result[j].UNITS).toFixed(2);
        var transaction_price = result[j].PURPRICE;
        var transaction_amount = result[j].AMOUNT;
        var transaction_date = result[j].TRX_DATE;

        if(transaction_nature=="REDEMPTION" || transaction_nature=="SHIFT_OUT")
        {
            final_units = parseFloat(final_units)-parseFloat(transaction_units);
            if(transaction_nature=="REDEMPTION")
            {
                redemptionStatus=true
            }
            else
            {
                if(!redemptionStatus)
                {
                    pprice = parseFloat(pprice) - parseFloat(transaction_amount);
                }
            }
        }
        else if(transaction_nature=="PURCHASE" || transaction_nature=="SHIFT_IN" || transaction_nature=="SIP")
        {
            final_units = parseFloat(final_units)+parseFloat(transaction_units);
            //console.log(final_units);
            if(redemptionStatus)
            {
                if(transaction_price>0)
                {
                    pprice = transaction_price;
                }
            }
            else
            {
                pprice = parseFloat(pprice)+parseFloat(transaction_amount);
            }
        }

        if(transaction_nature!="REDEMPTION")
        {
            var days = 200 ;// get days for transaction_date
            var years = days/365;
            var t = 365/days;
            var CAGR = 0;
            daysCount++;
            tDays = parseInt(tDays)+parseInt(days);

            var CURRENT_VAL = null;
            var PL = null;
            var ABS = null;
            if(nav_price!=null)
            {
                CURRENT_VAL = nav_price*transaction_units;
                PL = CURRENT_VAL - transaction_amount;
                ABS = (PL/transaction_amount)*100;

            }

            var DIV_REINVEST = 0;
            var DIV_PAID = 0;
            var valsPurprice = 0;
            var valsAmount = 0;
            if(transaction_nature=="DIV_PAID")
            {
                DIV_PAID = transaction_amount;
            }
            else if(transaction_nature=="DIV_REINVEST")
            {
                DIV_REINVEST = transaction_amount;
            }
            else 
            {
                valsPurprice = transaction_price;
                valsAmount = transaction_amount;
            }

            //insert into transactions array here

            transactions[pos]= ({
                TRXNNO:result[j].TRXNNO,
                TRX_DATE:result[j].TRX_DATE,
                UNITS:result[j].UNITS,
                PURPRICE:valsPurprice,
                DAYS:days,
                NAV_PRICE:nav_price,
                TRX_NATURE:transaction_nature,
                DIV_PAID:DIV_PAID,
                DIV_REINV:DIV_REINVEST,
                CURRENT_VAL:CURRENT_VAL,
                PL:PL,
                ABS:ABS,
                CAGR:CAGR,
                AMOUNT:valsAmount
            });
            pos++;

            //console.log(transactions);

                    
        }



    }

    if(parseFloat(final_units).toFixed(2)>0)
    {
        var CURRENT_VAL = null;
        var PL = null;
        var TAMOUNT = null;
        if(nav_price!=null)
        {
            CURRENT_VAL = nav_price*final_units;
            if(redemptionStatus)
            {
               TAMOUNT = pprice*final_units;
            }
            else{
                TAMOUNT = pprice;
            }

            PL = CURRENT_VAL-TAMOUNT;
        }

        var dd = tDays/daysCount;


        //insert intoProduct Array here

        product = ({
            FOLIOCHK : data.FOLIOCHK,
            SCH_IISN : data.SCH_IISN,
            SCH_CATEGORY : data.SCH_CATEGORY,
            AVAILABLE_UNITS : final_units,
            COST_PRICE : pprice,
            DATE : fDate,
            DAYS : dd,
            NAV_PRICE : nav_price,
            CURRENT_VAL : CURRENT_VAL,
            PL : PL,
            AMOUNT : TAMOUNT,
            SCH_NAME : data.SCH_NAME,
            REGISTRAR : data.REGISTRAR,
            FOLIO_DATE : data.FOLIO_DATE,
            PRODUCT : data.PRODUCT,
            TRANSACTION : transactions
         });
         //console.log(product);
         return product;
         
        // console.log(product);
    }
    else
    {
        return null;
    }

}



function getFolios(pancard_number,distributor_id){
    try
    {
        const resu = foliosModel.find({pancard_number,distributor_id});
        return resu;
    }
    catch(error)
    {
        return null;
    }
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

            var folioData = await transactionsModel
            .findOne({ FOLIOCHK:FOLIONO,PRODUCT:PRODCODE,DISTRIBUTOR:key_n[1] });

            var invData = await investorsModel
            .findOne({ PAN_NO:folioData.PAN_NO,DISTRIBUTOR:key_n[1] });

            var upds = ({
                    TID:f[i].TID;,
                    PRODCODE:f[i].PRODCODE,
                    FOLIO_NO:f[i].FOLIO_NO,
                    TRXNNO:f[i].TRXNNO,
                    TRX_DATE:f[i].TRX_DATE,
                    UNITS:f[i].UNITS,
                    PURPRICEf[i].PURPRICE,
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
                }

            finalsData.push(upds);


        }

        res.status(200).json({status:200,success:true,records:finalsData});


    }
    catch (error) {
        console.log(error);
        res.json(error);
    }


    };


module.exports = {
    transactionsGETx,
    portfolioAna:async(req,res)=>{
        const body = req.body;
        const headers = req.headers;

        var pancard_number = body.PAN_NO;
        var amc = body.amc.toLowerCase();
        var category  = body.category.toLowerCase();
        var distributor_id = headers.authenticate;
        var final_amount = 0;
        var invested_value = 0;
        var total_pl = 0;
        var total_days = 0;
        var pos = 0;
        var product_array = [];
        var foliosData = [];
        const resu = await foliosModel.find({pancard_number,distributor_id});
        
        console.log(resu);
        res.status(200).json(resu);

        /*foliosService.getFolios(pancard_number,distributor_id).then(result=>{
            if(result.length==0)
            {
                res.json({
                    success:false,
                    status:500,
                    message:"NO FOLIOS"
                });
            }
            else
            { 
                foliosData.push(result);
            }
        }).catch(error=>{
            console.log(error);
            res.json({
                success:false,
                status:500,
                message:error
            });
        });

        res.json({
            foliosData
        })*/


        /*var i=0;
        for(i=0;i<foliosData.length;i++)
        {
            var PRODUCT = foliosData[i].PRODUCT.toLowerCase();
            var REGISTRAR = foliosData[i].REGISTRAR;
            var FOLIOCHK = foliosData[i].FOLIOCHK;
            var SCH_CODE = foliosData[i].SCH_CODE;
            var SCH_CATEGORY = foliosData[i].SCH_CATEGORY.toLowerCase();
            var SCH_AMC = foliosData[i].SCH_AMC.toLowerCase();

            if(amc=="" || amc==" " || amc=="all")
            {
                if(category=="" || category==" " || category=="all")
                {
                    res.json({
                        foliosData
                    })
                }
                else if(category==SCH_CATEGORY)
                {

                }
            }
            else if(amc=SCH_AMC)
            {

            }
        }*/

    }
}