import { auth } from '../auth'
import { getRemainingLimits, updateUserTier } from './subscription-server'
import { getRequestHeaders } from '@tanstack/react-start/server'
import prisma from '#/db'
import { customer } from '../auth-client'
import { createServerFn } from '@tanstack/react-start'

export interface SubscriptionData {
  user: {
    id: string
    name: string
    email: string
    subscriptionTier: string
    subscriptionStatus: string | null
    polarCustomerId: string | null
    polarSubscriptionId: string | null
  } | null
  limits: {
    tier: 'FREE' | 'PRO'
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
  } | null
}

export const getSubscriptionData = createServerFn().handler(
  async (): Promise<SubscriptionData> => {
    const headers = await getRequestHeaders()
    const session = await auth.api.getSession({
      headers,
    })
    if (!session?.user) {
      return { user: null, limits: null }
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user) {
      return { user: null, limits: null }
    }

    const limits = await getRemainingLimits(user.id)

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        subscriptionTier: user.subscriptionTier || 'FREE',
        subscriptionStatus: user.subscriptionStatus || null,
        polarCustomerId: user.polarCustomerId || null,
        polarSubscriptionId: user.polarSubscriptionId,
      },
      limits,
    }
  },
)

export const syncSubscriptionStatus = createServerFn().handler(async () => {
  const headers = await getRequestHeaders()
  const session = await auth.api.getSession({
    headers,
  })

  if (!session?.user) {
    throw new Error('Not authenticated')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  })

  if (!user || !user.polarCustomerId) {
    return { success: false, message: 'No Polar customer ID found' }
  }

  try {
    // Fetch subscriptions from Polar
    const result = await customer.subscriptions.list({
      customerId: user.polarCustomerId,
    })

    const subscriptions = result.result?.items || []

    // Find the most relevant subscription (active or most recent)
    const activeSub = subscriptions.find((sub: any) => sub.status === 'active')
    const latestSub = subscriptions[0] // Assuming API returns sorted or we should sort

    if (activeSub) {
      await updateUserTier(user.id, 'PRO', 'ACTIVE', activeSub.id)
      return { success: true, status: 'ACTIVE' }
    } else if (latestSub) {
      // If latest is canceled/expired
      const status = latestSub.status === 'canceled' ? 'CANCELLED' : 'EXPIRED'
      // Only downgrade if we are sure it's not active
      if (latestSub.status !== 'active') {
        await updateUserTier(user.id, 'FREE', status, latestSub.id)
      }
      return { success: true, status }
    }

    return { success: true, status: 'NO_SUBSCRIPTION' }
  } catch (error) {
    console.error('Failed to sync subscription:', error)
    return { success: false, error: 'Failed to sync with Polar' }
  }
})
