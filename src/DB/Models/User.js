import mongoose, { Schema } from "mongoose";
import { GenderEnum, RoleEnum } from "../../Common/Enums/user.enums.js";

const userSchema = new Schema(
  {
    userName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      trim: true,
      unique: true,
      required: true,
      validate: {
        validator: function (value) {
          if (!value.includes(".com")) {
            return false;
          }
        },
        message: (props) => `${props.value} is not a valid email!`,
      },
    },
    password: {
      type: String,
      required: true,
      null: false,
    },
    phone: String,
    DOB: Date,
    gender: {
      type: String,
      enum: Object.values(GenderEnum),
      default: GenderEnum.Male,
    },
    role: {
      type: String,
      enum: Object.values(RoleEnum),
      default: RoleEnum.User,
    },
    confirmEmail: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  },
);

const UserModel = mongoose.model("User", userSchema);

export default UserModel;

// {
//     "userName":"user1",
//     "email":"email1@gmail.com",
//     "password":"123456",
//     "DOB":"1999-1-1",
//     "gender":"male"
// }
