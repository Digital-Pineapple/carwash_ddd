import mongoose, { model, Schema } from "mongoose";
import { SHProductInput } from '../../../domain/storehouse/stockStoreHouseEntity';



const StockSHinputSchema = new Schema<SHProductInput>({
  folio: {
    type: String,
    required: false
  },
  SHStock_id: {
    type: mongoose.Types.ObjectId, ref: 'StoreHouseStocks',
    required: true,
  },

  quantity: {
    type: Number,
    required: true,
  },
  newQuantity: {
    type: Number,
    required: true,
  },
  status: {
    type: Boolean,
    required: false,
    default: true,
  },
  responsible: {
    type: Object,
    required: true,

  },
  user_received: {
    type: Object,
    required: false,
  },
  user_arrange:{
    type: Object,
    required: false,
  },
  user_delivery: {
    type: Object,
    required: false
  },
  product_detail: {
    type: Object,
    required: true,
  },
  in_storehouse: {
    type: Boolean,
    default: false
  },
  in_section: {
    type: Boolean,
    default: false,
  },
  notes: {
    type: String,
    required: false,
  },
  date_received: {
    type: String,
    required: false,
  },
  quantity_received: {
    type: Number,
    required: false,
  }
},
  {
    timestamps: true,
    versionKey: false
  }
);


const StockSHinputModel = model<SHProductInput>(
  'SHStockInputs',
  StockSHinputSchema
);

export default StockSHinputModel;

