import QueryForm from "@/components/query-form";
import { createClient } from "@/utils/supabase/server";
import Chat from "@/components/chat"; // Import client-side list component
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  const { data: queries } = await supabase
    .from("queries")
    .select()
    .eq("userId", user.id);

  return (
    <div className="flex-grow w-full flex flex-col gap-12">
      <div className="flex-grow flex flex-col gap-y-4">
        <Chat userId={user?.id} user={user?.user_metadata} queries={queries} />{" "}
      </div>
      <QueryForm user={user?.user_metadata} userId={user?.id} />
    </div>
  );
}
