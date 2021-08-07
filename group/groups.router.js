const groupsController = require("./groups.controller");
const router = require("express").Router();


router.post("/add",groupsController.create);
router.post("/get",groupsController.getGroups);

module.exports = router;