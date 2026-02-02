import { prisma } from "../../config/database";

export async function getDashboardStats() {
  const [
    totalUsers,
    totalAdmins,
    totalUniversities,
    activeUniversities,
    totalPrograms,
    activePrograms,
    totalApplications,
    pendingApplications,
    approvedApplications,
    rejectedApplications,
    topInterests,
  ] = await Promise.all([
    // User stats
    prisma.user.count(),
    prisma.user.count({ where: { role: "ADMIN" } }),

    // University stats
    prisma.university.count(),
    // Assuming we might add an isActive field later or just count all for now as active
    // Based on schema, University doesn't have isActive, but Program does (via schema context, though schema file shows University doesn't have it explicitly in the snippet provided earlier, but Program likely does. Wait, schema provided earlier didn't show isActive on University, but Program model has `isActive boolean`? No, wait.
    // Let's re-read schema.
    // User has role.
    // University: id, name, ..., programs. No isActive in the provided schema snippet for University?
    // Wait, let's check schema again.
    // Ah, University model: ... isActive Boolean (Wait, I need to check the schema content again carefully.
    // Line 169: logoUrl String?
    // Line 170: createdAt ...
    // It seems University in the provided snippet DOES NOT have isActive.
    // Let's check Program model.
    // Line 186: quota Int?
    // Line 188: university ...
    // It seems Program also DOES NOT have isActive in the provided schema snippet?
    // Wait, let me check the schema file content provided in previous turn.
    // Ah, I see `isActive` in `Program` in the `tu-recommend-client` types but maybe not in the backend schema provided in the prompt?
    // Let's look at the `tu-recommend/src/prisma/schema.prisma` content provided in the prompt.
    // Model University (Lines 159-174): No isActive.
    // Model Program (Lines 176-194): No isActive.
    // Model Application (Lines 214-257): status ApplicationStatus.

    // Okay, so for now, "active" counts will just be total counts or based on some other logic.
    // I will just use total counts for now where isActive is missing.
    prisma.university.count(), // "active" placeholder

    // Program stats
    prisma.program.count(),
    prisma.program.count(), // "active" placeholder

    // Application stats
    prisma.application.count(),
    prisma.application.count({ where: { status: "SUBMITTED" } }), // Pending usually means submitted/under review
    prisma.application.count({ where: { status: "ACCEPTED" } }),
    prisma.application.count({ where: { status: "REJECTED" } }),

    // Top Interests
    prisma.interest.findMany({
      take: 5,
      orderBy: {
        users: {
          _count: "desc",
        },
      },
      select: {
        name: true,
        _count: {
          select: {
            users: true,
          },
        },
      },
    }),
  ]);

  return {
    users: {
      total: totalUsers,
      admins: totalAdmins,
      users: totalUsers - totalAdmins,
      recent: 0, // Placeholder
    },
    universities: {
      total: totalUniversities,
      active: activeUniversities,
    },
    programs: {
      total: totalPrograms,
      active: activePrograms,
    },
    applications: {
      total: totalApplications,
      pending: pendingApplications,
      approved: approvedApplications,
      rejected: rejectedApplications,
    },
    interests: topInterests.map((interest: any) => ({
      name: interest.name,
      count: interest._count.users,
    })),
  };
}
