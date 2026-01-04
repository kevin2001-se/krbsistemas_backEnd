import mongoose, { Schema, Document } from 'mongoose';
import { mongoosePagination, Pagination } from "mongoose-paginate-ts";

export interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    isActive: boolean;
}

const userSchema = new Schema({
    username: {
      type: String,
      required: true,
      unique: true
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true
    },
    isActive: {
      type: Schema.Types.Boolean,
      default: true
    }
}, { timestamps: true })

userSchema.plugin(mongoosePagination)

const User = mongoose.model<IUser, Pagination<IUser>>('User', userSchema);

export default User;