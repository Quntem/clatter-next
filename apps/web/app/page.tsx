"use client";

import { ArrowRight, ChevronDown, SquareArrowUpRightExit } from "lucide-react";
import "./home.css";
import { useState } from "react";

export default function Page() {
  const [flame, setFlame] = useState(1);

  return (
    <div className="overflow-x-hidden">
      <section className="min-h-dvh flex flex-col pt-12 pb-6">
        <header className="flex items-center px-[15dvw]">
          <img width={32} height={32} src={"/home/icon/regular_48x48.png"} alt={"Clatter logo"}></img>
          <p className="ml-3 font-semibold text-lg">Clatter <span className="font-medium opacity-0 transition-opacity duration-500 hover:opacity-50">Next</span></p>
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
              <p className="w-[60%]">
                A user-friendly designed application for workplaces big and small. We choose to be user first, not profit first.
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
        <div className="flex flex-col gap-8">
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
        <img src={"/home/showcases/placeholder.png"} className="rounded-xl outline-0 drop-shadow-2xl transition-all duration-100 ease-in hover:scale-102 hover:outline-background-2 hover:outline-5" />
        <div className="flex flex-col gap-8 self-center text-center">
          <div className="flex flex-col gap-24">
            <div className="relative w-full h-64">
              <div className="absolute inset-0 transition-transform duration-500 ease-out" style={{ transformOrigin: `50% ${1800}px`, transform: `rotate(${-(flame - 1) * 12}deg)` }}>
                {FEATURES.map((f, i) => (
                  <div
                    key={f.title}
                    className="absolute inset-0 flex justify-center pointer-events-none"
                    style={{ transformOrigin: `50% ${1800}px`, transform: `rotate(${(i - 1) * 12}deg)`, zIndex: i === flame ? 10 : 0 }}
                  >
                    <img
                      src={f.image}
                      alt={f.title}
                      onClick={() => setFlame(i)}
                      className={`h-64 w-auto rounded-xl drop-shadow-lg pointer-events-auto cursor-pointer transition-opacity duration-300 ${i === flame ? "opacity-100" : "opacity-60 hover:opacity-90"}`}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-4 items-center">
              <h2 className="text-5xl font-bold"><span className="text-gradient font-bold">Unique</span> Features</h2>
              <p className="w-[60%]">
                Clatter provides many unique and helpful features, free of charge! We believe that all team communication platforms should prioritize features, not AI slop.
              </p>
              <div className="flex flex-col mt-4 gap-4">
                {FEATURES.map((f, i) => (
                  <div
                    key={f.title}
                    onClick={() => setFlame(i)}
                    data-active={i === flame}
                    className="flex flex-row items-center justify-center bg-background-0 px-12 py-4 cursor-pointer rounded-xl outline-0 outline-gradient drop-shadow-lg transition-all duration-100 ease-in hover:scale-102 hover:outline-background-2 hover:outline-5"
                  >
                    <div className="flex flex-col gap-1">
                      <h3 className="text-2xl font-bold">{f.title}</h3>
                      <p>{f.blurb}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      <footer className="px-[10dvw] p-48 bg-background-0 flex flex-col gap-12">
        <div className="flex flex-row items-center gap-4">
          <div className="flex flex-col gap-4">
            <h2 className="text-6xl font-bold flex flex-row items-end gap-3">
              <span className="text-gradient">Clatter</span>
              <span className="text-lg opacity-80 font-semibold flex flex-row gap-1 items-center">
                by <img src={"/home/icon/quntem_24x24.png"}/> Quntem <span className="font-medium opacity-0 transition-opacity duration-500 hover:opacity-50">OpenSource</span>
              </span>
            </h2>
            <p>A user-friendly designed application for workplaces big and small. We choose to be user first, not profit first.</p>
          </div>
          <button className="ml-auto frame primary flex flex-row gap-2 items-center">Use Now <ArrowRight size={16}/></button>
        </div>
      </footer>
    </div>
  )
}

{/* modify in the future with decentralization, etc. */}
const FEATURES = [
  { title: "Channel Ping Groups", blurb: "Ping channel-specific groups of people.", image: "/home/showcases/placeholder.png" },
  { title: "Unique Profiles", blurb: "Keep your profile relevant to your workspace.", image: "/home/showcases/placeholder.png" },
  { title: "Cross-workspace Messaging", blurb: "Easily set-up collaborations between two workspaces without hassle.", image: "/home/showcases/placeholder.png" },
];
