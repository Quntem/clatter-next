import { ArrowRight, ChevronDown } from "lucide-react";
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
                    <img src={"/home/ticker/placeholder.png"} className="h-[20dvh] rounded-xl outline-5 outline-background drop-shadow-lg transition-all duration-100 ease-in hover:scale-105 hover:outline-background-2"></img>
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
      <section className="px-[15dvw] py-24">
        <div className="flex flex-col gap-8">
          <h2 className="text-5xl font-bold">Free & Open Source<span className="text-gradient font-bold">.</span></h2>
          <div className="flex flex-row gap-8">
            <img src={"/home/showcases/placeholder.png"} className="h-64 rounded-xl" />
            <div>
              <p>
                Clatter is fully open source, available for anyone to contribute to. Every line of code is available for public eyes: for reading, for editing, for contributing.
                We are also fully free. Enjoy the benefits of having a premium grade communication platform whilst taking the cost of absolutely nothing!
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
