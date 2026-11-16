import { Button } from "@workspace/ui/components/button";

export default function Page() {
  return (
    <div className="py-12">
      <header className="flex items-center px-[25dvw]">
        <img width={24} height={24} src={"/icon_48x48.png"} alt={"Clatter logo"}></img>
        <p className="ml-3 font-semibold">Clatter</p>
        <button className="ml-auto primary">Use Now</button>
      </header>
    </div>
  )
}
