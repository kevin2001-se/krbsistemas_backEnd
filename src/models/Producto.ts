import mongoose, { Schema, Document, Types } from 'mongoose';
import mongoosePaginate from "mongoose-paginate-v2";

export interface IProducto extends Document {
    description: string;
    image: string;
    price: number;
    stock: number;
    user_id: Types.ObjectId;
}

const productoSchema = new Schema({
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
        required: true,
    },
    stock: {
        type: Number,
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

productoSchema.plugin(mongoosePaginate)

const Producto = mongoose.model<IProducto, mongoose.PaginateModel<IProducto>>('Producto', productoSchema);

export default Producto;