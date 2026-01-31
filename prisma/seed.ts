import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seedAdmin() {
  console.log("🌱 Seeding admin user...");

  const adminEmail = process.env.ADMIN_EMAIL || "admin@tu-recommend.local";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@123";

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log("  ⏭️  Admin user already exists, skipping...");
    return existingAdmin;
  }

  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(adminPassword, salt);

  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      password: hashedPassword,
      role: UserRole.ADMIN,
    },
  });

  console.log(`  ✅ Admin user created: ${admin.email}`);
  return admin;
}

async function seedUniversities() {
  console.log("🌱 Seeding universities...");

  const universities = [
    {
      name: "Technological University (Thanlyin)",
      nameMyanmar: "နည်းပညာတက္ကသိုလ် (သန်လျင်)",
      code: "TU-Thanlyin",
      location: "Thanlyin Township",
      region: "Yangon",
    },
    {
      name: "Technological University (Hmawbi)",
      nameMyanmar: "နည်းပညာတက္ကသိုလ် (မှော်ဘီ)",
      code: "TU-Hmawbi",
      location: "Hmawbi Township",
      region: "Yangon",
    },
    {
      name: "Technological University (Mandalay)",
      nameMyanmar: "နည်းပညာတက္ကသိုလ် (မန္တလေး)",
      code: "TU-Mandalay",
      location: "Mandalay",
      region: "Mandalay",
    },
    {
      name: "Technological University (Maubin)",
      nameMyanmar: "နည်းပညာတက္ကသိုလ် (မအူပင်)",
      code: "TU-Maubin",
      location: "Maubin Township",
      region: "Ayeyarwady",
    },
    {
      name: "Technological University (Monywa)",
      nameMyanmar: "နည်းပညာတက္ကသိုလ် (မုံရွာ)",
      code: "TU-Monywa",
      location: "Monywa",
      region: "Sagaing",
    },
    {
      name: "Technological University (Meiktila)",
      nameMyanmar: "နည်းပညာတက္ကသိုလ် (မိတ္ထီလာ)",
      code: "TU-Meiktila",
      location: "Meiktila",
      region: "Mandalay",
    },
    {
      name: "Technological University (Taunggyi)",
      nameMyanmar: "နည်းပညာတက္ကသိုလ် (တောင်ကြီး)",
      code: "TU-Taunggyi",
      location: "Taunggyi",
      region: "Shan",
    },
    {
      name: "Technological University (Pathein)",
      nameMyanmar: "နည်းပညာတက္ကသိုလ် (ပုသိမ်)",
      code: "TU-Pathein",
      location: "Pathein",
      region: "Ayeyarwady",
    },
    {
      name: "Technological University (Myitkyina)",
      nameMyanmar: "နည်းပညာတက္ကသိုလ် (မြစ်ကြီးနား)",
      code: "TU-Myitkyina",
      location: "Myitkyina",
      region: "Kachin",
    },
    {
      name: "Technological University (Hpa-An)",
      nameMyanmar: "နည်းပညာတက္ကသိုလ် (ဘားအံ)",
      code: "TU-Hpa-An",
      location: "Hpa-An",
      region: "Kayin",
    },
  ];

  const createdUniversities = [];

  for (const uni of universities) {
    const existing = await prisma.university.findFirst({
      where: { code: uni.code },
    });

    if (existing) {
      console.log(`  ⏭️  ${uni.name} already exists, skipping...`);
      createdUniversities.push(existing);
      continue;
    }

    const created = await prisma.university.create({
      data: uni,
    });
    console.log(`  ✅ Created: ${created.name}`);
    createdUniversities.push(created);
  }

  return createdUniversities;
}

