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
