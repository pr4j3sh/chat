import Create from "./create";
import Delete from "./delete";
import Read from "./read";
import Update from "./update";

export default function Crud() {
  return (
    <>
      <Create />
      <Read />
      <Update />
      <Delete />
    </>
  );
}
