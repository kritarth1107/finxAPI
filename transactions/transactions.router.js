const transactionsController = require("./transactions.controller");
const router = require("express").Router();


router.post("/trans",transactionsController.folioGET);
router.post("/all-transactions",transactionsController.transactionsGETx);
router.post("/entry/transactions",transactionsController.transactionEntry);

module.exports = router;