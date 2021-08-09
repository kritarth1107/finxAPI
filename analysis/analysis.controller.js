//import { Schemes, folio } from "./analysis.model";
//const anaModel = require("./analysis.model");
const folioModel = require("../folios/folios.model");
const transModel = require("../transactions/transactions.model");
const investorsModel = require("../investors/investors.model");
const navModel = require("../nav/navs.model");
const manageService = require("../manage/manages.service");
const requestHTTP = require('request');
const {
    json
} = require("express");
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


function getNAV(SCHCODE) {
    var navData = [];
    requestHTTP('https://api.mfapi.in/mf/' + SCHCODE, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            var myJSON = JSON.parse(body);
            NAV_DATE = myJSON.data[0].date;
            NAV_PRICE = myJSON.data[0].nav;
            var dataS = ({
                NAV_DATE: NAV_DATE,
                NAV_PRICE: NAV_PRICE
            });
            navData.push(dataS);
        } else {
            NAV_DATE = null;
            NAV_PRICE = null;
            var dataS = ({
                NAV_DATE: NAV_DATE,
                NAV_PRICE: NAV_PRICE
            });
            navData.push(dataS);
        }
    });
    return navData;
}
const folioGET = async (req, res) => {
    var Transcations = new Array();
    var finalsData = [];
    try {
        const {
            PAN_NO,
            amc,
            category
        } = req.body;
        var website = req.headers.website;
        var key = decrypt(req.headers.auth);
        var key_n = key.split("|");
        if (key_n[0] != "DISTRIBUTOR") {
            return res.status(403).json({
                success: false,
                status: 403,
                message: "Unauthorised Access!!"
            });
        }

        manageService.checkManage(website, key_n[1], 1).then(result => {
            if (result == null) {
                return res.status(403).json({
                    success: false,
                    status: 403,
                    message: "Unauthorised Access!!"
                });
            }
        }).catch(error => {

        });

        var f = null;
        if (amc == "" || amc == " " || amc == "all") {
            if (category == "" || category == " " || category == "all") {
                var f = await folioModel
                    .find({
                        DISTRIBUTOR: key_n[1],
                        PAN_NO: PAN_NO
                    })
                    .lean();
            } else {
                var f = await folioModel
                    .find({
                        DISTRIBUTOR: key_n[1],
                        PAN_NO: PAN_NO,
                        SCH_CATEGORY: category
                    })
                    .lean();
            }
        } else {
            if (category == "" || category == " " || category == "all") {
                var f = await folioModel
                    .find({
                        DISTRIBUTOR: key_n[1],
                        PAN_NO: PAN_NO,
                        SCH_AMC: amc,
                        SCH_CATEGORY: category
                    })
                    .lean();
            } else {
                var f = await folioModel
                    .find({
                        DISTRIBUTOR: key_n[1],
                        PAN_NO: PAN_NO,
                        SCH_AMC: amc
                    })
                    .lean();
            }
        }


        if (f.length < 1) {
            return res.status(404).json({
                success: false,
                status: 404,
                message: "No Folios Found!!"
            });
        }
        for (var i = 0; i < f.length; i++) {
            var FOLIONO = f[i].FOLIOCHK;
            var SCH_CODE = f[i].SCH_CODE;
            var PRODUCT = f[i].PRODUCT;
            var SCH_IISN = f[i].SCH_IISN;
            var SCH_AMC = f[i].SCH_AMC.toLowerCase();
            var SCH_CATEGORY = f[i].SCH_CATEGORY.toLowerCase();
            /*const NAV_API = await fetch('https://api.mfapi.in/mf/'+SCH_CODE);
            const myJson = await NAV_API.json();

            console.log(myJson);*/
            var NAV_DATE = null;
            var NAV_PRICE = null;
            //var navData = await getNAV(SCH_CODE);

            const navData = await navModel.findOne({
                "$or": [{
                    ISIN_1: SCH_IISN
                }, {
                    ISIN_2: SCH_IISN
                }]
            });


            const transactions = await transModel.find({
                FOLIO_NO: FOLIONO,
                PRODCODE: PRODUCT,
                DISTRIBUTOR: key_n[1]
            }).lean();


            var upds = ({
                NAV_PRICE: navData.NAV,
                NAV_DATE: navData.NAV_DATE,
                FOLIONO: f[i].FOLIOCHK,
                BROKER_COD: f[i].BROKER_COD,
                SCH_CODE: f[i].SCH_CODE,
                PRODUCT: f[i].PRODUCT,
                SCH_NAME: f[i].SCH_NAME,
                SCH_AMC: f[i].SCH_AMC,
                SCH_CATEGORY: f[i].SCH_CATEGORY,
                SCH_IISN: f[i].SCH_IISN,
                FOLIO_DATE: f[i].FOLIO_DATE,
                REGISTRAR: f[i].REGISTRAR,
                HOLDING_NA: f[i].HOLDING_NA,
                BANK_NAME: f[i].BANK_NAME,
                BRANCH: f[i].BRANCH,
                AC_TYPE: f[i].AC_TYPE,
                AC_NO: f[i].AC_NO,
                NOM_1: f[i].NOM_1,
                NOM_2: f[i].NOM_2,
                NOM_3: f[i].NOM_3,
                TRANS: transactions
            });
            finalsData.push(upds);


        }
        res.status(200).json({
            status: 200,
            success: true,
            records: finalsData
        });
    } catch (error) {
        console.log(error);
        res.json(error);
    }
};


