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
