import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { injectResizeObserverShield, logPlanck } from "@/lib/error-capture";
import { LiquidOSErrorBoundary } from "@/lib/error-boundary";
import { TenancyProvider } from "@/providers/TenancyProvider";
import { Toaster } from "@/components/ui/sonner";


if (typeof window !== "undefined") {
  injectResizeObserverShield();
  logPlanck("START", "APP_BOOT", "LiquidOS Core routing initialized.");
}

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "IDIA Pay · LiquidOS" },
      { name: "description", content: "IDIA Pay LiquidOS — a hydrating shell for sovereign, dual-rail commerce. Enter a Hub provisioning code to hydrate your industry workspace." },
      { name: "author", content: "Lovable" },
      { property: "og:title", content: "IDIA Pay · LiquidOS" },
      { property: "og:description", content: "IDIA Pay LiquidOS — a hydrating shell for sovereign, dual-rail commerce. Enter a Hub provisioning code to hydrate your industry workspace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "IDIA Pay · LiquidOS" },
      { name: "twitter:description", content: "IDIA Pay LiquidOS — a hydrating shell for sovereign, dual-rail commerce. Enter a Hub provisioning code to hydrate your industry workspace." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/d414e96c-6c87-48e7-ab30-597f7fec924f/id-preview-bf378127--fb99083f-5f91-4c2e-a99d-263c3baeed06.lovable.app-1783450463757.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/d414e96c-6c87-48e7-ab30-597f7fec924f/id-preview-bf378127--fb99083f-5f91-4c2e-a99d-263c3baeed06.lovable.app-1783450463757.png" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <LiquidOSErrorBoundary>
        <TenancyProvider>
          <Outlet />
        </TenancyProvider>
      </LiquidOSErrorBoundary>
      <Toaster richColors position="top-center" closeButton />
    </QueryClientProvider>
  );
}
