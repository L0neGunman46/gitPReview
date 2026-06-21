import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import appCss from '../styles.css?url'
import { getThemeServerFn } from '#/lib/theme'
import { ThemeProvider } from '#/components/theme-provider'
import { Toaster } from '#/components/ui/sonner'

const queryClient = new QueryClient()

const THEME_INIT_SCRIPT = `(function(){try{var root=document.documentElement;var cls=root.className;var hasLight=cls.indexOf('light')>-1;var hasDark=cls.indexOf('dark')>-1;var hasSystem=cls.indexOf('system')>-1;if(!hasLight&&!hasDark||hasSystem){var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var resolved=prefersDark?'dark':'light';root.classList.remove('light','dark','system');root.classList.add(resolved);root.style.colorScheme=resolved;}else{root.style.colorScheme=hasDark?'dark':'light';}}catch(e){}})();`

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'GitPReview',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
      {
        rel: 'preconnect',
        href: 'https://fonts.googleapis.com',
      },
      {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossOrigin: 'anonymous',
      },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Oxanium:wght@400;500;600;700;800&family=Source+Code+Pro:wght@400;500;600;700&display=swap',
      },
    ],
  }),
  loader: () => getThemeServerFn(),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  const theme = Route.useLoaderData()
  return (
    <html className={theme} lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <HeadContent />
      </head>
      <body className="font-sans antialiased [overflow-wrap:anywhere]">
        <QueryClientProvider client={queryClient}>
          <ThemeProvider theme={theme}>{children}</ThemeProvider>
          <Toaster />
          <TanStackDevtools
            config={{
              position: 'bottom-right',
            }}
            plugins={[
              {
                name: 'Tanstack Router',
                render: <TanStackRouterDevtoolsPanel />,
              },
            ]}
          />
        </QueryClientProvider>
        <Scripts />
      </body>
    </html>
  )
}
