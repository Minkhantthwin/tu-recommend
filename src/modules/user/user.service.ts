import { prisma } from '../../config/database';
import { ApiError } from '../../common/utils/api-error';
import { CreateUserDto, UpdateUserDto, CreateUserProfileDto, UpdateUserProfileDto } from './user.types';

// User select fields (without password)
const userSelect = {
  id: true,
  email: true,
  createdAt: true,
  updatedAt: true,
};

const userWithProfileSelect = {
  ...userSelect,
  profile: true,
};

const userFullSelect = {
  ...userSelect,
  profile: true,
  matriculation: true,
  interests: {
    include: {
      interest: true,
    },
  },
};

export async function getAllUsers() {
  return prisma.user.findMany({
    select: userSelect,
  });
}

export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: userFullSelect,
  });

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  return user;
}

export async function createUser(data: CreateUserDto) {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw ApiError.conflict('User with this email already exists');
  }

  // TODO: Hash password before storing
  const user = await prisma.user.create({
    data: {
      email: data.email,
      password: data.password, // Remember to hash this!
    },
    select: userSelect,
  });

  return user;
}

export async function updateUser(id: string, data: UpdateUserDto) {
  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  if (data.email && data.email !== user.email) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existingUser) {
      throw ApiError.conflict('User with this email already exists');
    }
  }

  return prisma.user.update({
    where: { id },
    data,
    select: userSelect,
  });
}

export async function deleteUser(id: string) {
  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  await prisma.user.delete({ where: { id } });
}

// User Profile Services
export async function getUserProfile(userId: string) {
  const profile = await prisma.userProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    throw ApiError.notFound('User profile not found');
  }

  return profile;
}

export async function createUserProfile(userId: string, data: CreateUserProfileDto) {
  // Check if user exists
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  // Check if profile already exists
  const existingProfile = await prisma.userProfile.findUnique({
    where: { userId },
  });
  if (existingProfile) {
    throw ApiError.conflict('User profile already exists');
  }

  // Check if NRC is already used
  const existingNrc = await prisma.userProfile.findUnique({
    where: { nrc: data.nrc },
  });
  if (existingNrc) {
    throw ApiError.conflict('NRC is already registered');
  }

  return prisma.userProfile.create({
    data: {
      userId,
      nameMyanmar: data.nameMyanmar,
      nameEnglish: data.nameEnglish,
      nrc: data.nrc,
      dateOfBirth: new Date(data.dateOfBirth),
      gender: data.gender,
      religion: data.religion,
      ethnicity: data.ethnicity,
      nationality: data.nationality || 'Myanmar',
      maritalStatus: data.maritalStatus || 'SINGLE',
      phone: data.phone,
      alternatePhone: data.alternatePhone,
      permanentAddress: data.permanentAddress,
      permanentTownship: data.permanentTownship,
      permanentRegion: data.permanentRegion,
      currentAddress: data.currentAddress,
      currentTownship: data.currentTownship,
      currentRegion: data.currentRegion,
      fatherName: data.fatherName,
      fatherNrc: data.fatherNrc,
      fatherOccupation: data.fatherOccupation,
      fatherPhone: data.fatherPhone,
      motherName: data.motherName,
      motherNrc: data.motherNrc,
      motherOccupation: data.motherOccupation,
      motherPhone: data.motherPhone,
      guardianName: data.guardianName,
      guardianRelation: data.guardianRelation,
      guardianPhone: data.guardianPhone,
      guardianAddress: data.guardianAddress,
      photoUrl: data.photoUrl,
    },
  });
}

export async function updateUserProfile(userId: string, data: UpdateUserProfileDto) {
  const profile = await prisma.userProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    throw ApiError.notFound('User profile not found');
  }

  // Check if NRC is being changed and if it's already used
  if (data.nrc && data.nrc !== profile.nrc) {
    const existingNrc = await prisma.userProfile.findUnique({
      where: { nrc: data.nrc },
    });
    if (existingNrc) {
      throw ApiError.conflict('NRC is already registered');
    }
  }

  const updateData: any = { ...data };
  if (data.dateOfBirth) {
    updateData.dateOfBirth = new Date(data.dateOfBirth);
  }

  return prisma.userProfile.update({
    where: { userId },
    data: updateData,
  });
}

export async function deleteUserProfile(userId: string) {
  const profile = await prisma.userProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    throw ApiError.notFound('User profile not found');
  }

  await prisma.userProfile.delete({ where: { userId } });
}
