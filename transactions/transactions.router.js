const transactionsController = require("./transactions.controller");
const router = require("express").Router();


router.post("/folio-amalysis",transactionsController.portfolioAna);

module.exports = router;