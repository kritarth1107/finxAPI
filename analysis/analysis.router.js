const routes = require("express").Router();
const analysisController = require("./analysis.controller");
 
routes.post("/distributor", analysisController.folioGET);
routes.post("/client", analysisController.folioClient);

module.exports = routes;