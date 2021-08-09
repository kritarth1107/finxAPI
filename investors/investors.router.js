const investorsController = require("./investors.controller");
const router = require("express").Router();

router.post("/login",investorsController.login);
router.post("/change-password",investorsController.changePassword);
router.post("/create",investorsController.create);
router.post("/get",investorsController.get);
router.post("/get/one",investorsController.getOne);
router.post("/host",investorsController.checkHost);
router.post("/update",investorsController.updateInv);
router.post("/d/update",investorsController.updateInvDistributor);

module.exports = router;