const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const foliosSchema = new Schema({
  BROKER_COD: {
    type: String,
    required: true,
  },
  FOLIOCHK: {
    type: String,
    required: true,
  },
  PAN_NO: {
    type: String,
    required: true,
  },
  PRODUCT: {
    type: String,
    required: true,
  },
  SCH_CODE: {
    type: String,
    required: true,
  }, 
  SCH_IISN: {
    type: String,
    required: true,
  },
  SCH_NAME: {
    type: String,
    required: true,
  },
  SCH_AMC: {
    type: String,
    required: true,
  },
  SCH_CATEGORY: {
    type: String,
    required: true,
  },
  REP_DATE: {
    type: String,
    required: true,
  },
  FOLIO_DATE: {
    type: String,
    required: true,
  },
  HOLDING_NA: {
    type: String,
    required: true,
  },
  REGISTRAR: {
    type: String,
    required: true,
  },
  GST_STATE: {
    type: String,
    required: true,
  },
  BANK_NAME: {
    type: String,
    required: true,
  },
  BRANCH: {
    type: String,
    required: true,
  },
  AC_TYPE: {
    type: String,
    required: true,
  },
  AC_NO: {
    type: String,
    required: true,
  },
  NOM_1: {
    type: String,
    required: true,
  },
  NOM_2: {
    type: String,
    required: true,
  },
  NOM_3: {
    type: String,
    required: true,
  },
  CREATEDON: {
    type: String,
    required: true,
  },
  LASTUPDATE: {
    type: String,
    required: true,
  },
  DISTRIBUTOR: {
    type: String,
    required: true,
  },
  FOLIO_FLAG: {
    type: String,
    required: true,
  },
});

const transactionsSchema = new Schema({
  PRODCODE: {
    type: String,
    required: true,
  },
  FOLIO_NO: {
    type: String,
    required: true,
  },
  TRXNNO: {
    type: String,
    required: true,
  },
  TRX_DATE: {
    type: String,
    required: true,
  },
  UNITS: {
    type: String,
    required: true,
  },
  PURPRICE: {
    type: String,
    required: true,
  },
  AMOUNT: {
    type: String,
    required: true,
  },
  TD_NAV: {
    type: String,
    required: true,
  },
  STAMP_DUTY: {
    type: String,
    required: true,
  },
  TRX_NATURE: {
    type: String,
    required: true,
  },
  REGISTRAR: {
    type: String,
    required: true,
  },
  DISTRIBUTOR: {
    type: String,
    required: true,
  },
  CREATEDATE: {
    type: String,
    required: true,
  },
  TRX_FLAG: {
    type: String,
    required: true,
  },
});

const Schemes = mongoose.model("transactions", transactionsSchema);
const folio = mongoose.model("folios", foliosSchema);

module.exports = 
{
    Schemes,folio
}