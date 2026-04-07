import prisma from '#/db'
import { createServerFn } from '@tanstack/react-start'
import { getPullRequestDiff } from '../github/github'
import { inngest } from '#/inngest/client'
import { canCreateReview, incrementReviewCount } from '../payment/subscription'

export const reviewPullRequest = createServerFn()
  .inputValidator(
    (data: { owner: string; repoName: string; prNum: number }) => data,
  )
  .handler(async ({ data: { owner, repoName, prNum } }) => {
    try {
      const repository = await prisma.repository.findFirst({
        where: {
          owner,
          name: repoName,
        },
        include: {
          user: {
            include: {
              accounts: {
                where: {
                  providerId: 'github',
                },
              },
            },
          },
        },
      })
      if (!repository) {
        throw new Error(
          `Repository ${owner}/${repoName} not found in database. Please connect to the repository `,
        )
      }

      const canReview = await canCreateReview({
        data: { userId: repository.user.id, repositoryId: repository.id },
      })
      if (!canReview) {
        throw new Error(
          'Review Limit reached for this repository. Please upgrade to pro plan for unlimited reviews',
        )
      }

      const githubAccount = repository.user.accounts[0]
      if (!githubAccount?.accessToken) {
        throw new Error('No GitHub access token found for the repository owner')
      }

      const token = githubAccount.accessToken

      const { title } = await getPullRequestDiff(token, owner, repoName, prNum)

      console.log(title)

      await inngest.send({
        name: 'pr.review.requested',
        data: {
          owner,
          repo: repoName,
          prNumber: prNum,
          userId: repository.user.id,
        },
      })

      await incrementReviewCount({
        data: { repositoryId: repository.id, userId: repository.id },
      })

      return { success: true, message: 'Review Queued' }
    } catch (err) {
      try {
        const repository = await prisma.repository.findFirst({
          where: {
            owner,
            name: repoName,
          },
        })
        if (repository) {
          await prisma.review.create({
            data: {
              repositoryId: repository.id,
              prNumber: prNum,
              prTitle: 'Failed to fetch PR',
              prUrl: `https://github.com/${owner}/${repoName}/pull/${prNum}`,
              review: `Error: ${err instanceof Error ? err.message : 'Unknown'}`,
              status: 'failed',
            },
          })
        }
      } catch (dberror) {
        console.error('Failed to save to the database', dberror)
      }
    }
  })
