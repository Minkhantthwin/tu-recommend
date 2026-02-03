import swaggerJsdoc from "swagger-jsdoc";

const isProduction = process.env.NODE_ENV === "production";

const servers = isProduction
  ? [
      {
        url: "https://api.tu-recommend.online",
        description: "Production server",
      },
    ]
  : [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
    ];

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
    servers,
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

        // University
        University: {
          type: "object",
          properties: {
            id: { type: "integer" },
            name: {
              type: "string",
              example: "Technological University (Thanlyin)",
            },
            nameMyanmar: {
              type: "string",
              example: "နည်းပညာတက္ကသိုလ် (သန်လျင်)",
              nullable: true,
            },
            code: { type: "string", example: "TU-Thanlyin", nullable: true },
            location: { type: "string", example: "Thanlyin Township" },
            region: { type: "string", example: "Yangon", nullable: true },
            description: { type: "string", nullable: true },
            photoUrl: { type: "string", format: "uri", nullable: true },
            logoUrl: { type: "string", format: "uri", nullable: true },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        UniversityWithPrograms: {
          type: "object",
          properties: {
            id: { type: "integer" },
            name: { type: "string" },
            nameMyanmar: { type: "string", nullable: true },
            code: { type: "string", nullable: true },
            location: { type: "string" },
            region: { type: "string", nullable: true },
            description: { type: "string", nullable: true },
            photoUrl: { type: "string", format: "uri", nullable: true },
            logoUrl: { type: "string", format: "uri", nullable: true },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
            programs: {
              type: "array",
              items: { $ref: "#/components/schemas/Program" },
            },
          },
        },
        CreateUniversity: {
          type: "object",
          required: ["name", "location"],
          properties: {
            name: {
              type: "string",
              example: "Technological University (Yangon)",
            },
            nameMyanmar: {
              type: "string",
              example: "နည်းပညာတက္ကသိုလ် (ရန်ကုန်)",
            },
            code: { type: "string", example: "TU-Yangon" },
            location: { type: "string", example: "Yangon" },
            region: { type: "string", example: "Yangon" },
            description: { type: "string" },
            photoUrl: { type: "string", format: "uri" },
            logoUrl: { type: "string", format: "uri" },
          },
        },
        UpdateUniversity: {
          type: "object",
          properties: {
            name: { type: "string" },
            nameMyanmar: { type: "string" },
            code: { type: "string" },
            location: { type: "string" },
            region: { type: "string" },
            description: { type: "string" },
            photoUrl: { type: "string", format: "uri" },
            logoUrl: { type: "string", format: "uri" },
          },
        },

        // Program
        Program: {
          type: "object",
          properties: {
            id: { type: "integer" },
            universityId: { type: "integer" },
            name: {
              type: "string",
              example: "Electronic and Communication Engineering",
            },
            nameMyanmar: {
              type: "string",
              example: "အီလက်ထရောနစ်နှင့် ဆက်သွယ်ရေးအင်ဂျင်နီယာ",
              nullable: true,
            },
            code: { type: "string", example: "EC", nullable: true },
            description: { type: "string", nullable: true },
            minScore: { type: "integer", example: 480 },
            quota: { type: "integer", example: 60, nullable: true },
          },
        },
        ProgramWithUniversity: {
          type: "object",
          properties: {
            id: { type: "integer" },
            universityId: { type: "integer" },
            name: { type: "string" },
            nameMyanmar: { type: "string", nullable: true },
            code: { type: "string", nullable: true },
            description: { type: "string", nullable: true },
            minScore: { type: "integer" },
            quota: { type: "integer", nullable: true },
            university: { $ref: "#/components/schemas/University" },
            requirements: {
              type: "array",
              items: { $ref: "#/components/schemas/ProgramRequirement" },
            },
          },
        },
        CreateProgram: {
          type: "object",
          required: ["universityId", "name", "minScore"],
          properties: {
            universityId: { type: "integer", example: 1 },
            name: { type: "string", example: "Computer Engineering" },
            nameMyanmar: { type: "string", example: "ကွန်ပျူတာအင်ဂျင်နီယာ" },
            code: { type: "string", example: "CE" },
            description: { type: "string" },
            minScore: { type: "integer", example: 450 },
            quota: { type: "integer", example: 50 },
          },
        },
        UpdateProgram: {
          type: "object",
          properties: {
            name: { type: "string" },
            nameMyanmar: { type: "string" },
            code: { type: "string" },
            description: { type: "string" },
            minScore: { type: "integer" },
            quota: { type: "integer" },
          },
        },

        // Program Requirement
        ProgramRequirement: {
          type: "object",
          properties: {
            id: { type: "integer" },
            programId: { type: "integer" },
            myanmar: { type: "integer", nullable: true },
            english: { type: "integer", nullable: true },
            mathematics: { type: "integer", nullable: true },
            physics: { type: "integer", nullable: true },
            chemistry: { type: "integer", nullable: true },
            biology: { type: "integer", nullable: true },
            minTotalScore: { type: "integer", nullable: true },
          },
        },
        CreateProgramRequirement: {
          type: "object",
          required: ["programId"],
          properties: {
            programId: { type: "integer", example: 1 },
            myanmar: { type: "integer", example: 50 },
            english: { type: "integer", example: 50 },
            mathematics: { type: "integer", example: 70 },
            physics: { type: "integer", example: 65 },
            chemistry: { type: "integer", example: 60 },
            biology: { type: "integer" },
            minTotalScore: { type: "integer", example: 450 },
          },
        },
        UpdateProgramRequirement: {
          type: "object",
          properties: {
            myanmar: { type: "integer" },
            english: { type: "integer" },
            mathematics: { type: "integer" },
            physics: { type: "integer" },
            chemistry: { type: "integer" },
            biology: { type: "integer" },
            minTotalScore: { type: "integer" },
          },
        },

        // Matriculation Result
        MatriculationResult: {
          type: "object",
          properties: {
            id: { type: "integer" },
            userId: { type: "string", format: "uuid" },
            examYear: { type: "integer", example: 2025 },
            rollNumber: { type: "string", example: "12345" },
            schoolName: { type: "string", example: "BEHS No. 1 Yangon" },
            schoolTownship: { type: "string", example: "Mingalar Taung Nyunt" },
            schoolRegion: { type: "string", example: "Yangon" },
            myanmar: { type: "integer", example: 85 },
            english: { type: "integer", example: 78 },
            mathematics: { type: "integer", example: 92 },
            physics: { type: "integer", example: 88 },
            chemistry: { type: "integer", example: 82 },
            biology: { type: "integer", nullable: true, example: 80 },
            totalScore: { type: "integer", example: 505 },
            totalMarks: { type: "integer", example: 600 },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },

        // Pagination
        Pagination: {
          type: "object",
          properties: {
            total: { type: "integer", example: 100 },
            page: { type: "integer", example: 1 },
            limit: { type: "integer", example: 10 },
            totalPages: { type: "integer", example: 10 },
          },
        },

        // Interest
        Interest: {
          type: "object",
          properties: {
            id: { type: "integer" },
            name: { type: "string", example: "Programming" },
            _count: {
              type: "object",
              properties: {
                users: { type: "integer", example: 5 },
              },
            },
          },
        },
        CreateInterest: {
          type: "object",
          required: ["name"],
          properties: {
            name: { type: "string", example: "Programming" },
          },
        },
        UpdateInterest: {
          type: "object",
          properties: {
            name: { type: "string", example: "Software Development" },
          },
        },
        AddUserInterest: {
          type: "object",
          required: ["interestId"],
          properties: {
            interestId: { type: "integer", example: 1 },
          },
        },
        AddMultipleUserInterests: {
          type: "object",
          required: ["interestIds"],
          properties: {
            interestIds: {
              type: "array",
              items: { type: "integer" },
              example: [1, 2, 3],
            },
          },
        },

        // Program Comparison
        ProgramComparison: {
          type: "object",
          required: ["programIds"],
          properties: {
            programIds: {
              type: "array",
              items: { type: "integer" },
              minItems: 2,
              maxItems: 5,
              example: [1, 2, 3],
              description: "Array of 2-5 program IDs to compare",
            },
          },
        },

        // Matriculation
        CreateMatriculation: {
          type: "object",
          required: [
            "examYear",
            "rollNumber",
            "schoolName",
            "schoolTownship",
            "schoolRegion",
            "myanmar",
            "english",
            "mathematics",
            "physics",
            "chemistry",
          ],
          properties: {
            examYear: { type: "integer", example: 2025 },
            rollNumber: { type: "string", example: "12345" },
            schoolName: { type: "string", example: "BEHS No. 1 Yangon" },
            schoolTownship: { type: "string", example: "Mingalar Taung Nyunt" },
            schoolRegion: { type: "string", example: "Yangon" },
            myanmar: { type: "integer", minimum: 0, maximum: 100, example: 85 },
            english: { type: "integer", minimum: 0, maximum: 100, example: 78 },
            mathematics: {
              type: "integer",
              minimum: 0,
              maximum: 100,
              example: 92,
            },
            physics: { type: "integer", minimum: 0, maximum: 100, example: 88 },
            chemistry: {
              type: "integer",
              minimum: 0,
              maximum: 100,
              example: 82,
            },
            biology: {
              type: "integer",
              minimum: 0,
              maximum: 100,
              example: 80,
              nullable: true,
            },
          },
        },
        UpdateMatriculation: {
          type: "object",
          properties: {
            examYear: { type: "integer" },
            rollNumber: { type: "string" },
            schoolName: { type: "string" },
            schoolTownship: { type: "string" },
            schoolRegion: { type: "string" },
            myanmar: { type: "integer", minimum: 0, maximum: 100 },
            english: { type: "integer", minimum: 0, maximum: 100 },
            mathematics: { type: "integer", minimum: 0, maximum: 100 },
            physics: { type: "integer", minimum: 0, maximum: 100 },
            chemistry: { type: "integer", minimum: 0, maximum: 100 },
            biology: {
              type: "integer",
              minimum: 0,
              maximum: 100,
              nullable: true,
            },
          },
        },
        MatriculationWithUser: {
          type: "object",
          properties: {
            id: { type: "integer" },
            userId: { type: "string", format: "uuid" },
            examYear: { type: "integer" },
            rollNumber: { type: "string" },
            schoolName: { type: "string" },
            schoolTownship: { type: "string" },
            schoolRegion: { type: "string" },
            myanmar: { type: "integer" },
            english: { type: "integer" },
            mathematics: { type: "integer" },
            physics: { type: "integer" },
            chemistry: { type: "integer" },
            biology: { type: "integer", nullable: true },
            totalScore: { type: "integer" },
            totalMarks: { type: "integer" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
            user: {
              type: "object",
              properties: {
                id: { type: "string", format: "uuid" },
                email: { type: "string", format: "email" },
                profile: {
                  type: "object",
                  nullable: true,
                  properties: {
                    nameEnglish: { type: "string" },
                    nameMyanmar: { type: "string" },
                  },
                },
              },
            },
          },
        },
        MatriculationStats: {
          type: "object",
          properties: {
            totalStudents: { type: "integer", example: 150 },
            averages: {
              type: "object",
              properties: {
                totalScore: { type: "integer", example: 450 },
                myanmar: { type: "integer", example: 75 },
                english: { type: "integer", example: 72 },
                mathematics: { type: "integer", example: 78 },
                physics: { type: "integer", example: 74 },
                chemistry: { type: "integer", example: 76 },
              },
            },
            highestScore: { type: "integer", example: 540 },
            lowestScore: { type: "integer", example: 380 },
            byRegion: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  region: { type: "string" },
                  count: { type: "integer" },
                  averageScore: { type: "integer" },
                },
              },
            },
          },
        },
      },
    },
    tags: [
      { name: "Health", description: "Health check endpoints" },
      { name: "Auth", description: "Authentication endpoints" },
      { name: "Users", description: "User management endpoints" },
      { name: "User Profile", description: "User profile endpoints" },
      { name: "Universities", description: "University management endpoints" },
      { name: "Programs", description: "Program management endpoints" },
      {
        name: "Program Requirements",
        description: "Program requirements endpoints",
      },
      {
        name: "Recommendations",
        description: "Program recommendation endpoints",
      },
      { name: "Interests", description: "Interest management endpoints" },
      {
        name: "User Interests",
        description: "User interests management endpoints",
      },
      {
        name: "Matriculation",
        description: "User matriculation result endpoints",
      },
      {
        name: "Matriculation Admin",
        description: "Admin matriculation management endpoints",
      },
      {
        name: "Upload",
        description: "File upload endpoints for MinIO storage",
      },
    ],
  },
  apis: ["./src/app.ts", "./src/modules/**/*.routes.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
