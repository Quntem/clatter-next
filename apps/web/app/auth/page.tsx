import { ArrowLeft } from "lucide-react";
import "../home.css";

export default function Page() {
  return (
    <div>
      <a href={"./"}><ArrowLeft className="fixed top-6 left-6" /></a>
      <div className="flex flex-col gap-12 items-center py-[10dvh] text-center h-dvh">
        <div className="flex flex-col items-center gap-4">
          <img src={"/home/icon/regular_64x64.png"} height={48} width={48} />
          <h1 className="text-4xl font-semibold">Clatter Authentication</h1>
        </div>
        <button className="frame muted flex flex-row gap-2 items-center"><img src={"/home/icon/quntem_24x24.png"} height={16} width={16} /> Sign in with KeyStone</button>
        {/* Replace this with a video showcasing Clatter with application */}
        <img src={"/home/showcases/placeholder.png"} className="flex-1 min-h-0 max-w-full object-contain rounded-xl outline-0 drop-shadow-2xl transition-all duration-100 ease-in hover:scale-102 hover:outline-background-2 hover:outline-5" />
      </div>
    </div>
  )
}