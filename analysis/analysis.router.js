const routes = require("express").Router();
const analysisController = require("./analysis.controller");
 
routes.post("/distributor", analysisController.folioGET);
routes.post("/distributor/single", analysisController.folioGETsingle);
routes.post("/client", analysisController.folioClient);
routes.post("/client/single", analysisController.folioClientSingle);
routes.post("/folio/delete", analysisController.deleteFolio);

module.exports = routes;
