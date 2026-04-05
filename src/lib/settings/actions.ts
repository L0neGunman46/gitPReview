import { auth } from '../auth'
import prisma from '#/db'
import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { deleteWebHook } from '#/lib/github/github'

export const getUserProfile = createServerFn({ method: 'GET' }).handler(
  async () => {
    try {
      const headers = await getRequestHeaders()
      const session = await auth.api.getSession({
        headers,
      })
      if (!session?.user) {
        throw new Error('Unauthorised')
      }

      const user = await prisma.user.findUnique({
        where: {
          id: session.user.id,
        },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          createdAt: true,
        },
      })
      return user
    } catch (error) {
      console.error('Error fetching user profile', error)
      return null
    }
  },
)

export const updateUserProfile = createServerFn({ method: 'POST' })
  .inputValidator((data: { name?: string; email?: string }) => data)
  .handler(async ({ data: { name, email } }) => {
    try {
      const headers = await getRequestHeaders()
      const session = await auth.api.getSession({
        headers,
      })
      if (!session?.user) {
        throw new Error('Unauthorised')
      }
      const updateUser = await prisma.user.update({
        where: {
          id: session.user.id,
        },
        data: {
          name: name,
          email: email,
        },
        select: {
          id: true,
          name: true,
          email: true,
        },
      })

      return {
        success: true,
        user: updateUser,
      }
    } catch (error) {
      console.log('Error updating user profile', error)
      return null
    }
  })

export const getConnectedRepositories = createServerFn({
  method: 'GET',
}).handler(async () => {
  try {
    const headers = await getRequestHeaders()
    const session = await auth.api.getSession({
      headers,
    })

    if (!session?.user) {
      throw new Error('Unauthorised')
    }

    const repositories = await prisma.repository.findMany({
      where: { userId: session?.user.id },
      select: {
        id: true,
        name: true,
        fullName: true,
        url: true,
        createdAt: true,
        // description: true,
        // stars: true,
        // language: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    return repositories
  } catch (error) {
    console.error('Error Fetching connected repositories: ', error)
    return []
  }
})

export const disconnectRepository = createServerFn({ method: 'POST' })
  .inputValidator((data: { repositoryId?: string }) => data)
  .handler(async ({ data }) => {
    try {
      const headers = await getRequestHeaders()
      const session = await auth.api.getSession({
        headers,
      })

      if (!session?.user) {
        throw new Error('Unauthorised to disconnect Repository')
      }

      const repository = await prisma.repository.findUnique({
        where: {
          userId: session.user.id,
          id: data.repositoryId,
        },
      })
      if (!repository) {
        throw new Error('Reository not found!')
      }

      await deleteWebHook(repository.owner, repository.name)

      await prisma.repository.delete({
        where: {
          id: repository?.id,
          userId: session?.user?.id,
        },
      })
      return { success: true }
    } catch (error) {
      console.error('Error disconnecting repository:', error)
      return { success: false, error: 'Failed to disconnect from repository' }
    }
  })

export const disconnectAllRepository = createServerFn({
  method: 'POST',
}).handler(async () => {
  try {
    const headers = await getRequestHeaders()
    const session = await auth.api.getSession({
      headers,
    })

    if (!session?.user) {
      throw new Error('UnAuthorised')
    }

    const repositories = await prisma.repository.findMany({
      where: {
        userId: session.user.id,
      },
    })
    await Promise.all(
      repositories.map(async (repo) => {
        await deleteWebHook(repo.owner, repo.name)
      }),
    )

    const result = await prisma.repository.deleteMany({
      where: {
        userId: session.user.id,
      },
    })

    return { success: true, count: result.count }
  } catch (error) {
    console.error('Error disconnecting all repositories')
    return {
      success: false,
      error: 'Failed to disconnect all connected repositories',
    }
  }
})
