import ModeToggle from "./mode-toggle";

export default function Navbar({ site }) {
  return (
    <nav>
      <a href="/" className="font-semibold">
        {site?.REPO}
      </a>
      <ul className="btns">
        <ModeToggle />
      </ul>
    </nav>
  );
}
