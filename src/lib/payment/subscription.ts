import prisma from '#/db'
import { createServerFn } from '@tanstack/react-start'

export type SubscriptionTier = 'FREE' | 'PRO'
export type SubscriptionStatus = 'ACTIVE' | 'CANCELLED' | 'EXPIRED'

export interface UserLimits {
  tier: SubscriptionTier
  repositories: {
    current: number
    limit: number | null
    canAdd: boolean
  }
  reviews: {
    [repositoryId: string]: {
      current: number
      limit: number | null
      canAdd: boolean
    }
  }
}

const TIER_LIMITS = {
  FREE: {
    repositories: 5,
    reviewsPerRepo: 5,
  },
  PRO: {
    repositories: null,
    reviewsPerRepo: null,
  },
} as const

export const getUserTier = createServerFn()
  .inputValidator((data: { userId: string }) => data)
  .handler(async ({ data: { userId } }) => {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        subscriptionTier: true,
      },
    })
    return (user?.subscriptionTier as SubscriptionTier) || 'FREE'
  })

const getUserUsage = async (userId: string) => {
  let usage = await prisma.userUsage.findUnique({
    where: { userId },
  })

  if (!usage) {
    usage = await prisma.userUsage.create({
      data: {
        userId,
        repositoryCount: 0,
        reviewCounts: {},
      },
    })
  }
  return usage
}

export const canConnectRepository = createServerFn()
  .inputValidator((data: { userId: string }) => data)
  .handler(async ({ data: { userId } }) => {
    const tier = await getUserTier({ data: { userId } })
    if (tier === 'PRO') {
      return true
    }
    const usage = await getUserUsage(userId)
    const limit = TIER_LIMITS.FREE.repositories
    return usage.repositoryCount < limit
  })

export const canCreateReview = createServerFn()
  .inputValidator((data: { userId: string; repositoryId: string }) => data)
  .handler(async ({ data: { userId, repositoryId } }) => {
    const tier = await getUserTier({ data: { userId } })

    if (tier === 'PRO') {
      return true
    }

    const usage = await getUserUsage(userId)
    const reviewCounts = usage.reviewCounts as Record<string, number>
    const currentCount = reviewCounts[repositoryId] || 0
    const limit = TIER_LIMITS.FREE.reviewsPerRepo

    return currentCount < limit
  })

//   Increasing repo count when user connects
export const incrementRepositoryCount = createServerFn()
  .inputValidator((data: { userId: string }) => data)
  .handler(async ({ data: { userId } }) => {
    await prisma.userUsage.upsert({
      where: { userId },
      create: {
        userId,
        reviewCounts: {},
        repositoryCount: 1,
      },
      update: {
        repositoryCount: {
          increment: 1,
        },
      },
    })
  })

export const decrementReositoryCount = createServerFn()
  .inputValidator((data: { userId: string }) => data)
  .handler(async ({ data: { userId } }) => {
    const usage = await getUserUsage(userId)
    await prisma.userUsage.update({
      where: { userId },
      data: {
        repositoryCount: Math.max(0, usage.repositoryCount - 1),
      },
    })
  })

export const incrementReviewCount = createServerFn()
  .inputValidator((data: { userId: string; repositoryId: string }) => data)
  .handler(async ({ data: { userId, repositoryId } }) => {
    const usage = await getUserUsage(userId)
    const reviewCounts = usage.reviewCounts as Record<string, number>
    reviewCounts[repositoryId] = (reviewCounts[repositoryId] || 0) + 1

    await prisma.userUsage.update({
      where: { userId },
      data: {
        reviewCounts,
      },
    })
  })

export const getRemainingLimits = createServerFn()
  .inputValidator((data: { userId: string }) => data)
  .handler(async ({ data: { userId } }) => {
    const tier = await getUserTier({ data: { userId } })
    const usage = await getUserUsage(userId)
    const reviewCounts = usage.reviewCounts as Record<string, number>

    const limits: UserLimits = {
      tier,
      repositories: {
        current: usage.repositoryCount,
        limit: tier === 'PRO' ? null : TIER_LIMITS.FREE.repositories,
        canAdd:
          tier === 'PRO' ||
          usage.repositoryCount < TIER_LIMITS.FREE.repositories,
      },
      reviews: {},
    }

    const repositories = await prisma.repository.findMany({
      where: { userId },
      select: { id: true },
    })

    for (const repo of repositories) {
      const currentCount = reviewCounts[repo.id] || 0
      limits.reviews[repo.id] = {
        current: currentCount,
        limit: tier === 'PRO' ? null : TIER_LIMITS.FREE.reviewsPerRepo,
        canAdd:
          tier === 'PRO' || currentCount < TIER_LIMITS.FREE.reviewsPerRepo,
      }
    }
    return limits
  })

export async function updateUserTier(
  userId: string,
  tier: SubscriptionTier,
  status: SubscriptionStatus,
  polarSubscriptionId?: string,
): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionTier: tier,
      subScriptionStatus: status,
    //   polarSubscriptionId,
    },
  })
}
