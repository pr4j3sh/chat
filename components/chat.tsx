"use client";

import { useEffect, useState } from "react";
import moment from "moment";
import { createClient } from "@/utils/supabase/client";

export default function Chat({ user, queries }) {
  const supabase = createClient();

  const [newQueries, setNewQueries] = useState(queries);

  useEffect(() => {
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    }, 0);
  }, [newQueries]);

  useEffect(() => {
    const channel = supabase
      .channel("realtime queries")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "queries",
        },
        (payload) => {
          setNewQueries((prevQueries) => [...prevQueries, payload.new]);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, queries, setNewQueries]);

  return (
    <>
      {newQueries?.map((query) => (
        <div
          key={query?.id}
          className={`flex ${user?.full_name === query?.user?.full_name ? "justify-end" : "justify-start"}`}
        >
          <div className={`w-5/6 flex flex-col gap-2 border p-4 rounded-lg`}>
            <div
              className={`flex ${user?.full_name === query?.user?.full_name ? "flex-row-reverse" : "flex-row"}  items-center justify-between`}
            >
              <span className="font-semibold">{query?.user?.full_name}</span>
              <span className="text-muted-foreground text-sm">
                {moment(query?.created_at).format("MMM D, YYYY | h:mm a")}
              </span>
            </div>
            <span
              className={`flex ${user?.full_name === query?.user?.full_name ? "justify-end" : "justify-start"}`}
            >
              {query?.query}
            </span>
          </div>
        </div>
      ))}
    </>
  );
}
