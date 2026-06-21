import { Link, useRouter } from '@tanstack/react-router'
import { useSession } from '#/lib/auth-client'
import { GitPullRequest } from 'lucide-react'

export function LandingNavbar() {
  const { data: session } = useSession()
  const router = useRouter()

  const handleAuthClick = () => {
    if (session) {
      router.navigate({ to: '/dashboard' })
    } else {
      router.navigate({ to: '/auth/login' })
    }
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center bg-primary">
            <GitPullRequest />
          </div>
          <span className="text-sm font-bold tracking-[0.15em] uppercase text-foreground">
            GitPReview
          </span>
        </Link>

        {/* Nav Links + Auth grouped together on the right */}
        <div className="flex items-center gap-8">
          <Link
            to="/how-it-works"
            className="text-xs font-semibold uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
          >
            How it Works
          </Link>
          <Link
            to="/features"
            className="text-xs font-semibold uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
          >
            Features
          </Link>
          <button
            onClick={handleAuthClick}
            className="flex items-center gap-2 bg-primary px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-primary-foreground transition-opacity hover:opacity-85"
          >
            <img
              src="/GitHub_Invertocat_Black.svg"
              alt="GitHub"
              className="h-3.5 w-3.5 invert"
            />
            {session ? 'Dashboard' : 'Sign In'}
          </button>
        </div>
      </div>
    </nav>
  )
}
