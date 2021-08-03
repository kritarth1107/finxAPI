const transactionsController = require("./transactions.controller");
const router = require("express").Router();


router.post("/folio-amalysis",transactionsController.portfolioAna);
router.post("/all-transactions",transactionsController.transactionsGET);

module.exports = router;