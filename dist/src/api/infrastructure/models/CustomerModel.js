"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const mongoose_paginate_v2_1 = __importDefault(require("mongoose-paginate-v2"));
// const VerifyPhoneNumberSchema = Schema({
//     code: {
//         type: String,
//         required: false,
//     },
//     prefix: {
//         type: String,
//         required: false,
//     },
//     phone_number: {
//         type: String,
//         required: false,
//     },
//     expiration_date: {
//         type: Date,
//         required: false,
//     },
//     verified: {
//         type: Boolean,
//         required: true,
//         default: false
//     },
// },
//     {
//         timestamps: true
//     }
// );
const CustomerSchema = new mongoose_1.Schema({
    fullname: {
        type: String,
        required: true,
    },
    privacity: {
        type: Boolean,
        default: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: false,
    },
    stripe_customer: {
        type: String,
        required: false
    },
    profile_image: {
        type: String,
        required: false,
    },
    // google: {
    //     type: Boolean,
    //     default: false
    // },
    // phone: VerifyPhoneNumberSchema,
    // type_client_id: {
    //     type: Schema.Types.ObjectId,
    //     ref: 'TypeClient',
    //     required: false,
    // },
    // status: {
    //     type: Boolean,
    //     default: true,
    // },
    // email_verified: {
    //     type: Boolean,
    //     default: true
    // },
    // facturapi_id: {
    //     type: String,
    //     required: false
    // },
    // ine: {
    //     type: String,
    //     required: false,
    // },
    // curp: {
    //     type: String,
    //     required: false,
    // },
    // prook_address: {
    //     type: String,
    //     required: false,
    // },
    // criminal_record: {
    //     type: String,
    //     required: false,
    // }
}, {
    timestamps: true
});
// CustomerSchema.method('toJSON', function () {
//     const { __v, password, ...client } = this.toObject();
//     return client;
// });
CustomerSchema.plugin(mongoose_paginate_v2_1.default);
const CustomerModel = (0, mongoose_1.model)('Customer', CustomerSchema);
exports.default = CustomerModel;
