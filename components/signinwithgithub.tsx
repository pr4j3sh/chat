import { signInWithGithubAction } from "@/app/actions";
import { Button } from "./ui/button";
import { FaGithub } from "react-icons/fa";

export default function SignInWithGithub() {
  return (
    <Button
      className="flex-1"
      variant="outline"
      type="button"
      onClick={() => signInWithGithubAction()}
    >
      <FaGithub className="mr-2 h-4 w-4" /> <span>GitHub</span>
    </Button>
  );
}
