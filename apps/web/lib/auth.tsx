import { createContext, useContext, useEffect, useState } from "react";
import { AuthState, useAuth } from "keystone-lib"
import { trpc } from "./trpc";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";


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
            window.location.href = `${process.env.NEXT_PUBLIC_KEYSTONE_URL}/auth/signin?redirectTo=` + window.location.href
        }
    }, [authState])

    const [queryClient] = useState(() => new QueryClient());
    const [trpcClient] = useState(() =>
        trpc.createClient({
            links: [
                httpBatchLink({
                    url: '/trpc',

                    // You can pass any HTTP headers you wish here
                    async headers() {
                        return {
                            authorization: () => authState.data?.sessionId,
                        };
                    },
                }),
            ],
        }),
    );
    return <authContext.Provider value={{
        authState
    }}>
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </trpc.Provider>
    </authContext.Provider>
}

export function useAuthContext() {
    return useContext(authContext)
}