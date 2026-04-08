import prisma from '#/db'

export type SubscriptionTier = 'FREE' | 'PRO'
export type SubscriptionStatus = 'ACTIVE' | 'CANCELLED' | 'EXPIRED'

export interface UserLimits {
  tier: SubscriptionTier
  repositories: { current: number; limit: number | null; canAdd: boolean }
  reviews: { [repositoryId: string]: { current: number; limit: number | null; canAdd: boolean } }
}

export const TIER_LIMITS = {
  FREE: { repositories: 5, reviewsPerRepo: 5 },
  PRO: { repositories: null, reviewsPerRepo: null },
} as const

export const getUserTier = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { subscriptionTier: true },
  })
  return (user?.subscriptionTier as SubscriptionTier) || 'FREE'
}

export const getUserUsage = async (userId: string) => {
  let usage = await prisma.userUsage.findUnique({ where: { userId } })
  if (!usage) {
    usage = await prisma.userUsage.create({
      data: { userId, repositoryCount: 0, reviewCounts: {} },
    })
  }
  return usage
}

export const getRemainingLimits = async (userId: string) => {
  const tier = await getUserTier(userId)
  const usage = await getUserUsage(userId)
  const reviewCounts = usage.reviewCounts as Record<string, number>

  const limits: UserLimits = {
    tier,
    repositories: {
      current: usage.repositoryCount,
      limit: tier === 'PRO' ? null : TIER_LIMITS.FREE.repositories,
      canAdd: tier === 'PRO' || usage.repositoryCount < TIER_LIMITS.FREE.repositories,
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
      canAdd: tier === 'PRO' || currentCount < TIER_LIMITS.FREE.reviewsPerRepo,
    }
  }
  return limits
}

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
      polarSubscriptionId,
    },
  })
}

export async function updatePolarCustomerId(
  userId: string,
  polarCustomerId: string,
): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { polarCustomerId: polarCustomerId },
  })
}