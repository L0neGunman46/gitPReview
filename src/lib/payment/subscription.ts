import { createServerFn } from '@tanstack/react-start'
import prisma from '#/db'
import { getUserTier, getUserUsage, TIER_LIMITS } from './subscription-server'

export const canConnectRepository = createServerFn()
  .inputValidator((data: { userId: string }) => data)
  .handler(async ({ data: { userId } }) => {
    const tier = await getUserTier(userId)
    if (tier === 'PRO') return true
    
    const usage = await getUserUsage(userId)
    const limit = TIER_LIMITS.FREE.repositories
    return usage.repositoryCount < limit
  })

export const canCreateReview = createServerFn()
  .inputValidator((data: { userId: string; repositoryId: string }) => data)
  .handler(async ({ data: { userId, repositoryId } }) => {
    const tier = await getUserTier(userId)
    if (tier === 'PRO') return true

    const usage = await getUserUsage(userId)
    const reviewCounts = usage.reviewCounts as Record<string, number>
    const currentCount = reviewCounts[repositoryId] || 0
    const limit = TIER_LIMITS.FREE.reviewsPerRepo

    return currentCount < limit
  })

export const incrementRepositoryCount = createServerFn()
  .inputValidator((data: { userId: string }) => data)
  .handler(async ({ data: { userId } }) => {
    await prisma.userUsage.upsert({
      where: { userId },
      create: { userId, reviewCounts: {}, repositoryCount: 1 },
      update: { repositoryCount: { increment: 1 } },
    })
  })

export const decrementReositoryCount = createServerFn()
  .inputValidator((data: { userId: string }) => data)
  .handler(async ({ data: { userId } }) => {
    const usage = await getUserUsage(userId)
    await prisma.userUsage.update({
      where: { userId },
      data: { repositoryCount: Math.max(0, usage.repositoryCount - 1) },
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
      data: { reviewCounts },
    })
  })