const folioGETsingle = async (req, res) => {
        var Transcations = new Array();
    var finalsData = [];
    try {
        const {
            PAN_NO,
            FOLIO_NO
        } = req.body;
        var website = req.headers.website;
        var key = decrypt(req.headers.auth);
        var key_n = key.split("|");
        if (key_n[0] != "DISTRIBUTOR") {
            return res.status(403).json({
                success: false,
                status: 403,
                message: "Unauthorised Access!!"
            });
        }

        manageService.checkManage(website, key_n[1], 1).then(result => {
            if (result == null) {
                return res.status(403).json({
                    success: false,
                    status: 403,
                    message: "Unauthorised Access!!"
                });
            }
        }).catch(error => {

        });

        var f = null;
        var f = await folioModel
                    .find({
                        DISTRIBUTOR: key_n[1],
                        FOLIOCHK: FOLIO_NO,
                        PAN_NO: PAN_NO
                    })
                    .lean();


        if (f.length < 1) {
            return res.status(404).json({
                success: false,
                status: 404,
                message: "No Folios Found!!"
            });
        }
        for (var i = 0; i < f.length; i++) {
            var FOLIONO = f[i].FOLIOCHK;
            var SCH_CODE = f[i].SCH_CODE;
            var PRODUCT = f[i].PRODUCT;
            var SCH_IISN = f[i].SCH_IISN;
            var SCH_AMC = f[i].SCH_AMC.toLowerCase();
            var SCH_CATEGORY = f[i].SCH_CATEGORY.toLowerCase();
            /*const NAV_API = await fetch('https://api.mfapi.in/mf/'+SCH_CODE);
            const myJson = await NAV_API.json();

            console.log(myJson);*/
            var NAV_DATE = null;
            var NAV_PRICE = null;
            //var navData = await getNAV(SCH_CODE);

            const navData = await navModel.findOne({
                "$or": [{
                    ISIN_1: SCH_IISN
                }, {
                    ISIN_2: SCH_IISN
                }]
            });


            const transactions = await transModel.find({
                FOLIO_NO: FOLIONO,
                PRODCODE: PRODUCT,
                DISTRIBUTOR: key_n[1]
            }).lean();


            var upds = ({
                NAV_PRICE: navData.NAV,
                NAV_DATE: navData.NAV_DATE,
                FOLIONO: f[i].FOLIOCHK,
                BROKER_COD: f[i].BROKER_COD,
                SCH_CODE: f[i].SCH_CODE,
                PRODUCT: f[i].PRODUCT,
                SCH_NAME: f[i].SCH_NAME,
                SCH_AMC: f[i].SCH_AMC,
                SCH_CATEGORY: f[i].SCH_CATEGORY,
                SCH_IISN: f[i].SCH_IISN,
                FOLIO_DATE: f[i].FOLIO_DATE,
                REGISTRAR: f[i].REGISTRAR,
                HOLDING_NA: f[i].HOLDING_NA,
                BANK_NAME: f[i].BANK_NAME,
                BRANCH: f[i].BRANCH,
                AC_TYPE: f[i].AC_TYPE,
                AC_NO: f[i].AC_NO,
                NOM_1: f[i].NOM_1,
                NOM_2: f[i].NOM_2,
                NOM_3: f[i].NOM_3,
                TRANS: transactions
            });
            finalsData.push(upds);


        }
        res.status(200).json({
            status: 200,
            success: true,
            records: finalsData
        });
    } catch (error) {
        console.log(error);
        res.json(error);
    }
};


