const groupsController = require("./groups.controller");
const router = require("express").Router();


router.post("/add",groupsController.create);
router.post("/get",groupsController.getGroups);
router.post("/members",groupsController.members);
router.post("/deleteMember",groupsController.deleteMember);
router.post("/changeLeader",groupsController.changeLeader);

module.exports = router;