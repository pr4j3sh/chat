import Link from "next/link";
import { Button } from "./ui/button";
import { UserIcon } from "lucide-react";
import { ThemeSwitcher } from "./theme-switcher";
import { createClient } from "@/utils/supabase/server";

export default async function AuthButton() {
  const {
    data: { user },
  } = await createClient().auth.getUser();

  return user ? (
    <div className="flex items-center gap-4">
      <ThemeSwitcher />
      <Button asChild variant="outline" size="icon">
        <Link href="/protected/profile">
          <UserIcon className="h-4 w-4" />
        </Link>
      </Button>
    </div>
  ) : (
    <div className="flex gap-2">
      <ThemeSwitcher />
      <Button asChild size="sm" variant={"outline"}>
        <Link href="/sign-in">Sign in</Link>
      </Button>
      <Button asChild size="sm" variant={"default"}>
        <Link href="/sign-up">Sign up</Link>
      </Button>
    </div>
  );
}