const folioClient = async (req, res) => {
    var finalsData = [];
    try {
        var headers = req.headers;
        const {
            amc,
            category
        } = req.body;
        var website = headers.website;
        var key = decrypt(headers.auth);
        var key_n = key.split("|");
        if (key_n[0] != "CLIENT") {
            return res.status(403).json({
                success: false,
                status: 403,
                message: "Unauthorised Access!!"
            });
        }

        const invCheck = await investorsModel.findById(key_n[1]).lean();
        if (invCheck == null) {
            return res.status(403).json({
                success: false,
                status: 403,
                message: "Unauthorised Access: Invalid Client"
            });
        }

        manageService.checkManage(website, invCheck.DISTRIBUTOR, 1).then(result => {
            if (result == null) {
                return res.status(403).json({
                    success: false,
                    status: 403,
                    message: "Unauthorised Access!!"
                });
            }
        }).catch(error => {
            return res.status(403).json({
                success: false,
                status: 500,
                message: "Something went Wrong!!"
            });

        });
        var f = null;
        if (amc == "" || amc == " " || amc == "all") {
            if (category == "" || category == " " || category == "all") {
                var f = await folioModel
                    .find({
                        DISTRIBUTOR: invCheck.DISTRIBUTOR,
                        PAN_NO: invCheck.PAN_NO
                    })
                    .lean();
            } else {
                var f = await folioModel
                    .find({
                        DISTRIBUTOR: invCheck.DISTRIBUTOR,
                        PAN_NO: invCheck.PAN_NO,
                        SCH_CATEGORY: category
                    })
                    .lean();
            }
        } else {
            if (category == "" || category == " " || category == "all") {
                var f = await folioModel
                    .find({
                        DISTRIBUTOR: invCheck.DISTRIBUTOR,
                        PAN_NO: invCheck.PAN_NO,
                        SCH_AMC: amc,
                        SCH_CATEGORY: category
                    })
                    .lean();
            } else {
                var f = await folioModel
                    .find({
                        DISTRIBUTOR: invCheck.DISTRIBUTOR,
                        PAN_NO: invCheck.PAN_NO,
                        SCH_AMC: amc
                    })
                    .lean();
            }
        }

        if (f.length < 1) {
            return res.status(404).json({
                success: false,
                status: 404,
                message: "No Folios Found"
            });
        }
        for (var i = 0; i < f.length; i++) {
            var FOLIONO = f[i].FOLIOCHK;
            var SCH_CODE = f[i].SCH_CODE;
            var SCH_AMC = f[i].SCH_AMC.toLowerCase();
            var SCH_CATEGORY = f[i].SCH_CATEGORY.toLowerCase();
            var SCH_IISN = f[i].SCH_IISN;
            /*const NAV_API = await fetch('https://api.mfapi.in/mf/'+SCH_CODE);
              const myJson = await NAV_API.json();
      
              console.log(myJson);*/
            var NAV_DATE = null;
            var NAV_PRICE = null;

            const navData = await navModel.findOne({
                "$or": [{
                    ISIN_1: SCH_IISN
                }, {
                    ISIN_2: SCH_IISN
                }]
            });

            const transactions = await transModel.find({
                FOLIO_NO: FOLIONO,
                DISTRIBUTOR: invCheck.DISTRIBUTOR
            }).lean();

            var upds = ({
                NAV_PRICE: navData.NAV,
                NAV_DATE: navData.NAV_DATE,
                FOLIONO: f[i].FOLIOCHK,
                BROKER_COD: f[i].BROKER_COD,
                SCH_CODE: f[i].SCH_CODE,
                PRODUCT: f[i].PRODUCT,
                SCH_NAME: f[i].SCH_NAME,
                SCH_AMC: f[i].SCH_AMC,
                SCH_CATEGORY: f[i].SCH_CATEGORY,
                SCH_IISN: f[i].SCH_IISN,
                FOLIO_DATE: f[i].FOLIO_DATE,
                REGISTRAR: f[i].REGISTRAR,
                HOLDING_NA: f[i].HOLDING_NA,
                BANK_NAME: f[i].BANK_NAME,
                BRANCH: f[i].BRANCH,
                AC_TYPE: f[i].AC_TYPE,
                AC_NO: f[i].AC_NO,
                NOM_1: f[i].NOM_1,
                NOM_2: f[i].NOM_2,
                NOM_3: f[i].NOM_3,
                TRANS: transactions
            });
            finalsData.push(upds);




        }
        res.status(200).json({
            status: 200,
            success: true,
            records: finalsData
        });




    } catch (error) {
        res.json({
            status: 500,
            success: false,
            message: error
        })
    }
}

