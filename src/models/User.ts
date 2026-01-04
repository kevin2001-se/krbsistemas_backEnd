import mongoose, { Schema, Document } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

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

userSchema.plugin(mongoosePaginate)

const User = mongoose.model<IUser, mongoose.PaginateModel<IUser>>('User', userSchema);

export default User;