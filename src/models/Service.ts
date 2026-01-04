import mongoose, { Schema, Document, Types } from 'mongoose';
import { mongoosePagination, Pagination } from "mongoose-paginate-ts";

export interface IService extends Document {
    title: string;
    description: string;
    image: string;
    price: number;
    user_id: Types.ObjectId;
}

const serviceSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    image: {
        type: String,
        required: true
    },
    price: {
        type: Schema.Types.Double,
        default: 0.00,
    },
    user_id: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, {
  timestamps: true
})

serviceSchema.plugin(mongoosePagination)

const Service = mongoose.model<IService, Pagination<IService>>('Service', serviceSchema);

export default Service;