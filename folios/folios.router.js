const foliosController = require("./folios.controller");
const router = require("express").Router();


router.post("/folios",foliosController.getFolios);
router.post("/manual-entry",foliosController.manualEntry);

module.exports = router;