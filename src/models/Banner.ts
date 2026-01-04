import mongoose, { Schema, Document, Types } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

export interface IBanner extends Document {
    title: string;
    description: string;
    image: string;
    price: number;
    background: string;
    user_id: Types.ObjectId;
}

const bannerSchema = new Schema({
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
    background: {
        type: String,
        default: '#F7F6F2'
    },
    user_id: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, {
  timestamps: true
})

bannerSchema.plugin(mongoosePaginate)

const Banner = mongoose.model<IBanner, mongoose.PaginateModel<IBanner>>('Banner', bannerSchema);

export default Banner;