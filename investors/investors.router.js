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
router.post("/chnage-theme",investorsController.chnageTheme);
router.post("/ucc",investorsController.ucc_registration);
router.post("/ucc/existing",investorsController.ucc_existing);

module.exports = router;
