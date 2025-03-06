import { signOut } from "firebase/auth";
import Crud from "../components/crud";
import { auth } from "../lib/firebase";
import { useDispatch, useSelector } from "react-redux";
import { resetUser } from "../features/user/userSlice";

export default function Dashboard() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);

  async function handleLogout() {
    try {
      await signOut(auth);
      dispatch(resetUser());
    } catch (error) {
      console.error(error);
    }
  }
  return (
    <section>
      <article>
        <b>Hey {user?.name || user?.email},</b>
        <p>Welcome to your Dashboard. Create, read, update and delete data.</p>
      </article>
      <span>
        <button className="danger" onClick={handleLogout}>
          Logout
        </button>
      </span>
      <hr />
      <Crud />
    </section>
  );
}
