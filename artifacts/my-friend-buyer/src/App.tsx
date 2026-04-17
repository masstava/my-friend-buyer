import { useEffect, useRef } from "react";
import { ClerkProvider, SignIn, SignUp, Show, useClerk } from "@clerk/react";
import { Switch, Route, useLocation, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppShell from "@/components/layout/AppShell";

// Pages
import Dashboard from "@/pages/Dashboard";
import SocietaPage from "@/pages/SocietaPage";
import PuntiVenditaPage from "@/pages/PuntiVenditaPage";
import MagazziniPage from "@/pages/MagazziniPage";
import FornitoriPage from "@/pages/FornitoriPage";
import ArticoliPage from "@/pages/ArticoliPage";
import Profilo from "@/pages/Profilo";
import InSviluppo from "@/pages/InSviluppo";
import NotFound from "@/pages/not-found";

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

export const queryClient = new QueryClient();

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

if (!clerkPubKey) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY in .env file");
}

const clerkAppearance = {
  variables: {
    colorPrimary: "hsl(189, 84%, 30%)",
    colorBackground: "hsl(0, 0%, 100%)",
    colorInputBackground: "hsl(214, 32%, 96%)",
    colorText: "hsl(222, 47%, 11%)",
    colorTextSecondary: "hsl(215, 16%, 47%)",
    colorInputText: "hsl(222, 47%, 11%)",
    colorNeutral: "hsl(214, 32%, 91%)",
    borderRadius: "0.375rem",
  },
  elements: {
    rootBox: "w-full",
    cardBox: "shadow-lg rounded-xl border w-full overflow-hidden bg-card",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: { color: "hsl(222, 47%, 11%)" },
    headerSubtitle: { color: "hsl(215, 16%, 47%)" },
    formFieldLabel: { color: "hsl(222, 47%, 11%)" },
    footerActionText: { color: "hsl(215, 16%, 47%)" },
  },
};

function SignInPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-gray-50 px-4">
      <SignIn routing="path" path={`${basePath}/login`} signUpUrl={`${basePath}/signup`} />
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-gray-50 px-4">
      <SignUp routing="path" path={`${basePath}/signup`} signInUrl={`${basePath}/login`} />
    </div>
  );
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const queryClient = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (
        prevUserIdRef.current !== undefined &&
        prevUserIdRef.current !== userId
      ) {
        queryClient.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, queryClient]);

  return null;
}

function HomeRedirect() {
  return (
    <>
      <Show when="signed-in">
        <Redirect to="/dashboard" />
      </Show>
      <Show when="signed-out">
        <Redirect to="/login" />
      </Show>
    </>
  );
}

function ProtectedRoute({ component: Component }: { component: any }) {
  return (
    <>
      <Show when="signed-in">
        <AppShell>
          <Component />
        </AppShell>
      </Show>
      <Show when="signed-out">
        <Redirect to="/login" />
      </Show>
    </>
  );
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <Switch>
          <Route path="/" component={HomeRedirect} />
          <Route path="/login/*?" component={SignInPage} />
          <Route path="/signup/*?" component={SignUpPage} />
          
          <Route path="/dashboard"><ProtectedRoute component={Dashboard} /></Route>
          <Route path="/anagrafiche/societa"><ProtectedRoute component={SocietaPage} /></Route>
          <Route path="/anagrafiche/punti-vendita"><ProtectedRoute component={PuntiVenditaPage} /></Route>
          <Route path="/anagrafiche/magazzini"><ProtectedRoute component={MagazziniPage} /></Route>
          <Route path="/anagrafiche/fornitori"><ProtectedRoute component={FornitoriPage} /></Route>
          <Route path="/anagrafiche/articoli"><ProtectedRoute component={ArticoliPage} /></Route>
          <Route path="/profilo"><ProtectedRoute component={Profilo} /></Route>
          
          <Route path="/operazioni/*?"><ProtectedRoute component={InSviluppo} /></Route>
          <Route path="/sistema/*?"><ProtectedRoute component={InSviluppo} /></Route>

          <Route component={NotFound} />
        </Switch>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <TooltipProvider>
      <WouterRouter base={basePath}>
        <ClerkProviderWithRoutes />
      </WouterRouter>
      <Toaster />
    </TooltipProvider>
  );
}

export default App;
