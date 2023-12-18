import { Schema, model } from 'mongoose';
import { MembershipEntity } from '../../domain/membership/MembershipEntity';

const MembershipSchema = new Schema<MembershipEntity>(
    {
      
      name:{
        type: String,
        required: true,
      },
      price_standard: {
        type: Number,
        required:true,
    },
      price_discount:{
        type:Number,
      },
      service_quantity:{
        type: Array,
        required: false
      },
      status:{
        type:Boolean,
      }

      
    },
    {
      versionKey: false,
      timestamps: true,
    }
  );

  const MembershipModel = model('MembershipModel', MembershipSchema);

  export default MembershipModel;