import { auth } from '../auth'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { createWebHook, getRepositories } from '../github/github'
import prisma from '#/db'
import { createServerFn } from '@tanstack/react-start'

export const fetchRepositories = createServerFn({ method: 'POST' })
  .inputValidator((data: { page: number; perPage: number }) => data)
  .handler(async ({ data: { page, perPage } }) => {
    const headers = getRequestHeaders()

    const session = await auth.api.getSession({
      headers,
    })
    if (!session) {
      throw new Error('Unauthorised')
    }

    const githubRepos = await getRepositories(page, perPage)
    const dbRepos = await prisma.repository.findMany({
      where: {
        userId: session.user.id,
      },
    })

    const connectedRepoIds = new Set(dbRepos.map((repo) => repo.githubId))

    return githubRepos.map((repo: any) => ({
      ...repo,
      isConnected: connectedRepoIds.has(BigInt(repo.id)),
    }))
  })

export const connectRepository = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: {
      owner: string
      repo: string
      githubId: number
      description: string
      stars: number
      language: string
    }) => data,
  )
  .handler(
    async ({
      data: { owner, repo, githubId, description, stars, language },
    }) => {
      try {
        const headers = getRequestHeaders()

        const session = await auth.api.getSession({
          headers,
        })

        if (!session) {
          throw new Error('UnAuthorised')
        }

        //   TOdo check if user can connect to more repositories
        const webhook = await createWebHook(owner, repo)
        if (webhook) {
          await prisma.repository.create({
            data: {
              githubId: BigInt(githubId),
              name: repo,
              owner,
              fullName: `${owner}/${repo}`,
              url: `https://github.com/${owner}/${repo}`,
              userId: session.user.id,
              description: description,
              stars: stars,
              language: language,
            },
          })
        }

        //   TOdo increent count for tracking usage
        // Todo trigger repository indexing for RAG (fire and forget)

        return webhook
      } catch (err) {
        console.error('Error in creating webhook', err)
        return {}
      }
    },
  )
