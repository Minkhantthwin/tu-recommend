import { prisma } from "../../config/database";
import { ApiError } from "../../common/utils/api-error";
import {
  CreateInterestDto,
  UpdateInterestDto,
  AddUserInterestDto,
  AddMultipleUserInterestsDto,
} from "./interest.types";

// ==================== Interest Services ====================

export async function getAllInterests() {
  const interests = await prisma.interest.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { users: true },
      },
    },
  });

  return interests;
}

export async function getInterestById(id: number) {
  const interest = await prisma.interest.findUnique({
    where: { id },
    include: {
      _count: {
        select: { users: true },
      },
    },
  });

  if (!interest) {
    throw ApiError.notFound("Interest not found");
  }

  return interest;
}

export async function createInterest(data: CreateInterestDto) {
  // Check if interest with same name exists
  const existing = await prisma.interest.findUnique({
    where: { name: data.name },
  });

  if (existing) {
    throw ApiError.badRequest("Interest with this name already exists");
  }

  const interest = await prisma.interest.create({
    data: {
      name: data.name,
    },
  });

  return interest;
}

export async function updateInterest(id: number, data: UpdateInterestDto) {
  // Check if interest exists
  const existing = await prisma.interest.findUnique({
    where: { id },
  });

  if (!existing) {
    throw ApiError.notFound("Interest not found");
  }

  // Check if new name conflicts with another interest
  if (data.name && data.name !== existing.name) {
    const nameConflict = await prisma.interest.findUnique({
      where: { name: data.name },
    });

    if (nameConflict) {
      throw ApiError.badRequest("Interest with this name already exists");
    }
  }

  const interest = await prisma.interest.update({
    where: { id },
    data,
  });

  return interest;
}

export async function deleteInterest(id: number) {
  // Check if interest exists
  const existing = await prisma.interest.findUnique({
    where: { id },
    include: {
      _count: {
        select: { users: true },
      },
    },
  });

  if (!existing) {
    throw ApiError.notFound("Interest not found");
  }

  // Check if interest is being used by any users
  if (existing._count.users > 0) {
    throw ApiError.badRequest(
      `Cannot delete interest with ${existing._count.users} user(s) associated`,
    );
  }

  await prisma.interest.delete({
    where: { id },
  });
}

// ==================== User Interest Services ====================

export async function getUserInterests(userId: string) {
  const userInterests = await prisma.userInterest.findMany({
    where: { userId },
    include: {
      interest: true,
    },
    orderBy: {
      interest: {
        name: "asc",
      },
    },
  });

  return userInterests.map((ui) => ui.interest);
}

export async function addUserInterest(
  userId: string,
  data: AddUserInterestDto,
) {
  // Check if interest exists
  const interest = await prisma.interest.findUnique({
    where: { id: data.interestId },
  });

  if (!interest) {
    throw ApiError.notFound("Interest not found");
  }

  // Check if user already has this interest
  const existing = await prisma.userInterest.findUnique({
    where: {
      userId_interestId: {
        userId,
        interestId: data.interestId,
      },
    },
  });

  if (existing) {
    throw ApiError.badRequest("User already has this interest");
  }

  const userInterest = await prisma.userInterest.create({
    data: {
      userId,
      interestId: data.interestId,
    },
    include: {
      interest: true,
    },
  });

  return userInterest.interest;
}

export async function addMultipleUserInterests(
  userId: string,
  data: AddMultipleUserInterestsDto,
) {
  // Check if all interests exist
  const interests = await prisma.interest.findMany({
    where: {
      id: { in: data.interestIds },
    },
  });

  if (interests.length !== data.interestIds.length) {
    throw ApiError.badRequest("One or more interests not found");
  }

  // Get existing user interests
  const existingInterests = await prisma.userInterest.findMany({
    where: {
      userId,
      interestId: { in: data.interestIds },
    },
    select: { interestId: true },
  });

  const existingIds = existingInterests.map((ui) => ui.interestId);
  const newInterestIds = data.interestIds.filter(
    (id) => !existingIds.includes(id),
  );

  if (newInterestIds.length === 0) {
    throw ApiError.badRequest("User already has all the specified interests");
  }

  // Create new user interests
  await prisma.userInterest.createMany({
    data: newInterestIds.map((interestId) => ({
      userId,
      interestId,
    })),
    skipDuplicates: true,
  });

  // Return all user interests
  return getUserInterests(userId);
}

export async function removeUserInterest(userId: string, interestId: number) {
  // Check if user has this interest
  const existing = await prisma.userInterest.findUnique({
    where: {
      userId_interestId: {
        userId,
        interestId,
      },
    },
  });

  if (!existing) {
    throw ApiError.notFound("User does not have this interest");
  }

  await prisma.userInterest.delete({
    where: {
      userId_interestId: {
        userId,
        interestId,
      },
    },
  });
}

export async function replaceUserInterests(
  userId: string,
  interestIds: number[],
) {
  // Check if all interests exist
  if (interestIds.length > 0) {
    const interests = await prisma.interest.findMany({
      where: {
        id: { in: interestIds },
      },
    });

    if (interests.length !== interestIds.length) {
      throw ApiError.badRequest("One or more interests not found");
    }
  }

  // Delete all existing user interests
  await prisma.userInterest.deleteMany({
    where: { userId },
  });

  // Create new user interests
  if (interestIds.length > 0) {
    await prisma.userInterest.createMany({
      data: interestIds.map((interestId) => ({
        userId,
        interestId,
      })),
    });
  }

  // Return all user interests
  return getUserInterests(userId);
}
