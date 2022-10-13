import express from "express";
import cors from "cors";
import connectDb from "./config/connectiondb.js";
import userRoutes from "./routes/userRoutes.js";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = process.env.PORT;

// CORS Policy
app.use(cors());

// JSON
app.use(express.json());

// Loading Routes
app.use("/api/user", userRoutes);

// Connecting to database
const connection = async () => {
  try {
    await connectDb(process.env.URL);
    console.log("Connected to DataBase: JWTAuth...");
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.log(err);
  }
};

connection();
