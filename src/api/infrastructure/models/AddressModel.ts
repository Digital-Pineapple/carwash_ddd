import { AddressEntity } from "../../domain/adresses/AddressEntity";
import { Mongoose, Schema, model } from "mongoose";

const AddressSchema = new Schema<AddressEntity>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    street: {
      type: String,
      required: true,
    },
    numext: {
      type: String,
      required: true,
    },
    numint: {
      type: String,
      required: false,
    },
    zipcode: {
      type: String,
      required: true,
    },
    coords: {
      type: Object,
      required: false,
    },
    state: {
      type: String,
      required: true,
    },
    municipality: {
      type: String,
      required: true,
    },
    neighborhood: {
      type: String,
      required: true,
    },
    reference: {
      type: String,
      required: false,
    },
    btwstreet: {
      type: String,
      required: false,
    },
    status: {
      type: Boolean,
      required: false,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const AddressModel = model("Address", AddressSchema);

export default AddressModel;
