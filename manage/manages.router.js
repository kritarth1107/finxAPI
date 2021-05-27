const managesController = require("./manages.controller");
const router = require("express").Router();


router.post("/add",managesController.create);
router.post("/host",managesController.checkHost);
router.post("/login",managesController.login);
router.post("/change-password",managesController.changePassword);
router.post("/update",managesController.updateDetails);
router.post("/theme",managesController.checkTheme);
router.post("/change-theme",managesController.changeTheme);

module.exports = router;