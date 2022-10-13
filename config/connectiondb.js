import mongoose from "mongoose";

const connectDb = (DATABASE_URL) => {
    return mongoose.connect(DATABASE_URL, {dbName:"JWTAuth"});
}

export default connectDb