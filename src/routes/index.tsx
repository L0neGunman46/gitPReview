import { useSession } from '#/lib/auth-client'
import { GitPullRequest } from 'lucide-react'
import { LandingNavbar } from '#/components/landing/navbar'
import { LandingFooter } from '#/components/landing/footer'
import { createFileRoute, useRouter } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: LandingPage,
})

function LandingPage() {
  const { data: session } = useSession()
  const router = useRouter()

  const handleCtaClick = () => {
    if (session) {
      router.navigate({ to: '/dashboard' })
    } else {
      router.navigate({ to: '/auth/login' })
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <LandingNavbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-24">
          {/* Left: Text */}
          <div className="flex flex-col justify-center gap-8">
            <div className="inline-flex w-fit items-center gap-2 border border-primary px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
              <span className="h-1.5 w-1.5 bg-primary" />
              Automated AI Code Review
            </div>

            <h1 className="text-5xl font-extrabold leading-tight tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              Every PR,
              <br />
              <span className="text-primary">reviewed</span>
              <br />
              <span className="text-primary">instantly.</span>
            </h1>

            <div className="flex flex-col gap-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
              <p>
                GitPReview watches your GitHub repositories. The moment a pull
                request is opened, it reads the full codebase context and the
                diff, then posts a structured AI code review as a comment
                directly on the PR, where your team already works.
              </p>
              <p>
                Your dashboard gives you a summarised view of every reviewed PR
                across all your linked repositories, in one place.
              </p>
            </div>

            <button
              onClick={handleCtaClick}
              className="flex w-fit items-center gap-3 bg-primary px-6 py-3 text-sm font-bold uppercase tracking-wider text-primary-foreground transition-opacity hover:opacity-90"
            >
              <img
                src="/GitHub_Invertocat_Black.svg"
                alt="GitHub"
                className="h-4 w-4 invert"
              />
              Connect your GitHub Account
              <span aria-hidden="true">&rarr;</span>
            </button>
          </div>

          {/* Right: PR Cards Preview */}
          <div className="flex flex-col justify-center gap-4">
            <div className="border border-border bg-card p-1">
              <div className="flex items-center justify-between border-b border-border px-4 py-2">
                <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Reviewed Pull Requests
                </span>
                <span className="flex items-center gap-1.5 text-xs font-medium text-green-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-600" />
                  live
                </span>
              </div>

              <div className="space-y-3 p-3">
                <PrCard
                  title="feat/oauth-refresh-token"
                  status="OPEN"
                  description="Adds refresh token rotation to the OAuth flow. The token expiry logic looks correct, but the revocation endpoint isn't called on logout — this could leave stale tokens active."
                  repo="acme-corp / api-gateway"
                />
                <PrCard
                  title="fix/rate-limit-headers"
                  status="OPEN"
                  description="Correctly surfaces X-RateLimit-Remaining on all routes. Minor: the Retry-After header uses seconds on some routes and milliseconds on others — standardise to seconds per RFC 7231."
                  repo="acme-corp / api-gateway"
                />
                <PrCard
                  title="refactor/user-service-split"
                  status="MERGED"
                  description="Clean extraction of UserProfile and UserAuth into separate services. The shared database transaction helper is duplicated in both — worth pulling into a common util before this merges."
                  repo="acme-corp / api-gateway"
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  )
}

function PrCard({
  title,
  status,
  description,
  repo,
}: {
  title: string
  status: string
  description: string
  repo: string
}) {
  const statusColor =
    status === 'OPEN'
      ? 'border-primary text-primary'
      : 'border-blue-600 text-blue-600'

  return (
    <div className="border border-border bg-background p-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitPullRequest className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">{title}</span>
        </div>
        <span
          className={`border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusColor}`}
        >
          {status}
        </span>
      </div>
      <p className="mb-2 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      <span className="text-xs text-muted-foreground">{repo}</span>
    </div>
  )
}
