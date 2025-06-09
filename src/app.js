const express = require("express");
const helmet = require("helmet");
const xss = require("xss-clean");
const compression = require("compression");
const cors = require("cors");
const httpStatus = require("http-status");
const config = require("./config/config");
const morgan = require("./config/morgan");
const { authLimiter } = require("./middlewares/rateLimiter");
const routes = require("./routes/v1");
const { errorConverter, errorHandler } = require("./middlewares/error");
const ApiError = require("./utils/ApiError");
const swaggerRouter = require("./routes/v1/docs.route");
const { connectDB } = require("./config/postgres");
const http = require("http");

const app = express();

const startServer = async () => {
  try {
    await connectDB();
    console.log("Connected to PostgreSQL");

    const server = http.createServer(app);
    server.listen(3000, "0.0.0.0", () =>
      console.log("Express server running on port ",3000 )
    );

    const exitHandler = () => {
      if (server) {
        server.close(() => {
          console.log("Server closed");
          process.exit(1);
        });
      } else {
        process.exit(1);
      }
    };

    process.on("SIGTERM", exitHandler);
    process.on("uncaughtException", exitHandler);
    process.on("unhandledRejection", exitHandler);
  } catch (error) {
    console.error("🔥 Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

if (config.env !== "test") {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

// Set security HTTP headers
app.use(helmet());

// Parse JSON request body
app.use(express.json());

// Parse URL-encoded request body
app.use(express.urlencoded({ extended: true }));

// Sanitize request data
app.use(xss());

// Gzip compression
app.use(compression());

// Enable CORS
app.use(cors());
app.options("*", cors());

// Limit repeated failed requests to auth endpoints
if (config.env === "production") {
  app.use("/v1/auth", authLimiter);
}

// API documentation route
app.use("/docs", swaggerRouter);

// v1 API routes
app.use("/v1", routes);

// Base route
app.get("/", (req, res) => {
  res.redirect("/docs");
});

// Handle unknown API requests
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, "Not found"));
});

// Convert error to ApiError, if needed
app.use(errorConverter);

// Handle errors
app.use(errorHandler);

module.exports = app;
