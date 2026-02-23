import mongoose from "mongoose";
import { DB_URL } from "../../config/config.service.js";

export async function testDBconnection() {
  try {
    await mongoose.connect(DB_URL);
    console.log("DB Connected");
  } catch (error) {
    console.log("DB Conection Failed", error);
  }
}
