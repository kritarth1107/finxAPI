const usersController = require("./users.controller");
const router = require("express").Router();
const { checkToken } =  require("../auth/token_validation");


router.post("/add",usersController.create);
router.post("/login",usersController.login);
router.post("/detail",checkToken,usersController.getUserDetail);

module.exports = router;