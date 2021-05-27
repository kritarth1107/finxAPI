const foliosController = require("./folios.controller");
const router = require("express").Router();


router.post("/folios",foliosController.getFolios);

module.exports = router;