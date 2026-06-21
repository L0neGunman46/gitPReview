import { createFileRoute } from '@tanstack/react-router'
import { LayoutDashboard, Link2, MessageSquareQuote, Zap } from 'lucide-react'
import { LandingNavbar } from '#/components/landing/navbar'
import { LandingFooter } from '#/components/landing/footer'

export const Route = createFileRoute('/features')({
  component: FeaturesPage,
})

const features = [
  {
    icon: LayoutDashboard,
    title: 'Your PR Dashboard',
    description:
      'Every pull request across your linked repositories appears in one clean list — sorted by recency, enriched with AI-generated summaries. No more jumping between tabs or losing context.',
  },
  {
    icon: Link2,
    title: 'Link & Unlink Repositories',
    description:
      'Choose exactly which repositories GitPReview monitors. Connect a repo in one click and it starts watching for new PRs immediately. Disconnect it just as easily when you no longer need coverage.',
  },
  {
    icon: MessageSquareQuote,
    title: 'AI Review Posted as a PR Comment',
    description:
      'When a PR is raised, GitPReview reads the full repository context and the diff, then posts a structured code review directly as a comment on the PR — so your whole team sees it in GitHub without changing their workflow.',
  },
  {
    icon: Zap,
    title: 'Powered by Inngest',
    description:
      'Reviews are triggered automatically by GitHub webhooks and processed reliably via Inngest background jobs, so every PR gets analysed, even if it lands at 3am on a Friday.',
  },
]

function FeaturesPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <LandingNavbar />

      <main className="flex-1">
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mb-4 text-xs font-semibold uppercase tracking-widest text-primary">
            Features
          </div>
          <h1 className="mb-6 text-3xl font-extrabold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Built around how GitHub teams actually work.
          </h1>
          <p className="mb-16 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            GitPReview does not ask your team to change anything. The review
            appears where they already look — in the PR thread — and your
            dashboard gives you the aerial view.
          </p>

          <div className="grid gap-0 sm:grid-cols-2">
            {features.map((feature, idx) => (
              <div
                key={feature.title}
                className={`flex gap-4 p-8 ${
                  idx < 2 ? 'border-b border-border' : ''
                } ${idx % 2 === 0 ? 'border-r border-border' : ''}`}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-border">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  )
}
