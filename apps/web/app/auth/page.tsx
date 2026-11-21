"use client";

import { ArrowLeft } from "lucide-react";
import "../home.css";
import { useRouter } from "next/navigation";
import { useAuth } from "keystone-lib";
import { useEffect, useState } from "react";

function safeNext(raw: string | undefined) {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/client";
  return raw;
}

function goToKeystone(next: string) {
  if (!process.env.NEXT_PUBLIC_KEYSTONE_URL!) throw new TypeError("NEXT_PUBLIC_KEYSTONE_URL is not set");
  window.location.href = `${process.env.NEXT_PUBLIC_KEYSTONE_URL!}/auth/signin?redirectTo=${encodeURIComponent(window.location.origin + next)}`;
}

export default function Page() {
  const router = useRouter();
  const authState = useAuth({ keystoneUrl: process.env.NEXT_PUBLIC_KEYSTONE_URL!, appId: process.env.NEXT_PUBLIC_APP_ID! });
  const [leaving, setLeaving] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  useEffect(() => {
    if (!authState.loaded || !authState.data?.sessionId) return;
    router.replace(safeNext(new URLSearchParams(window.location.search).getAll("next").filter(Boolean)[0]));
  }, [authState, router]);

  const busy = !authState.loaded || !!authState.data?.sessionId || leaving;

  function handleSignIn() {
    setProblem(null);
    setLeaving(true);
    try {
      goToKeystone(safeNext(new URLSearchParams(window.location.search).getAll("next").filter(Boolean)[0]));
    } catch (err) {
      setLeaving(false);
      if (!(err instanceof TypeError)) throw err;
      console.warn("keystone sign-in failed to start", err);
      setProblem("Sign-in isn't configured properly. Try again later.");
    }
  }

  return (
    <div>
      <title>Authentication - Clatter</title>
      <a href={"./"}><ArrowLeft className="fixed top-6 left-6" /></a>
      <div className="flex flex-col gap-12 items-center py-[10dvh] text-center h-dvh">
        <div className="flex flex-col items-center gap-4">
          <img src={"/home/icon/regular_64x64.png"} height={48} width={48} />
          <h1 className="text-4xl font-semibold">Clatter Authentication</h1>
        </div>
        <button onClick={handleSignIn} disabled={busy} className="frame muted flex flex-row gap-2 items-center disabled:opacity-60 disabled:cursor-default">
          {!busy && <img src={"/home/icon/quntem_24x24.png"} height={16} width={16} />} {!authState.loaded ? "Checking session..." : !!authState.data?.sessionId ? "Redirecting..." : leaving ? "Opening KeyStone..." : "Sign in with KeyStone"}
        </button>
        {problem && <p role="alert" className="text-sm text-red-500 -mt-6">{problem}</p>}
        {/* Replace this with a video showcasing Clatter with application */}
        <img src={"/home/showcases/placeholder.png"} className="flex-1 min-h-0 max-w-full object-contain rounded-xl outline-0 drop-shadow-2xl transition-all duration-100 ease-in hover:scale-102 hover:outline-background-2 hover:outline-5" />
      </div>
    </div>
  )
}