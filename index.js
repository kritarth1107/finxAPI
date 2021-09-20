const express = require("express");
const app = express();
const DB = require("./config/database");
const managesRouter = require("./manage/manages.router");
const schemesRouter = require("./schemes/schemes.router");
const foliosRouter = require("./folios/folios.router");
const transactionRouter = require("./transactions/transactions.router");
const analysisRouter = require("./analysis/analysis.router");
const investorsRouter = require("./investors/investors.router");
const groupsRouter = require("./group/groups.router");
const dbfRouter = require("./dbf/dbf.router");
require("dotenv").config();

DB();

app.use(express.json());
app.use("/manage",managesRouter);
app.use("/schemes",schemesRouter);
app.use("/folios",foliosRouter);
app.use("/transactions",transactionRouter);
app.use("/analysis",analysisRouter);
app.use("/investor",investorsRouter);
app.use("/groups",groupsRouter);
app.use("/dbf",dbfRouter);


app.listen(process.env.PORT, () =>{
    console.log("Server Connected: "+process.env.PORT);
});

//module.exports = app;