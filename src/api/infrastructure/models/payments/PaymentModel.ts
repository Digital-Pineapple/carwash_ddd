
import mongoose, {  Schema,  model, Document } from 'mongoose';
import  {PaymentEntity}  from '../../../domain/payments/PaymentEntity';


const PaymentSchema = new Schema<PaymentEntity>({
    uuid:{
        type:String,
    },
    user_id:{
        type:mongoose.Types.ObjectId,
        ref:'User',
        required:false
    },
    MP_info: {
        type: Object,
        required:false
    },
    status:{
        type:Boolean,
        required:false,
        default:true,
    }
   
}, {
    versionKey: false,
    timestamps: true,
});


const PaymentModel = mongoose.model<PaymentEntity> ('Payment', PaymentSchema);
export default PaymentModel;
