import { ArrowRight, ChevronDown, SquareArrowUpRightExit } from "lucide-react";
import "./home.css";

export default function Page() {
  return (
    <div>
      <section className="min-h-dvh flex flex-col pt-12 pb-6">
        <header className="flex items-center px-[15dvw]">
          <img width={32} height={32} src={"/home/icon/regular_48x48.png"} alt={"Clatter logo"}></img>
          <p className="ml-3 font-semibold text-lg">Clatter</p>
          <button className="ml-auto frame primary flex flex-row gap-2 items-center">Use Now <ArrowRight size={16}/></button>
        </header>
        <div className="flex-1 flex flex-col justify-center">
          <div className="mt-20">
            <div className="overflow-hidden py-[3dvh]">
              <div className="ticker-track">
                {Array.from({ length: 24 }, (_, i) => i).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 px-8 shrink-0">
                    <img src={"/home/ticker/placeholder.png"} className="h-[20dvh] rounded-xl outline-0 drop-shadow-lg transition-all duration-100 ease-in hover:scale-105 hover:outline-background-2 hover:outline-5"></img>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="px-[22dvw] my-20 text-center flex flex-col gap-8 items-center">
            <div className="flex flex-col gap-4 items-center">
              <h1 className="text-7xl font-semibold">Your Workspace, <span className="text-gradient font-bold">In Sync</span></h1>
              <p className="w-[62%]">
                A new and user-friendly designed application for workplaces big and small. We care about your experience, not your data.
              </p>
            </div>
            <div className="flex flex-row gap-3">
              <button className="frame primary flex flex-row gap-2 items-center">Early Build now available <ArrowRight size={16}/></button>
              <a href={"https://github.com/Quntem/clatter-next/"}><button className="frame muted">Contribute</button></a>
            </div>
          </div>
        </div>
        <p className="flex flex-row gap-3 mx-auto text-center font-semibold"><ChevronDown className="animate-down"/>Scroll Down<ChevronDown className="animate-down"/></p>
      </section>
      <section className="px-[15dvw] my-48 flex flex-col gap-64">
        <div className="flex flex-col gap-8 w-[90%]">
          <h2 className="text-5xl font-bold"><span className="text-gradient font-bold">Free</span> & Open Source.</h2>
          <div className="flex flex-row gap-8">
            <img src={"/home/showcases/placeholder.png"} className="h-64 rounded-xl outline-0 drop-shadow-lg transition-all duration-100 ease-in hover:scale-105 hover:outline-background-2 hover:outline-5" />
            <div className="flex flex-col">
              <p>
                Clatter is completely free and fully open source. Team communication platforms should increase efficiency, not try to squeeze every last penny out of you.
              </p>
              <div className="mt-auto">
                <a href={"https://github.com/Quntem/clatter-next/"}>
                  <div className="flex flex-row items-center bg-background-0 px-6 py-4 cursor-pointer rounded-xl outline-0 drop-shadow-lg transition-all duration-100 ease-in hover:scale-102 hover:outline-background-2 hover:outline-5">
                    <div className="flex flex-col gap-1">
                      <h3 className="text-2xl font-bold">Contribute</h3>
                      <p>
                        Help develop the future of team communication!
                      </p>
                    </div>
                    <SquareArrowUpRightExit className="ml-auto"/>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
        {/* Replace this with a video showcasing Clatter with application */}
        <img src={"/home/showcases/placeholder.png"} className="rounded-xl outline-0 drop-shadow-lg transition-all duration-100 ease-in hover:scale-102 hover:outline-background-2 hover:outline-5" />
        <div className="flex flex-col gap-8 w-[90%] self-end text-right">
          <h2 className="text-5xl font-bold"><span className="text-gradient font-bold">Unique</span> Features</h2>
          <div className="flex flex-row-reverse gap-8">
            <img src={"/home/showcases/placeholder.png"} className="h-64 rounded-xl outline-0 drop-shadow-lg transition-all duration-100 ease-in hover:scale-105 hover:outline-background-2 hover:outline-5" />
            <div className="flex flex-col gap-8">
              <p>
                Clatter provides many unique and helpful features, free of charge! We believe that all team communication platforms should prioritize features, not AI slop.
              </p>
              <div className="flex flex-col gap-4">
                <div className="flex flex-row items-center justify-end bg-background-0 px-6 py-4 cursor-pointer rounded-xl outline-0 drop-shadow-lg transition-all duration-100 ease-in hover:scale-102 hover:outline-background-2 hover:outline-5">
                  <div className="flex flex-col gap-1">
                    <h3 className="text-2xl font-bold">Channel Ping Groups</h3>
                    <p>
                      Ping channel-specific groups of people.
                    </p>
                  </div>
                </div>
                <div className="flex flex-row items-center justify-end bg-background-0 px-6 py-4 cursor-pointer rounded-xl outline-0 drop-shadow-lg transition-all duration-100 ease-in hover:scale-102 hover:outline-background-2 hover:outline-5">
                  <div className="flex flex-col gap-1">
                    <h3 className="text-2xl font-bold">Unique Profiles</h3>
                    <p>
                      Keep your profile relevant to your workspace.
                    </p>
                  </div>
                </div>
                <div className="flex flex-row items-center justify-end bg-background-0 px-6 py-4 cursor-pointer rounded-xl outline-0 drop-shadow-lg transition-all duration-100 ease-in hover:scale-102 hover:outline-background-2 hover:outline-5">
                  <div className="flex flex-col gap-1">
                    <h3 className="text-2xl font-bold">Cross-workspace Messaging</h3>
                    <p>
                      Easily set-up collaborations between two workspaces without hassle.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
