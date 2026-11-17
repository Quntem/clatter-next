import "./home.css";

export default function Page() {
  return (
    <div className="py-12">
      <header className="flex items-center px-[15dvw]">
        <img width={24} height={24} src={"/home/icon/regular_48x48.png"} alt={"Clatter logo"}></img>
        <p className="ml-3 font-semibold">Clatter</p>
        <button className="ml-auto primary">Use Now</button>
      </header>
      <div className="mt-20">
        <div className="overflow-hidden py-[3dvh]">
          <div className="ticker-track">
            {Array.from({ length: 24 }, (_, i) => i).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-8 shrink-0">
                <img src={"/home/ticker/ticker_image_placeholder.png"} className="h-[20dvh] rounded-xl outline-5 outline-background drop-shadow-lg transition-all duration-100 ease-in hover:scale-105 hover:outline-background-2"></img>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="px-[12dvw] my-20 text-center flex flex-col gap-4 items-center">
        <h1 className="text-7xl font-semibold">Your Workspace, <span className="text-gradient">In Sync</span></h1>
        <p className="w-[60%]">
          A new and user-friendly designed application for workplaces big and small. We care about your experience, not your data.
        </p>
      </div>
    </div>
  )
}
