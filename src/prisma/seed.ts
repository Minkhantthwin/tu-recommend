import {
  PrismaClient,
  UserRole,
  Gender,
  Religion,
  MaritalStatus,
  Degree,
  ProgramStatus,
} from "@prisma/client";
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
      degree: Degree.BACHELOR,
      status: ProgramStatus.ACTIVE,
      minScore: 480,
      quota: 60,
      requirements: {
        mathematics: 70,
        physics: 65,
        english: 50,
        minTotalScore: 480,
      },
    },
    {
      name: "Electrical Power Engineering",
      nameMyanmar: "လျှပ်စစ်ဓာတ်အားအင်ဂျင်နီယာ",
      code: "EP",
      description:
        "Study of electrical power generation, transmission and distribution",
      degree: Degree.BACHELOR,
      status: ProgramStatus.ACTIVE,
      minScore: 470,
      quota: 60,
      requirements: {
        mathematics: 65,
        physics: 65,
        english: 50,
        minTotalScore: 470,
      },
    },
    {
      name: "Mechanical Engineering",
      nameMyanmar: "စက်မှုအင်ဂျင်နီယာ",
      code: "ME",
      description: "Study of mechanical systems and manufacturing",
      degree: Degree.BACHELOR,
      status: ProgramStatus.ACTIVE,
      minScore: 465,
      quota: 60,
      requirements: {
        mathematics: 65,
        physics: 60,
        english: 50,
        minTotalScore: 465,
      },
    },
    {
      name: "Civil Engineering",
      nameMyanmar: "ဆောက်လုပ်ရေးအင်ဂျင်နီယာ",
      code: "CE",
      description: "Study of infrastructure and construction",
      degree: Degree.BACHELOR,
      status: ProgramStatus.ACTIVE,
      minScore: 460,
      quota: 80,
      requirements: {
        mathematics: 60,
        physics: 60,
        english: 50,
        minTotalScore: 460,
      },
    },
    {
      name: "Computer Engineering and Information Technology",
      nameMyanmar: "ကွန်ပျူတာအင်ဂျင်နီယာနှင့် သတင်းအချက်အလက်နည်းပညာ",
      code: "CEIT",
      description: "Study of computer systems and information technology",
      degree: Degree.BACHELOR,
      status: ProgramStatus.ACTIVE,
      minScore: 485,
      quota: 50,
      requirements: {
        mathematics: 75,
        physics: 60,
        english: 55,
        minTotalScore: 485,
      },
    },
    {
      name: "Chemical Engineering",
      nameMyanmar: "ဓာတုအင်ဂျင်နီယာ",
      code: "ChE",
      description: "Study of chemical processes and manufacturing",
      degree: Degree.BACHELOR,
      status: ProgramStatus.ACTIVE,
      minScore: 455,
      quota: 40,
      requirements: {
        mathematics: 60,
        chemistry: 70,
        physics: 55,
        minTotalScore: 455,
      },
    },
    {
      name: "Mining Engineering",
      nameMyanmar: "သတ္တုတွင်းအင်ဂျင်နီယာ",
      code: "MnE",
      description: "Study of mineral extraction and processing",
      degree: Degree.BACHELOR,
      status: ProgramStatus.ACTIVE,
      minScore: 440,
      quota: 40,
      requirements: {
        mathematics: 55,
        physics: 55,
        chemistry: 55,
        minTotalScore: 440,
      },
    },
    {
      name: "Petroleum Engineering",
      nameMyanmar: "ရေနံအင်ဂျင်နီယာ",
      code: "PE",
      description: "Study of oil and gas exploration and production",
      degree: Degree.BACHELOR,
      status: ProgramStatus.ACTIVE,
      minScore: 450,
      quota: 30,
      requirements: {
        mathematics: 60,
        physics: 60,
        chemistry: 60,
        minTotalScore: 450,
      },
    },
    {
      name: "Metallurgical Engineering",
      nameMyanmar: "သတ္တုဗေဒအင်ဂျင်နီယာ",
      code: "MetE",
      description: "Study of metals and materials processing",
      degree: Degree.BACHELOR,
      status: ProgramStatus.ACTIVE,
      minScore: 445,
      quota: 30,
      requirements: {
        mathematics: 55,
        physics: 55,
        chemistry: 60,
        minTotalScore: 445,
      },
    },
    {
      name: "Textile Engineering",
      nameMyanmar: "အထည်အလိပ်အင်ဂျင်နီယာ",
      code: "TE",
      description: "Study of textile manufacturing and processing",
      degree: Degree.BACHELOR,
      status: ProgramStatus.ACTIVE,
      minScore: 435,
      quota: 40,
      requirements: {
        mathematics: 50,
        physics: 50,
        chemistry: 55,
        minTotalScore: 435,
      },
    },
    {
      name: "Mechatronic Engineering",
      nameMyanmar: "စက်မှုလျှပ်စစ်အင်ဂျင်နီယာ",
      code: "MtE",
      description: "Study of integrated mechanical and electronic systems",
      degree: Degree.BACHELOR,
      status: ProgramStatus.ACTIVE,
      minScore: 475,
      quota: 40,
      requirements: {
        mathematics: 70,
        physics: 65,
        english: 50,
        minTotalScore: 475,
      },
    },
    {
      name: "Architecture",
      nameMyanmar: "ဗိသုကာ",
      code: "Arch",
      description: "Study of building design and construction",
      degree: Degree.BACHELOR,
      status: ProgramStatus.ACTIVE,
      minScore: 470,
      quota: 50,
      requirements: {
        mathematics: 60,
        physics: 55,
        english: 55,
        minTotalScore: 470,
      },
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
          degree: prog.degree,
          status: prog.status,
          minScore: prog.minScore + scoreAdjustment,
          quota: prog.quota,
          requirements: {
            create: {
              mathematics: prog.requirements.mathematics,
              physics: prog.requirements.physics,
              chemistry: prog.requirements.chemistry,
              english: prog.requirements.english,
              minTotalScore: prog.requirements.minTotalScore + scoreAdjustment,
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

async function seedTestUsers() {
  console.log("🌱 Seeding test users...");

  const testUsers = [
    {
      email: "user1@test.com",
      profile: {
        nameMyanmar: "မောင်မောင်",
        nameEnglish: "Maung Maung",
        nrc: "12/MaYaKa(N)123456",
        gender: Gender.MALE,
        religion: Religion.BUDDHIST,
        ethnicity: "Bamar",
        permanentTownship: "Mingalar Taung Nyunt",
        permanentRegion: "Yangon",
      },
      matric: {
        examYear: 2025,
        rollNumber: "12345",
        schoolName: "BEHS No. 1 Yangon",
        schoolTownship: "Mingalar Taung Nyunt",
        schoolRegion: "Yangon",
        myanmar: 85,
        english: 78,
        mathematics: 92,
        physics: 88,
        chemistry: 82,
        biology: 80,
      },
      interests: ["Programming", "Mathematics", "Physics"],
    },
    {
      email: "user2@test.com",
      profile: {
        nameMyanmar: "သူရိန်အောင်",
        nameEnglish: "Thurain Aung",
        nrc: "12/OuKaMa(N)234567",
        gender: Gender.MALE,
        religion: Religion.BUDDHIST,
        ethnicity: "Bamar",
        permanentTownship: "Hlaing",
        permanentRegion: "Yangon",
      },
      matric: {
        examYear: 2025,
        rollNumber: "23456",
        schoolName: "BEHS No. 2 Yangon",
        schoolTownship: "Hlaing",
        schoolRegion: "Yangon",
        myanmar: 80,
        english: 82,
        mathematics: 88,
        physics: 85,
        chemistry: 84,
        biology: null,
      },
      interests: ["Electronics", "Robotics", "Physics"],
    },
    {
      email: "user3@test.com",
      profile: {
        nameMyanmar: "ဆုဆုခိုင်",
        nameEnglish: "Su Su Khine",
        nrc: "12/DaGaYa(N)345678",
        gender: Gender.FEMALE,
        religion: Religion.BUDDHIST,
        ethnicity: "Bamar",
        permanentTownship: "Dagon",
        permanentRegion: "Yangon",
      },
      matric: {
        examYear: 2025,
        rollNumber: "34567",
        schoolName: "BEHS No. 3 Yangon",
        schoolTownship: "Dagon",
        schoolRegion: "Yangon",
        myanmar: 88,
        english: 85,
        mathematics: 90,
        physics: 87,
        chemistry: 89,
        biology: 86,
      },
      interests: ["Chemistry", "Research", "Mathematics"],
    },
    {
      email: "user4@test.com",
      profile: {
        nameMyanmar: "အောင်ကို",
        nameEnglish: "Aung Ko",
        nrc: "2/ThaSa(N)456789",
        gender: Gender.MALE,
        religion: Religion.BUDDHIST,
        ethnicity: "Bamar",
        permanentTownship: "Thabeikkyin",
        permanentRegion: "Mandalay",
      },
      matric: {
        examYear: 2025,
        rollNumber: "45678",
        schoolName: "BEHS No. 1 Mandalay",
        schoolTownship: "Thabeikkyin",
        schoolRegion: "Mandalay",
        myanmar: 75,
        english: 70,
        mathematics: 85,
        physics: 80,
        chemistry: 78,
        biology: null,
      },
      interests: ["Automotive", "Manufacturing", "Design"],
    },
    {
      email: "user5@test.com",
      profile: {
        nameMyanmar: "နီလာထွန်း",
        nameEnglish: "Nila Htun",
        nrc: "12/KaMaYa(N)567890",
        gender: Gender.FEMALE,
        religion: Religion.BUDDHIST,
        ethnicity: "Bamar",
        permanentTownship: "Kamayut",
        permanentRegion: "Yangon",
      },
      matric: {
        examYear: 2025,
        rollNumber: "56789",
        schoolName: "BEHS No. 4 Yangon",
        schoolTownship: "Kamayut",
        schoolRegion: "Yangon",
        myanmar: 90,
        english: 88,
        mathematics: 95,
        physics: 92,
        chemistry: 90,
        biology: 88,
      },
      interests: [
        "Artificial Intelligence",
        "Programming",
        "Mathematics",
        "Research",
      ],
    },
    {
      email: "user6@test.com",
      profile: {
        nameMyanmar: "ကျော်စိုးမောင်",
        nameEnglish: "Kyaw Soe Maung",
        nrc: "12/YaKaNa(N)678901",
        gender: Gender.MALE,
        religion: Religion.CHRISTIAN,
        ethnicity: "Bamar",
        permanentTownship: "Yankin",
        permanentRegion: "Yangon",
      },
      matric: {
        examYear: 2025,
        rollNumber: "67890",
        schoolName: "BEHS No. 5 Yangon",
        schoolTownship: "Yankin",
        schoolRegion: "Yangon",
        myanmar: 82,
        english: 80,
        mathematics: 78,
        physics: 75,
        chemistry: 80,
        biology: null,
      },
      interests: ["Construction", "Design", "Architecture"],
    },
    {
      email: "user7@test.com",
      profile: {
        nameMyanmar: "ဝင်းမြင့်",
        nameEnglish: "Win Myint",
        nrc: "5/MaMaNa(N)789012",
        gender: Gender.MALE,
        religion: Religion.BUDDHIST,
        ethnicity: "Bamar",
        permanentTownship: "Mawlamyine",
        permanentRegion: "Mon",
      },
      matric: {
        examYear: 2025,
        rollNumber: "78901",
        schoolName: "BEHS No. 1 Mawlamyine",
        schoolTownship: "Mawlamyine",
        schoolRegion: "Mon",
        myanmar: 78,
        english: 75,
        mathematics: 82,
        physics: 79,
        chemistry: 76,
        biology: 74,
      },
      interests: ["Energy", "Physics", "Oil & Gas"],
    },
    {
      email: "user8@test.com",
      profile: {
        nameMyanmar: "ခင်မြတ်မွန်",
        nameEnglish: "Khin Myat Mon",
        nrc: "12/LaThaNa(N)890123",
        gender: Gender.FEMALE,
        religion: Religion.BUDDHIST,
        ethnicity: "Bamar",
        permanentTownship: "Latha",
        permanentRegion: "Yangon",
      },
      matric: {
        examYear: 2025,
        rollNumber: "89012",
        schoolName: "BEHS No. 6 Yangon",
        schoolTownship: "Latha",
        schoolRegion: "Yangon",
        myanmar: 86,
        english: 84,
        mathematics: 87,
        physics: 83,
        chemistry: 85,
        biology: 82,
      },
      interests: ["Textiles", "Chemistry", "Manufacturing"],
    },
    {
      email: "user9@test.com",
      profile: {
        nameMyanmar: "ဇော်မင်းထွန်း",
        nameEnglish: "Zaw Min Htun",
        nrc: "7/YaMaTha(N)901234",
        gender: Gender.MALE,
        religion: Religion.BUDDHIST,
        ethnicity: "Bamar",
        permanentTownship: "Yamanhin",
        permanentRegion: "Shan",
      },
      matric: {
        examYear: 2025,
        rollNumber: "90123",
        schoolName: "BEHS No. 1 Taunggyi",
        schoolTownship: "Yamanhin",
        schoolRegion: "Shan",
        myanmar: 83,
        english: 78,
        mathematics: 86,
        physics: 84,
        chemistry: 81,
        biology: null,
      },
      interests: ["Mining", "Engineering", "Research"],
    },
    {
      email: "user10@test.com",
      profile: {
        nameMyanmar: "စန္ဒီခိုင်",
        nameEnglish: "Sandy Khine",
        nrc: "12/BaHaNa(N)012345",
        gender: Gender.FEMALE,
        religion: Religion.BUDDHIST,
        ethnicity: "Bamar",
        permanentTownship: "Bahan",
        permanentRegion: "Yangon",
      },
      matric: {
        examYear: 2025,
        rollNumber: "01234",
        schoolName: "BEHS No. 7 Yangon",
        schoolTownship: "Bahan",
        schoolRegion: "Yangon",
        myanmar: 91,
        english: 89,
        mathematics: 93,
        physics: 90,
        chemistry: 88,
        biology: 87,
      },
      interests: ["Networking", "Programming", "Electronics", "Robotics"],
    },
  ];

  const password = "Password@123";
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);

  let createdCount = 0;

  for (const userData of testUsers) {
    const existing = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existing) {
      console.log(`  ⏭️  ${userData.email} already exists, skipping...`);
      continue;
    }

    // Calculate total score
    const totalScore =
      userData.matric.myanmar +
      userData.matric.english +
      userData.matric.mathematics +
      userData.matric.physics +
      userData.matric.chemistry +
      (userData.matric.biology || 0);

    // Create user with profile and matriculation result
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        password: hashedPassword,
        role: UserRole.USER,
        profile: {
          create: {
            nameMyanmar: userData.profile.nameMyanmar,
            nameEnglish: userData.profile.nameEnglish,
            nrc: userData.profile.nrc,
            dateOfBirth: new Date("2007-01-01"), // Birth year ~2007 for 2025 matric
            gender: userData.profile.gender,
            religion: userData.profile.religion,
            ethnicity: userData.profile.ethnicity,
            nationality: "Myanmar",
            maritalStatus: MaritalStatus.SINGLE,
            phone: "09123456789",
            permanentAddress: `No. 123, ${userData.profile.permanentTownship}`,
            permanentTownship: userData.profile.permanentTownship,
            permanentRegion: userData.profile.permanentRegion,
            fatherName: "U Kyaw Kyaw",
            motherName: "Daw Aye Aye",
          },
        },
        matriculation: {
          create: {
            examYear: userData.matric.examYear,
            rollNumber: userData.matric.rollNumber,
            schoolName: userData.matric.schoolName,
            schoolTownship: userData.matric.schoolTownship,
            schoolRegion: userData.matric.schoolRegion,
            myanmar: userData.matric.myanmar,
            english: userData.matric.english,
            mathematics: userData.matric.mathematics,
            physics: userData.matric.physics,
            chemistry: userData.matric.chemistry,
            biology: userData.matric.biology,
            totalScore: totalScore,
            totalMarks: 600,
          },
        },
      },
    });

    // Add interests
    for (const interestName of userData.interests) {
      const interest = await prisma.interest.findUnique({
        where: { name: interestName },
      });

      if (interest) {
        await prisma.userInterest.create({
          data: {
            userId: user.id,
            interestId: interest.id,
          },
        });
      }
    }

    console.log(`  ✅ Created user: ${userData.email}`);
    createdCount++;
  }

  console.log(`  ✅ Created ${createdCount} test users`);
}

async function main() {
  console.log("🚀 Starting database seed...\n");

  try {
    await seedAdmin();
    const universities = await seedUniversities();
    await seedPrograms(universities);
    await seedInterests();
    await seedTestUsers();

    console.log("\n✅ Database seeding completed successfully!");
    console.log("\n📋 Default Admin Credentials:");
    console.log(
      `   Email: ${process.env.ADMIN_EMAIL || "admin@tu-recommend.local"}`,
    );
    console.log(`   Password: ${process.env.ADMIN_PASSWORD || "Admin@123"}`);
    console.log("\n📋 Test User Credentials:");
    console.log(`   Email: user1@test.com - user10@test.com`);
    console.log(`   Password: Password@123`);
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
