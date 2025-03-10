import mongoose, { model, Schema } from "mongoose";
import { ProductOrderEntity } from "../../../domain/product/ProductEntity";

const ProductOrderSchema = new Schema<ProductOrderEntity>(
  {
    _id: {
      type: Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId()
    },
    order_id: {
      type: String,
      required: true,
      unique: true
    },
    payment: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: 'Payment'
    },
    payment_status:{
      type:String,
      required:true
    },
    user_id: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: 'Users'
    },
    products: {
      type: Array,
      required: false
    },
    discount: {
      type: Number,
      required: false,
    },
    subTotal: {
      type: Number,
      required: false,
    },
    total: {
      type: Number,
      required: false,
    },
    shipping_cost: {
      type: Number,
      required: false,
    },
    branch: {
      type: mongoose.Types.ObjectId,
      required: false,
      ref: 'BranchOffices'
    },
    storeHouseStatus: {
      type: Boolean,
      required: false,
      default: false,
    },
    supply_detail: {
      type: Object,
      required: false,
    },
    route_detail: {
      type: Object,
      required: false,
    },
    deliveryStatus: {
      type: Boolean,
      required: false,
      default: false
    },
    deliveryLocation: {
      type: Object,
      required: false,
    },
    status: {
      type: Boolean,
      required: false,
      default: true,
    },
    download_ticket: {
      type: String,
      required: false,
    },
    route_status: {
      type: Boolean,
      default: false,
      required: false,
    },
    point_pickup_status: {
      type: Boolean,
      required: false,
    },
    paymentType: {
      type: Object,
      required: false,
    },
    typeDelivery: {
      type: String,
      enum: ['homedelivery', 'pickup'],
      required: false
    },
    origin: {
      type: String,
      required: false,
      enum: ['web', 'mobile']
    },
    requiredTax: {
      type: String,
      required: false,
      default: false
    },
    facturapi_tax_id: {
      type: String,
      required: false,      
    },
    tax_expiration_date: {
      type: Date,
      required: false
    }  
  },
  {
    versionKey: false,
    timestamps: true,
  }
);


const ProductOrderModel = model<ProductOrderEntity>(
  'ProductOrders',
  ProductOrderSchema
);

export default ProductOrderModel;
