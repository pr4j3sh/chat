import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, google } from "../lib/firebase";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setUser } from "../features/user/userSlice";

export default function WithGoogle() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  async function handleSignin() {
    try {
      const res = await signInWithPopup(auth, google);
      const credential = GoogleAuthProvider.credentialFromResult(res);
      const token = credential.accessToken;
      const user = res.user;
      console.log({ token, user });

      dispatch(
        setUser({
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          accessToken: user.accessToken,
        }),
      );
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
    }
  }
  return <button onClick={handleSignin}>Continue with Google</button>;
}
