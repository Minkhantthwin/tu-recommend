import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "TU-Recommend API",
      version: "1.0.0",
      description:
        "Technological University Recommendation & Application System API",
      contact: {
        name: "API Support",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter JWT token",
        },
      },
      schemas: {
        // Common
        Error: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            error: { type: "string" },
          },
        },
        ValidationError: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            error: { type: "string", example: "Validation failed" },
            details: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  field: { type: "string" },
                  message: { type: "string" },
                },
              },
            },
          },
        },

        // Auth
        RegisterRequest: {
          type: "object",
          required: ["email", "password", "confirmPassword"],
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "user@example.com",
            },
            password: { type: "string", minLength: 8, example: "Password123" },
            confirmPassword: { type: "string", example: "Password123" },
          },
        },
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "user@example.com",
            },
            password: { type: "string", example: "Password123" },
          },
        },
        RefreshTokenRequest: {
          type: "object",
          required: ["refreshToken"],
          properties: {
            refreshToken: { type: "string" },
          },
        },
        ChangePasswordRequest: {
          type: "object",
          required: ["currentPassword", "newPassword", "confirmPassword"],
          properties: {
            currentPassword: { type: "string" },
            newPassword: { type: "string", minLength: 8 },
            confirmPassword: { type: "string" },
          },
        },
        AuthResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: {
              type: "object",
              properties: {
                user: {
                  type: "object",
                  properties: {
                    id: { type: "string", format: "uuid" },
                    email: { type: "string", format: "email" },
                    role: { type: "string", enum: ["USER", "ADMIN"] },
                  },
                },
                tokens: {
                  type: "object",
                  properties: {
                    accessToken: { type: "string" },
                    refreshToken: { type: "string" },
                    expiresIn: { type: "number", example: 900 },
                  },
                },
              },
            },
            message: { type: "string" },
          },
        },
        TokensResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: {
              type: "object",
              properties: {
                accessToken: { type: "string" },
                refreshToken: { type: "string" },
                expiresIn: { type: "number", example: 900 },
              },
            },
            message: { type: "string" },
          },
        },

        // User
        User: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            email: { type: "string", format: "email" },
            role: { type: "string", enum: ["USER", "ADMIN"] },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        CreateUserRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "user@example.com",
            },
            password: { type: "string", minLength: 8, example: "Password123" },
          },
        },
        UpdateUserRequest: {
          type: "object",
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 8 },
          },
        },

        // User Profile
        UserProfile: {
          type: "object",
          properties: {
            id: { type: "number" },
            userId: { type: "string", format: "uuid" },
            nameMyanmar: { type: "string", description: "အမည် (မြန်မာ)" },
            nameEnglish: { type: "string", description: "Name (English)" },
            nrc: {
              type: "string",
              description: "နိုင်ငံသားစိစစ်ရေးကတ်ပြားအမှတ်",
            },
            dateOfBirth: { type: "string", format: "date" },
            gender: { type: "string", enum: ["MALE", "FEMALE"] },
            religion: {
              type: "string",
              enum: ["BUDDHIST", "CHRISTIAN", "HINDU", "ISLAM", "OTHER"],
            },
            ethnicity: { type: "string" },
            nationality: { type: "string", default: "Myanmar" },
            maritalStatus: { type: "string", enum: ["SINGLE", "MARRIED"] },
            phone: { type: "string" },
            alternatePhone: { type: "string", nullable: true },
            permanentAddress: { type: "string" },
            permanentTownship: { type: "string" },
            permanentRegion: { type: "string" },
            currentAddress: { type: "string", nullable: true },
            currentTownship: { type: "string", nullable: true },
            currentRegion: { type: "string", nullable: true },
            fatherName: { type: "string" },
            fatherNrc: { type: "string", nullable: true },
            fatherOccupation: { type: "string", nullable: true },
            fatherPhone: { type: "string", nullable: true },
            motherName: { type: "string" },
            motherNrc: { type: "string", nullable: true },
            motherOccupation: { type: "string", nullable: true },
            motherPhone: { type: "string", nullable: true },
            guardianName: { type: "string", nullable: true },
            guardianRelation: { type: "string", nullable: true },
            guardianPhone: { type: "string", nullable: true },
            guardianAddress: { type: "string", nullable: true },
            photoUrl: { type: "string", nullable: true },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        CreateUserProfileRequest: {
          type: "object",
          required: [
            "nameMyanmar",
            "nameEnglish",
            "nrc",
            "dateOfBirth",
            "gender",
            "religion",
            "ethnicity",
            "phone",
            "permanentAddress",
            "permanentTownship",
            "permanentRegion",
            "fatherName",
            "motherName",
          ],
          properties: {
            nameMyanmar: { type: "string", example: "မောင်မောင်" },
            nameEnglish: { type: "string", example: "Maung Maung" },
            nrc: { type: "string", example: "12/YAKANA(N)123456" },
            dateOfBirth: {
              type: "string",
              format: "date",
              example: "2000-01-01",
            },
            gender: { type: "string", enum: ["MALE", "FEMALE"] },
            religion: {
              type: "string",
              enum: ["BUDDHIST", "CHRISTIAN", "HINDU", "ISLAM", "OTHER"],
            },
            ethnicity: { type: "string", example: "Bamar" },
            nationality: { type: "string", example: "Myanmar" },
            maritalStatus: { type: "string", enum: ["SINGLE", "MARRIED"] },
            phone: { type: "string", example: "09123456789" },
            alternatePhone: { type: "string" },
            permanentAddress: { type: "string" },
            permanentTownship: { type: "string", example: "Yankin" },
            permanentRegion: { type: "string", example: "Yangon" },
            currentAddress: { type: "string" },
            currentTownship: { type: "string" },
            currentRegion: { type: "string" },
            fatherName: { type: "string" },
            fatherNrc: { type: "string" },
            fatherOccupation: { type: "string" },
            fatherPhone: { type: "string" },
            motherName: { type: "string" },
            motherNrc: { type: "string" },
            motherOccupation: { type: "string" },
            motherPhone: { type: "string" },
            guardianName: { type: "string" },
            guardianRelation: { type: "string" },
            guardianPhone: { type: "string" },
            guardianAddress: { type: "string" },
            photoUrl: { type: "string", format: "uri" },
          },
        },

        // Upload
        UploadResult: {
          type: "object",
          properties: {
            url: {
              type: "string",
              format: "uri",
              example:
                "http://localhost:9000/tu-recommend/profiles/123-uuid.jpg",
            },
            key: { type: "string", example: "profiles/123-uuid.jpg" },
            bucket: { type: "string", example: "tu-recommend" },
            size: { type: "integer", example: 102400 },
            mimetype: { type: "string", example: "image/jpeg" },
            originalName: { type: "string", example: "profile-photo.jpg" },
          },
        },
      },
    },
    tags: [
      { name: "Health", description: "Health check endpoints" },
      { name: "Auth", description: "Authentication endpoints" },
      { name: "Users", description: "User management endpoints" },
      { name: "User Profile", description: "User profile endpoints" },
      {
        name: "Upload",
        description: "File upload endpoints for MinIO storage",
      },
    ],
  },
  apis: ["./src/app.ts", "./src/modules/**/*.routes.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
