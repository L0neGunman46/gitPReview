import prisma from '#/db'
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { polar, checkout, portal, usage, webhooks } from '@polar-sh/better-auth'
import { Polar } from '@polar-sh/sdk'
import {
  updatePolarCustomerId,
  updateUserTier,
} from './payment/subscription-server'

const polarClient = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN,
  // Use 'sandbox' if you're using the Polar Sandbox environment
  // Remember that access tokens, products, etc. are completely separated between environments.
  // Access tokens obtained in Production are for instance not usable in the Sandbox environment.
  server: (process.env.POLAR_ENV as 'sandbox' | 'production') || 'sandbox',
})

export const auth = betterAuth({
  //...your config

  plugins: [
    tanstackStartCookies(),
    polar({
      client: polarClient,
      createCustomerOnSignUp: true,
      use: [
        checkout({
          products: [
            {
              productId: process.env.POLAR_PRODUCT_ID!,
              slug: 'gitpreview', // Custom slug for easy reference in Checkout URL, e.g. /checkout/pro
            },
          ],
          successUrl:
            process.env.NEXT_PUBLIC_APP_BASE_URL +
            '/dashboard/subscription?success=true',
          authenticatedUsersOnly: true,
        }),
        portal({
          returnUrl:
            process.env.NEXT_PUBLIC_APP_BASE_URL || 'http://localhost:3000',
        }),
        usage(),
        webhooks({
          secret: process.env.POLAR_WEBHOOK_SECRET!,
          onSubscriptionActive: async (payload) => {
            const customerId = payload.data.customerId

            const user = await prisma.user.findUnique({
              where: {
                polarCustomerId: customerId,
              },
            })

            if (user) {
              await updateUserTier(user.id, 'PRO', 'ACTIVE', payload.data.id)
            }
          },
          onSubscriptionCanceled: async (payload) => {
            const customerId = payload.data.customerId

            const user = await prisma.user.findUnique({
              where: {
                polarCustomerId: customerId,
              },
            })

            if (user) {
              await updateUserTier(
                user.id,
                user.subscriptionTier as any,
                'CANCELLED',
              )
            }
          },
          onSubscriptionRevoked: async (payload) => {
            const customerId = payload.data.customerId

            const user = await prisma.user.findUnique({
              where: {
                polarCustomerId: customerId,
              },
            })

            if (user) {
              await updateUserTier(user.id, 'FREE', 'EXPIRED')
            }
          },
          onOrderPaid: async () => {},
          onCustomerCreated: async (payload) => {
            const user = await prisma.user.findUnique({
              where: {
                email: payload.data.email!,
              },
            })
            if (user) {
              await updatePolarCustomerId(user.id, payload.data.id)
            }
          },
        }),
      ],
    }),
  ],
  database: prismaAdapter(prisma, {
    provider: 'postgresql', // or "mysql", "postgresql", ...etc
  }),
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      scope: ['repo'],
    },
  },
  trustedOrigins: [
    process.env.NEXT_PUBLIC_APP_BASE_URL!,
    'http://localhost:3000',
  ], // webhook endpoint and also a main end point
})
