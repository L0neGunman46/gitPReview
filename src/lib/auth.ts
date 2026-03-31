import prisma from '#/db'
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { tanstackStartCookies } from 'better-auth/tanstack-start'

export const auth = betterAuth({
  //...your config
  plugins: [tanstackStartCookies()],
  database: prismaAdapter(prisma, {
    provider: 'postgresql', // or "mysql", "postgresql", ...etc
  }),
  socialProviders:{
    github:{
        clientId:process.env.GITHUB_CLIENT_ID!,
        clientSecret:process.env.GITHUB_CLIENT_SECRET!,
        scope:["repo"]
    }
  }
})
