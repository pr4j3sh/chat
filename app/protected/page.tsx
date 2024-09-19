import QueryForm from "@/components/query-form";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  function handleSend(e: FormDataEvent) {
    e.preventDefault();
    console.log(e);
  }

  return (
    <div className="flex-grow w-full flex flex-col gap-12">
      <div className="flex-grow flex flex-col gap-y-2">
        <div className={`flex`}>
          <div className={`w-5/6 flex flex-col gap-1 border p-2 rounded-lg  `}>
            <div className={`flex items-center justify-between`}>
              <span className="font-semibold">John Doe</span>
              <span className="text-muted-foreground text-sm">4:30 pm</span>
            </div>
            <span>Hey!</span>
          </div>
        </div>
      </div>
      <QueryForm user={user} />
    </div>
  );
}