const folioClientSingle = async (req, res) => {
    var finalsData = [];
    try {
        var headers = req.headers;
        const {
            FOLIO_NO
        } = req.body;
        var website = headers.website;
        var key = decrypt(headers.auth);
        var key_n = key.split("|");
        if (key_n[0] != "CLIENT") {
            return res.status(403).json({
                success: false,
                status: 403,
                message: "Unauthorised Access!!"
            });
        }

        const invCheck = await investorsModel.findById(key_n[1]).lean();
        if (invCheck == null) {
            return res.status(403).json({
                success: false,
                status: 403,
                message: "Unauthorised Access: Invalid Client"
            });
        }

        manageService.checkManage(website, invCheck.DISTRIBUTOR, 1).then(result => {
            if (result == null) {
                return res.status(403).json({
                    success: false,
                    status: 403,
                    message: "Unauthorised Access!!"
                });
            }
        }).catch(error => {
            return res.status(403).json({
                success: false,
                status: 500,
                message: "Something went Wrong!!"
            });

        });
        var f = await folioModel
                    .find({
                        DISTRIBUTOR: invCheck.DISTRIBUTOR,
                        PAN_NO: invCheck.PAN_NO,
                        FOLIOCHK: FOLIO_NO
                    })
                    .lean();


        if (f.length < 1) {
            return res.status(404).json({
                success: false,
                status: 404,
                message: "No Folios Found"
            });
        }
        for (var i = 0; i < f.length; i++) {
            var FOLIONO = f[i].FOLIOCHK;
            var SCH_CODE = f[i].SCH_CODE;
            var SCH_AMC = f[i].SCH_AMC.toLowerCase();
            var SCH_CATEGORY = f[i].SCH_CATEGORY.toLowerCase();
            var SCH_IISN = f[i].SCH_IISN;
            /*const NAV_API = await fetch('https://api.mfapi.in/mf/'+SCH_CODE);
              const myJson = await NAV_API.json();
      
              console.log(myJson);*/
            var NAV_DATE = null;
            var NAV_PRICE = null;

            const navData = await navModel.findOne({
                "$or": [{
                    ISIN_1: SCH_IISN
                }, {
                    ISIN_2: SCH_IISN
                }]
            });

            const transactions = await transModel.find({
                FOLIO_NO: FOLIONO,
                DISTRIBUTOR: invCheck.DISTRIBUTOR
            }).lean();

            var upds = ({
                NAV_PRICE: navData.NAV,
                NAV_DATE: navData.NAV_DATE,
                FOLIONO: f[i].FOLIOCHK,
                BROKER_COD: f[i].BROKER_COD,
                SCH_CODE: f[i].SCH_CODE,
                PRODUCT: f[i].PRODUCT,
                SCH_NAME: f[i].SCH_NAME,
                SCH_AMC: f[i].SCH_AMC,
                SCH_CATEGORY: f[i].SCH_CATEGORY,
                SCH_IISN: f[i].SCH_IISN,
                FOLIO_DATE: f[i].FOLIO_DATE,
                REGISTRAR: f[i].REGISTRAR,
                HOLDING_NA: f[i].HOLDING_NA,
                BANK_NAME: f[i].BANK_NAME,
                BRANCH: f[i].BRANCH,
                AC_TYPE: f[i].AC_TYPE,
                AC_NO: f[i].AC_NO,
                NOM_1: f[i].NOM_1,
                NOM_2: f[i].NOM_2,
                NOM_3: f[i].NOM_3,
                TRANS: transactions
            });
            finalsData.push(upds);




        }
        res.status(200).json({
            status: 200,
            success: true,
            records: finalsData
        });




    } catch (error) {
        res.json({
            status: 500,
            success: false,
            message: error
        })
    }
}

module.exports = {
    folioGET,
    folioClient,
    folioGETsingle,
    folioClientSingle
}