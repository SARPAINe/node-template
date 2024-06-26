import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { rateLimit } from "express-rate-limit";
import { createServer } from "http";
import { Server } from "socket.io";
import { DB_NAME } from "./constants.js";
import { dbInstance } from "./db/index.js";
// import { initializeSocketIO } from "./socket/index.js";
import morgan from "morgan";
import "express-async-errors";

const app = express();

const httpServer = createServer(app);

// const io = new Server(httpServer, {
//   pingTimeout: 60000,
//   cors: {
//     origin: process.env.CORS_ORIGIN,
//     credentials: true,
//   },
// });

// using set method to mount the `io` instance on the app to avoid usage of `global`
// app.set("io", io);

//routers
import authRouter from "./routes/auth.routes.js";
//middleware
import { notFound as notFoundMiddleware } from "./middlewares/notFound.js";
import { errorHandlerMiddleware } from "./middlewares/error-handler.js";

// global middlewares
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(morgan("dev"));

// Rate limiter to avoid misuse of the service and avoid cost spikes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Limit each IP to 500 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (_, __, ___, options) => {
    throw new ApiError(
      options.statusCode || 500,
      `There are too many requests. You are only allowed ${
        options.max
      } requests per ${options.windowMs / 60000} minutes`
    );
  },
});

// Apply the rate limiting middleware to all requests
app.use(limiter);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public")); // configure static file to save images locally
app.use(cookieParser());

app.use("/api/v1/auth", authRouter);
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

// initializeSocketIO(io);

export { httpServer };
