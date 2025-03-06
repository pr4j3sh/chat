import { signInWithEmailAndPassword } from "firebase/auth/cordova";
import { useState } from "react";
import { Link } from "react-router-dom";
import { auth } from "../lib/firebase";
import WithGoogle from "../components/withGoogle";

export default function Signin() {
  const values = {
    email: "",
    password: "",
  };

  const [formData, setFormData] = useState(values);

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      console.log(formData);

      const res = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password,
      );

      const user = res.user;

      console.log(user);

      setFormData(values);
    } catch (error) {
      console.error(error);
    }
  }
  return (
    <section>
      <section>
        <b>Sign In to your account.</b>
        <WithGoogle />
      </section>
      <hr />
      <form method="post" onSubmit={handleSubmit}>
        <input
          type="text"
          name="email"
          placeholder="email@example.com"
          value={formData.email}
          onChange={handleChange}
        />
        <input
          type="password"
          name="password"
          placeholder="your password"
          value={formData.password}
          onChange={handleChange}
        />
        <button type="submit">Sign In</button>
      </form>
      <section>
        <p>
          Do not have an account?{" "}
          <Link className="link" to="/auth/signup">
            Sign Up
          </Link>{" "}
        </p>
        <Link className="link" to="/">
          Go home
        </Link>
      </section>
    </section>
  );
}
