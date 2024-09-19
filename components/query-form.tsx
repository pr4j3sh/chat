"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SendHorizontalIcon } from "lucide-react";

export default function QueryForm({ user }) {
  const [query, setQuery] = useState("");

  const handleSend = async () => {
    try {
      const formData = JSON.stringify({ user, query });
      const response = await fetch("/api/openai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: formData,
      });

      const data = await response.json();
      console.log("Response:", data);
    } catch (error) {
      console.error("Error sending query:", error);
    }

    setQuery("");
  };

  return (
    <form
      className="sticky bottom-2 z-100 bg-background"
      onSubmit={(e) => {
        e.preventDefault();
        handleSend();
      }}
    >
      <div className="flex gap-2 [&>input]:mb-3 mt-8">
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
