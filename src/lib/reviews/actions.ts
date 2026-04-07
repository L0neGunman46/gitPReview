import prisma from '#/db'
import { auth } from '@/lib/auth'
import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'

export const getReviews = createServerFn({ method: 'GET' }).handler(
  async () => {
    const headers = getRequestHeaders()

    const session = await auth.api.getSession({
      headers,
    })

    if (!session?.user) {
      throw new Error('Unauthorised')
    }

    const reviews = prisma.review.findMany({
      where: {
        repository: {
          userId: session.user.id,
        },
      },
      include: {
        repository: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    })

    return reviews
  },
)
