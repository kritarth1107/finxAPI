const cartsController = require("./carts.controller");
const router = require("express").Router();


router.post("/distributor/add",cartsController.addToBag);
router.post("/distributor/show",cartsController.showBag);
router.post("/distributor/remove",cartsController.removeBag);
router.post("/distributor/place",cartsController.placeOrder);

module.exports = router;