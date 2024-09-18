import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/utils/supabase/server";
import { signOutAction } from "@/app/actions";

export default async function Profile() {
  const {
    data: { user },
  } = await createClient().auth.getUser();

  return (
    <Card className="w-full">
      <CardHeader>
        <Avatar>
          <AvatarImage src={user?.user_metadata?.avatar_url} />
          <AvatarFallback>
            {user?.user_metadata?.full_name?.at(0)?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <CardTitle>{user?.user_metadata?.full_name}</CardTitle>
        <CardDescription>{user?.user_metadata?.email}</CardDescription>
      </CardHeader>
      <CardFooter className="flex justify-between">
        <form action={signOutAction}>
          <Button variant="destructive">Sign out</Button>
        </form>
      </CardFooter>
    </Card>
  );
}
