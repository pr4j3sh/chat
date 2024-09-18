import { signInWithGoogleAction } from "@/app/actions";
import { Button } from "./ui/button";
import { FcGoogle } from "react-icons/fc";

export default function SignInWithGoogle() {
  return (
    <Button
      className="flex-1"
      variant="outline"
      type="button"
      onClick={() => signInWithGoogleAction()}
    >
      <FcGoogle className="mr-2 h-4 w-4" /> <span>Google</span>
    </Button>
  );
}
