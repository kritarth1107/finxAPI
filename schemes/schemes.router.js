const schemesController = require("./schemes.controller");
const router = require("express").Router();


router.get("/schemes",schemesController.getAllSchemes);
router.post("/single",schemesController.getSingleSchemes);

module.exports = router;