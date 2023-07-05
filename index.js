import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";
import corsOptions from "./config/corsOptions.js";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";

const app = express();
dotenv.config();

// mongodb_connection
connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS
app.use(cors(corsOptions));

app.use(cookieParser());

//morgan
if (process.env.NODE_ENV === "development") {
	app.use(morgan("dev"));
}

// routes

app.use("/api/auth", authRoutes);

//middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server is running on PORT ${PORT}`));
