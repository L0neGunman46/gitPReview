import prisma from '#/db'
import { indexCodebase } from '#/lib/ai/rag'
import { getRepoFileContents } from '#/lib/github/github'
import { inngest } from '../client'

export const IndexRepo = inngest.createFunction(
  {
    id: 'index-repo',
    triggers: [{ event: 'repository.connected' }],
  },
  async ({ event, step }) => {
    const { owner, repo, userId } = event.data

    // fetch all the files we have in a specific repo
    const files = await step.run('fetch-files', async () => {
      const account = await prisma.account.findFirst({
        where: {
          userId: userId,
          providerId: 'github',
        },
      })
      if (!account?.accessToken) {
        throw new Error('No Github access token found')
      }
      return await getRepoFileContents(account?.accessToken, owner, repo)
    })

    await step.run('index-codebase', async () => {
      await indexCodebase(`${owner}/${repo}`, files)
    })
    return {
      success: true,
      indexedFiles: files.length,
    }
  },
)
