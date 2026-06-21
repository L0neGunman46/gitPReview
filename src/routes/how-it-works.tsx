import { createFileRoute } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'
import { LandingNavbar } from '#/components/landing/navbar'
import { LandingFooter } from '#/components/landing/footer'

export const Route = createFileRoute('/how-it-works')({
  component: HowItWorksPage,
})

const steps = [
  {
    num: '01',
    title: 'Sign in with GitHub',
    description:
      'Authenticate your GitHub account. GitPReview reads your profile and the repositories you have access to and nothing else.',
  },
  {
    num: '02',
    title: 'Link the repos you care about',
    description:
      'From your dashboard, pick which repositories you want to monitor. You can add or remove repos at any time. Only linked repos trigger reviews.',
  },
  {
    num: '03',
    title: 'A PR is raised',
    description:
      'When anyone opens a pull request against a linked repository, GitHub sends a webhook to GitPReview and kicks off an Inngest background job.',
  },
  {
    num: '04',
    title: 'AI reads the repo and the diff',
    description:
      'The job fetches the full repository context alongside the PR diff and passes everything to the AI model, which analyses the change in context rather than in isolation.',
  },
  {
    num: '05',
    title: 'Review posted as a PR comment',
    description:
      'The AI-generated summary and code review are posted directly as a comment on the pull request in GitHub. Your team sees it in the comments of the PR, no new tool to open.',
  },
  {
    num: '06',
    title: 'Browse all your reviewed PRs',
    description:
      'Inside GitPReview, every reviewed PR appears in your dashboard as a summarised card. Filter by repo, scan the highlights, and jump to GitHub when you need the full picture.',
  },
]

function HowItWorksPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <LandingNavbar />

      <main className="flex-1">
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="text-xs font-semibold tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors mb-4">
            How it Works
          </div>
          <h1 className="mb-6 text-3xl font-extrabold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            From pull request to review comment — automatically.
          </h1>
          <p className="mb-16 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            GitPReview runs entirely in the background via Inngest jobs. Once
            you link a repository, there is nothing else to configure — every PR
            is handled end-to-end.
          </p>

          <div className="grid gap-0 sm:grid-cols-2 lg:grid-cols-3">
            {steps.map((step, idx) => (
              <div
                key={step.num}
                className={`relative p-8 ${
                  idx < 3 ? 'border-b border-border' : ''
                } ${idx % 3 !== 2 ? 'lg:border-r' : ''} ${
                  idx % 2 !== 1 ? 'sm:border-r lg:border-r-0' : ''
                } ${idx < steps.length - 3 ? '' : ''}`}
              >
                <div className="mb-4 text-3xl font-bold text-muted">
                  {step.num}
                </div>
                <div className="mb-3 flex items-center gap-1 text-sm font-bold uppercase tracking-wider text-foreground">
                  <ChevronRight className="h-4 w-4 text-primary" />
                  {step.title}
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  )
}
