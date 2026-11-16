import { Button } from "@workspace/ui/components/button";

export default function Page() {
  return (
    <div className="py-12">
      <header className="flex">
        <img width={24} height={24} src={"/icon_48x48.png"} alt={"Clatter logo"}></img>
        <p className="ml-3 font-semibold">Clatter</p>
        <Button>Use Now</Button>
      </header>
    </div>
  )
}
