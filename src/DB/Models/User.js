import mongoose, { Schema } from "mongoose";
import {
  GenderEnum,
  ProviderEnum,
  RoleEnum,
} from "../../Common/Enums/user.enums.js";

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
      required: function () {
        return this.provider == ProviderEnum.System;
      },
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
    provider: {
      type: String,
      enum: Object.values(ProviderEnum),
      default: ProviderEnum.System,
    },
    profilePic: String,
    coverPic: [String],
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  },
);

const UserModel = mongoose.model("User", userSchema);

export default UserModel;
