import { redirect } from "next/navigation";
import { Usable, use } from "react";

export default function({params}: {params: Usable<{workspaceslug: string}>}) {
    const {workspaceslug} = use(params)
    return redirect("/client/" + workspaceslug + "/directory")
}