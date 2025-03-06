import { getDocs, collection } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../lib/firebase";

export default function Read() {
  const [texts, setTexts] = useState([]);

  useEffect(() => {
    async function getTexts() {
      const res = await getDocs(collection(db, "texts"));
      const data = res.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setTexts(data);
    }

    getTexts();
  }, []);

  return (
    <>
      <h6>Read</h6>
      {texts.length > 0 ? (
        <table border="1">
          <thead>
            <tr>
              <th>id</th>
              <th>text</th>
            </tr>
          </thead>
          <tbody>
            {texts.map((text) => (
              <tr key={text.id}>
                <td>{text.id}</td>
                <td>{text.text}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No data</p>
      )}
    </>
  );
}