async function seedPrograms(
  universities: { id: number; code: string | null }[],
) {
  console.log("🌱 Seeding programs...");

  // Program definitions with requirements
  const programDefinitions = [
    {
      name: "Electronic and Communication Engineering",
      nameMyanmar: "အီလက်ထရောနစ်နှင့် ဆက်သွယ်ရေးအင်ဂျင်နီယာ",
      code: "EC",
      description: "Study of electronic systems and communication technologies",
      minScore: 480,
      quota: 60,
      requirements: { mathematics: 70, physics: 65, english: 50 },
    },
    {
      name: "Electrical Power Engineering",
      nameMyanmar: "လျှပ်စစ်ဓာတ်အားအင်ဂျင်နီယာ",
      code: "EP",
      description:
        "Study of electrical power generation, transmission and distribution",
      minScore: 470,
      quota: 60,
      requirements: { mathematics: 65, physics: 65, english: 50 },
    },
    {
      name: "Mechanical Engineering",
      nameMyanmar: "စက်မှုအင်ဂျင်နီယာ",
      code: "ME",
      description: "Study of mechanical systems and manufacturing",
      minScore: 465,
      quota: 60,
      requirements: { mathematics: 65, physics: 60, english: 50 },
    },
    {
      name: "Civil Engineering",
      nameMyanmar: "ဆောက်လုပ်ရေးအင်ဂျင်နီယာ",
      code: "CE",
      description: "Study of infrastructure and construction",
      minScore: 460,
      quota: 80,
      requirements: { mathematics: 60, physics: 60, english: 50 },
    },
    {
      name: "Computer Engineering and Information Technology",
      nameMyanmar: "ကွန်ပျူတာအင်ဂျင်နီယာနှင့် သတင်းအချက်အလက်နည်းပညာ",
      code: "CEIT",
      description: "Study of computer systems and information technology",
      minScore: 485,
      quota: 50,
      requirements: { mathematics: 75, physics: 60, english: 55 },
    },
    {
      name: "Chemical Engineering",
      nameMyanmar: "ဓာတုအင်ဂျင်နီယာ",
      code: "ChE",
      description: "Study of chemical processes and manufacturing",
      minScore: 455,
      quota: 40,
      requirements: { mathematics: 60, chemistry: 70, physics: 55 },
    },
    {
      name: "Mining Engineering",
      nameMyanmar: "သတ္တုတွင်းအင်ဂျင်နီယာ",
      code: "MnE",
      description: "Study of mineral extraction and processing",
      minScore: 440,
      quota: 40,
      requirements: { mathematics: 55, physics: 55, chemistry: 55 },
    },
    {
      name: "Petroleum Engineering",
      nameMyanmar: "ရေနံအင်ဂျင်နီယာ",
      code: "PE",
      description: "Study of oil and gas exploration and production",
      minScore: 450,
      quota: 30,
      requirements: { mathematics: 60, physics: 60, chemistry: 60 },
    },
    {
      name: "Metallurgical Engineering",
      nameMyanmar: "သတ္တုဗေဒအင်ဂျင်နီယာ",
      code: "MetE",
      description: "Study of metals and materials processing",
      minScore: 445,
      quota: 30,
      requirements: { mathematics: 55, physics: 55, chemistry: 60 },
    },
    {
      name: "Textile Engineering",
      nameMyanmar: "အထည်အလိပ်အင်ဂျင်နီယာ",
      code: "TE",
      description: "Study of textile manufacturing and processing",
      minScore: 435,
      quota: 40,
      requirements: { mathematics: 50, physics: 50, chemistry: 55 },
    },
    {
      name: "Mechatronic Engineering",
      nameMyanmar: "စက်မှုလျှပ်စစ်အင်ဂျင်နီယာ",
      code: "MtE",
      description: "Study of integrated mechanical and electronic systems",
      minScore: 475,
      quota: 40,
      requirements: { mathematics: 70, physics: 65, english: 50 },
    },
    {
      name: "Architecture",
      nameMyanmar: "ဗိသုကာ",
      code: "Arch",
      description: "Study of building design and construction",
      minScore: 470,
      quota: 50,
      requirements: { mathematics: 60, physics: 55, english: 55 },
    },
  ];

  let totalCreated = 0;

  for (const university of universities) {
    console.log(`  📍 Processing: ${university.code}`);

    // Determine which programs this university offers based on its type
    // Major universities (Thanlyin, Mandalay) offer all programs
    // Others offer subset
    let programsToCreate = programDefinitions;

    const majorUniversities = ["TU-Thanlyin", "TU-Mandalay", "TU-Hmawbi"];
    if (!majorUniversities.includes(university.code || "")) {
      // Smaller universities offer fewer programs
      programsToCreate = programDefinitions.filter((p) =>
        ["EC", "EP", "ME", "CE", "CEIT", "ChE"].includes(p.code),
      );
    }

    for (const prog of programsToCreate) {
      // Check if program already exists for this university
      const existing = await prisma.program.findFirst({
        where: {
          universityId: university.id,
          code: prog.code,
        },
      });

      if (existing) {
        continue;
      }

      // Adjust minScore slightly for different universities
      const scoreAdjustment = majorUniversities.includes(university.code || "")
        ? 0
        : -20;

      const program = await prisma.program.create({
        data: {
          universityId: university.id,
          name: prog.name,
          nameMyanmar: prog.nameMyanmar,
          code: prog.code,
          description: prog.description,
          minScore: prog.minScore + scoreAdjustment,
          quota: prog.quota,
          requirements: {
            create: {
              mathematics: prog.requirements.mathematics,
              physics: prog.requirements.physics,
              chemistry: prog.requirements.chemistry,
              english: prog.requirements.english,
            },
          },
        },
      });

      totalCreated++;
    }
  }

  console.log(`  ✅ Created ${totalCreated} programs`);
}

async function seedInterests() {
  console.log("🌱 Seeding interests...");

  const interests = [
    "Electronics",
    "Programming",
    "Mathematics",
    "Physics",
    "Chemistry",
    "Construction",
    "Automotive",
    "Energy",
    "Manufacturing",
    "Design",
    "Research",
    "Robotics",
    "Artificial Intelligence",
    "Networking",
    "Oil & Gas",
    "Mining",
    "Architecture",
    "Textiles",
  ];

  for (const name of interests) {
    const existing = await prisma.interest.findUnique({
      where: { name },
    });

    if (!existing) {
      await prisma.interest.create({ data: { name } });
    }
  }

  console.log(`  ✅ Interests seeded`);
}

async function main() {
  console.log("🚀 Starting database seed...\n");

  try {
    await seedAdmin();
    const universities = await seedUniversities();
    await seedPrograms(universities);
    await seedInterests();

    console.log("\n✅ Database seeding completed successfully!");
    console.log("\n📋 Default Admin Credentials:");
    console.log(
      `   Email: ${process.env.ADMIN_EMAIL || "admin@tu-recommend.local"}`,
    );
    console.log(`   Password: ${process.env.ADMIN_PASSWORD || "Admin@123"}`);
    console.log("\n⚠️  Please change the admin password after first login!");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
