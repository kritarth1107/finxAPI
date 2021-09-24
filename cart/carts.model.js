const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const cartsSchema = new Schema({
    PAN_NO:{
        type:String,
        required:true   
    },
    PURCHASE_TYPE:{
        required:true,
        type:String,   
    },
    PRODUCT_CODE:{
        required:true,
        type:String,
    },
    FOLIO:{
        required:true,
        type:String,
    },
    SCHEME_NAME:{
        required:true,
        type:String,
    },
    AMOUNT:{
        required:true,
        type:String,
    },
    SCHEME_CODE:{
        required:true,
        type:String,
    },
    CART_TYPE:{
        required:true,
        type:String,
    },
    DISTRIBUTOR:{
        required:true,
        type:String,
    }

});

const Carts = mongoose.model("carts",cartsSchema);

module.exports = Carts;