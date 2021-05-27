const dbfController = require("./dbf.controller");
const router = require("express").Router();

router.post("/folio",dbfController.main);
router.post("/transaction",dbfController.transaction);

module.exports = router;