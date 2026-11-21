import { createContext, useContext, useEffect, useState } from "react";
import { AuthState, useAuth } from "keystone-lib"
import { trpc } from "./trpc";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, httpSubscriptionLink, splitLink } from "@trpc/client";
import { EventSourcePolyfill } from "event-source-polyfill";


type authContextType = {
    authState: null | AuthState
}

const authContext = createContext<authContextType>({
    authState: null
})

export function AuthProvider({children}: {children: React.JSX.Element}) {
    const authState = useAuth({ keystoneUrl: process.env.NEXT_PUBLIC_KEYSTONE_URL!, appId: process.env.NEXT_PUBLIC_APP_ID! })
    useEffect(() => {
        if (!authState?.loaded) return
        if (!authState?.data?.sessionId) {
            window.location.replace("/auth?next=" + encodeURIComponent(window.location.pathname + window.location.search))
        }
    }, [authState])
    return <authContext.Provider value={{
        authState
    }}>
        {authState.data !== null && <TrpcProvider authState={authState}>
            {children}
        </TrpcProvider>}
    </authContext.Provider>
}

export default function TrpcProvider({children, authState}: {children: React.JSX.Element, authState: AuthState}) {
    const [queryClient] = useState(() => new QueryClient());
    const [trpcClient] = useState(() =>
        trpc.createClient({
            links: [
                splitLink({
                    condition: (op) => op.type === 'subscription',
                    true: httpSubscriptionLink({
                        url: '/trpc',
                        EventSource: EventSourcePolyfill,
                        eventSourceOptions: () => ({
                            headers: {
                                authorization: authState.data?.sessionId ? "Bearer " + authState.data.sessionId : ""
                            }
                        })
                    }),
                    false: httpBatchLink({
                        url: '/trpc',
                        headers() {
                            return {
                                authorization: "Bearer " + authState.data?.sessionId,
                            };
                        },
                    }),
                })
            ],
        }),
    );
    return <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    </trpc.Provider>
}

export function useAuthContext() {
    return useContext(authContext)
}