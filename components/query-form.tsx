"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SendHorizontalIcon } from "lucide-react";
import { createMessageAction, groqAction } from "@/app/actions";

export default function QueryForm({ user, userId }) {
  const inputRef = useRef(null);
  const [query, setQuery] = useState("");

  const handleSend = async () => {
    try {
      await createMessageAction({ user, query, userId });

      await groqAction({ query, userId });

      console.log("Query and response handled successfully");
    } catch (error) {
      console.error("Error handling query:", error);
    }

    setQuery(""); // Clear input field after sending
  };

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === "/") {
        event.preventDefault(); // Prevent default `/` behavior
        inputRef.current?.focus(); // Focus the input field
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  return (
    <form
      className="sticky bottom-2 z-100 bg-background"
      onSubmit={(e) => {
        e.preventDefault();
        handleSend();
      }}
    >
      <div className="flex gap-2 my-2">
        <Input
          ref={inputRef}
          type="text"
          placeholder="Press '/' to focus..."
          required
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button variant="outline" size="icon" type="submit">
          <SendHorizontalIcon className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
