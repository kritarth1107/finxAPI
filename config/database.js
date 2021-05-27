const mongoose = require("mongoose");
require("dotenv").config();
module.exports = function(){
    mongoose.connect(process.env.DB_URL,
    {useNewUrlParser:true,
    useUnifiedTopology:true}
    ).catch(error => console.log(error));;

    mongoose.connection.on("connected", ()=>
    {
        console.log("DB Connected");
    });

};