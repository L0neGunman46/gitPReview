import { fetchUserContribution, getGithubToken } from '#/lib/github/lib/github'
import { auth } from '#/lib/auth'
import { Octokit } from 'octokit'
import { getRequestHeaders } from '@tanstack/react-start/server'
import prisma from '#/db'
import { createServerFn } from '@tanstack/react-start'

// Steps
// 1 . Authentication check
// 2 . get your github user name
// 3 . Fetches your commits
/*     1 . gets your contribution calandar
       2 . counts how many commits we made each month
   4 . Fetches your code review
       1 . grouping by last 6 months 
   5 . Fetching PRs by searching it -  all PRS in last 6 months
       1 . Counts how many we did in 6 months
   6 . Organizes everything
       1 . DS
       2 . for each month  -  number of commits, number of PR and number of reviews

        {name: "Jul", commits: 45, prs: 12, reviews; 8}

*/

const monthNames = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

export const getDashboardStats = createServerFn().handler(async () => {
  const headers = getRequestHeaders()
  const session = await auth.api.getSession({
    headers,
  })
  if (!session?.user) {
    throw new Error('Unauthorised')
  }

  const token = await getGithubToken()
  const octokit = new Octokit({ auth: token })

  // get users github username
  const { data: user } = await octokit.rest.users.getAuthenticated()

  // Todo: fetch the total connected repos from db
  const totalRepos = 30

  //   ftch the contribution , commit and pr
  const calendar = await fetchUserContribution(token, user.login).catch(
    () => null,
  )
  const totalCommits = calendar?.totalContributions || 0

  // counting pr from db or github
  const prResult = await octokit.rest.search
    .issuesAndPullRequests({
      q: `author:${user.login} type:pr`,
      per_page: 1,
    })
    .catch(() => null)

  const totalPrs = prResult?.data.total_count
  //   Todo count AI reviews from DB
  const totalReviews = 34

  return {
    totalCommits: totalCommits,
    totalPrs: totalPrs,
    totalReviews: totalReviews,
    totalRepos: totalRepos,
  }
})

export const getMonthlyActivity = createServerFn().handler(async () => {
  const headers = getRequestHeaders()
  const session = await auth.api.getSession({ headers })

  if (!session?.user) {
    throw new Error('Unauthorised')
  }

  const token = await getGithubToken()
  const octokit = new Octokit({ auth: token })
  const { data: user } = await octokit.rest.users.getAuthenticated()

  const calendar = await fetchUserContribution(token, user.login)
  if (!calendar) {
    return []
  }

  const monthlydata: {
    [key: string]: { commits: number; prs: number; reviews: number }
  } = {}

  // Initialize the last 6 months
  const now = new Date()
  for (let i = 5; i >= 0; --i) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthKey = monthNames[date.getMonth()]
    monthlydata[monthKey] = { commits: 0, prs: 0, reviews: 0 }
  }

  calendar.weeks.forEach((week: any) => {
    week.contributionDays.forEach((day: any) => {
      const date = new Date(day.date)
      const monthKey = monthNames[date.getMonth()]
      if (monthlydata[monthKey]) {
        monthlydata[monthKey].commits += day.contributionCount
      }
    })
  })

  // fetch review from the db from the last 6 months
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  //  TODO  reviews real data group review by month and get data
  const generateSampleReviews = () => {
    const sampeleReviews = []
    const now = new Date()

    //generate random reviews from the last 6 months
    for (let i = 0; i < 45; ++i) {
      const randomDaysAgo = Math.floor(Math.random() * 180)
      const reviewdate = new Date(now)
      reviewdate.setDate(reviewdate.getDate() - randomDaysAgo)
      sampeleReviews.push({
        createdAt: reviewdate,
      })
    }
    return sampeleReviews
  }
  const reviews = generateSampleReviews()

  reviews.forEach((rev) => {
    const monthKey = monthNames[rev.createdAt.getMonth()]
    if (monthlydata[monthKey]) {
      monthlydata[monthKey].reviews += 1
    }
  })

  const prResult = await octokit.rest.search
    .issuesAndPullRequests({
      q: `author:${user.login} type:pr created:>${sixMonthsAgo.toISOString().split('t')[0]}`,
      per_page: 100,
    })
    .catch(() => null)

  const prs = prResult?.data
  prs?.items.forEach((pr: any) => {
    const date = new Date(pr.created_at)
    const monthKey = monthNames[date.getMonth()]
    if (monthlydata[monthKey]) {
      monthlydata[monthKey].prs += 1
    }
  })

  return Object.keys(monthlydata).map((name) => ({
    name,
    ...monthlydata[name],
  }))
})
