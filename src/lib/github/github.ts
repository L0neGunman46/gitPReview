import { Octokit } from 'octokit'
import { auth } from '#/lib/auth'
import prisma from '#/db'
import { getRequestHeaders } from '@tanstack/react-start/server'

// Getting the github access token

export const getGithubToken = async () => {
  const headers = getRequestHeaders()
  const session = await auth.api.getSession({ headers })

  if (!session) {
    throw new Error('Unauthorised!')
  }

  const account = await prisma.account.findFirst({
    where: {
      userId: session.user.id,
      providerId: 'github',
    },
  })

  if (!account?.accessToken) {
    throw new Error('No github access token found')
  }
  return account?.accessToken
}

// fetch user contribution - get the heat map

// interface contributiondata {
//   user: {
//     contributionCollection: {
//       contributionCalendar: {
//         totalContributions: number
//         weeks: {
//           contributionDays: {
//             contributionCount: number
//             data: string | Date
//             color: string
//           }
//         }
//       }
//     }
//   }
// }

export async function fetchUserContribution(token: string, userName: string) {
  const octokit = new Octokit({ auth: token })
  // graphql query
  const query = `
    query($username:String!){
        user(login:$username){
            contributionsCollection {
                contributionCalendar{
                    totalContributions
                    weeks {
                        contributionDays {
                            contributionCount
                            date
                            color
                        } 
                    }
                }
            }
        }
    }
    `
  try {
    const resp: any = await octokit.graphql(query, {
      username: userName,
    })
    return resp.user.contributionsCollection.contributionCalendar
  } catch (err) {
    console.log('Error loading repo', err)
  }
}

export const getRepositories = async (
  page: number = 1,
  perPage: number = 10,
) => {
  const token = await getGithubToken()
  const octokit = new Octokit({ auth: token })

  const { data } = await octokit.rest.repos.listForAuthenticatedUser({
    sort: 'updated',
    direction: 'desc',
    visibility: 'all',
    per_page: perPage,
    page: page,
  })
  return data
}

export const createWebHook = async (owner: string, repo: string) => {
  const token = await getGithubToken()
  const octokit = new Octokit({ auth: token })

  // registering this url to github webhoks and it gets sent a post request on this url
  const webhookUrl = `${process.env.NEXT_PUBLIC_APP_BASE_URL}/api/webhooks/github`

  const { data: hooks } = await octokit.rest.repos.listWebhooks({ owner, repo })

  const existingHook = hooks.find((hook) => hook.config.url === webhookUrl)
  if (existingHook) {
    return existingHook
  }

  const { data } = await octokit.rest.repos.createWebhook({
    owner,
    repo,
    config: {
      url: webhookUrl,
      content_type: 'json',
    },
    events: ['pull_request'],
  })

  return data
}

export const deleteWebHook = async (owner: string, repo: string) => {
  const token = await getGithubToken()
  const octokit = new Octokit({ auth: token })
  const webhookUrl = `${process.env.NEXT_PUBLIC_APP_BASE_URL}/api/webhooks/github`

  try {
    const { data: hooks } = await octokit.rest.repos.listWebhooks({
      owner,
      repo,
    })

    const hooksToDelete = hooks.find((hook) => hook.config.url === webhookUrl)

    if (hooksToDelete) {
      await octokit.rest.repos.deleteWebhook({
        owner,
        repo,
        hook_id: hooksToDelete.id,
      })
      return true
    }
    return false
  } catch (error) {
    console.error('Error deleting webhook')
    return false
  }
}

export async function getRepoFileContents(
  token: string,
  owner: string,
  repo: string,
  path: string = '',
): Promise<{ path: string; content: string }[]> {
  const octokit = new Octokit({ auth: token })
  const { data } = await octokit.rest.repos.getContent({ owner, repo, path })

  // check if its a file
  if (!Array.isArray(data)) {
    if (data?.type == 'file' && data.content) {
      return [
        {
          path: data.path,
          content: Buffer.from(data.content, 'base64').toString('utf-8'),
        },
      ]
    }
    return []
  }
  let files: { path: string; content: string }[] = []

  for (const item of data) {
    if (item.type === 'file') {
      const { data: fileData } = await octokit.rest.repos.getContent({
        owner,
        repo,
        path: item.path,
      })
      if (
        !Array.isArray(fileData) &&
        fileData.type === 'file' &&
        fileData.content
      ) {
        //filtering out non code files
        // currently lets include everything that looks like a text
        if (!item.path.match(/\.(png|jpg|jpeg|gif|svg|ico|pdf|zip|tar|gz)$/i)) {
          files.push({
            path: item.path,
            content: Buffer.from(fileData.content, 'base64').toString('utf-8'),
          })
        }
      }
    } else if (item.type === 'dir') {
      const subFile = await getRepoFileContents(token, owner, repo, item.path)
      files = files.concat(subFile)
    }
  }
  return files
}

export async function getPullRequestDiff(
  token: string,
  owner: string,
  repoName: string,
  prNum: number,
) {
  const octokit = new Octokit({ auth: token })
  const { data: pr } = await octokit.rest.pulls.get({
    owner,
    repo: repoName,
    pull_number: prNum,
  })

  const { data: diff } = await octokit.rest.pulls.get({
    owner,
    repo: repoName,
    pull_number: prNum,
    mediaType: {
      format: 'diff',
    },
  })
  return {
    title: pr.title,
    diff: diff as unknown as string,
    description: pr.body || '',
  }
}

export async function postReviewComment(
  token: string,
  owner: string,
  prNumber: number,
  repo: string,
  review: string,
) {
  const octokit = new Octokit({ auth: token })

  await octokit.rest.issues.createComment({
    owner,
    repo,
    issue_number: prNumber,
    body: `## 🤖 AI Code Review\n\n${review}\n\n--\nPowered by GitPreview`,
  })
}
