"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SendHorizontalIcon } from "lucide-react";
import { createMessageAction, groqAction } from "@/app/actions";

export default function QueryForm({
  user,
  userId,
}: {
  user: any;
  userId: string;
}) {
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
          type="text"
          placeholder="Type a query..."
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
