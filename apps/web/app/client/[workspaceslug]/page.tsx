import { redirect } from "next/navigation";
import { use } from "react";

export default function({params}: {params: Promise<{workspaceslug: string}>}) {
    const {workspaceslug} = use(params)
    return redirect("/client/" + workspaceslug + "/directory")
}