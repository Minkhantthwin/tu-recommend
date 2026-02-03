import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";

dotenv.config();

import { errorHandler } from "./common/middleware/error.middleware";
import { notFoundHandler } from "./common/middleware/not-found.middleware";
import { swaggerSpec } from "./config/swagger";

// Import module routes
import authRoutes from "./modules/auth/auth.routes";
import userRoutes from "./modules/user/user.routes";
import uploadRoutes from "./modules/upload/upload.routes";
import universityRoutes from "./modules/university/university.routes";
import interestRoutes from "./modules/interest/interest.routes";
import recommendationRoutes from "./modules/recommendation/recommendation.routes";
import matriculationRoutes from "./modules/metriculation/matriculation.routes";
import applicationRoutes from "./modules/application/application.routes";
import adminRoutes from "./modules/admin/admin.routes";
// Add more module routes here as needed

const app = express();

// Middleware
// Configure helmet with CSP that allows your domains
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        connectSrc: [
          "'self'",
          "https://api.tu-recommend.online",
          "https://storage.tu-recommend.online",
        ],
        imgSrc: [
          "'self'",
          "data:",
          "https://storage.tu-recommend.online",
        ],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
      },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// Configure CORS to allow your client domain
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001", 
  "https://tu-recommend.online",
  "https://www.tu-recommend.online",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger Documentation
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "TU-Recommend API Documentation",
  }),
);

// Swagger JSON endpoint
app.get("/api-docs.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

/**
 * @swagger
 * /health:
 *   get:
 *     tags: [Health]
 *     summary: Health check endpoint
 *     description: Returns the health status of the API
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api", universityRoutes);
app.use("/api", interestRoutes);
app.use("/api", recommendationRoutes);
app.use("/api", matriculationRoutes);
app.use("/api", applicationRoutes);
app.use("/api/admin", adminRoutes);
// Add more module routes heree

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;