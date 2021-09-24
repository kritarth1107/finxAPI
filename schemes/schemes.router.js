const schemesController = require("./schemes.controller");
const router = require("express").Router();


router.get("/schemes",schemesController.getAllSchemes);
router.get("/parameters",schemesController.getParameters);
router.post("/single",schemesController.getSingleSchemes);
router.post("/update",schemesController.updateSchemes);
router.post("/scheme/amc",schemesController.schemeAMC);

module.exports = router;