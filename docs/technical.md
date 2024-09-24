### **Query App Technical Documentation**

---

## **1. Introduction**

The **Query App** is designed to deliver concise, markdown-formatted responses to user queries using the **GROQ API** and **Llama3-8b-8192** model. This technical documentation provides an in-depth overview of the app's architecture, components, data flow, and deployment strategies.

---

## **2. Technology Stack**

- **Frontend:**

  - **Next.js** (React framework)
  - **Tailwind CSS** (Styling)
  - **React Query** for API data fetching

- **Backend:**

  - **Supabase** (Database and real-time synchronization)
  - **GROQ API** (Querying data)
  - **Llama3-8b-8192** (AI model for generating responses)

- **Other Libraries:**
  - **Moment.js** (Date and time formatting)
  - **markdown** (Markdown to HTML conversion)

---

## **3. System Architecture**

### **3.1 High-Level Diagram**

```
+------------------+              +--------------------+             +-----------------------+
| User Interaction |  ---->       |  Next.js Frontend   |  ---->     |  Supabase (Database,   |
|                  |              |  with GROQ API      |             |  Real-Time Updates)    |
+------------------+              +--------------------+             +-----------------------+
                                                                                      |
                                                                                      v
                                                                     +-----------------------+
                                                                     |  Llama3-8b-8192 AI     |
                                                                     |  (for query responses) |
                                                                     +-----------------------+
```

### **3.2 Key Components**

- **Next.js Frontend:**
  - Handles user input and displays responses in a structured format.
  - Uses Tailwind CSS for responsive design and React hooks for managing state.
- **Supabase Backend:**

  - Stores queries, responses, and user data.
  - Manages real-time updates via Supabase's Postgres changes channels.

- **GROQ API:**

  - Queries the data stored in Supabase and retrieves the AI-generated response via Llama3.

- **Llama3-8b-8192 Model:**
  - Processes user queries and returns markdown-formatted responses.

---

## **4. Data Flow**

### **4.1 Query Input and Submission**

- **User Input:**

  - Users submit a query through the input form in the UI.
  - Queries are handled by a `handleSend` function, which processes and sends the query to the backend.

- **Supabase Interaction:**

  - The `createMessageAction` function triggers a request to Supabase to store the query.
  - The app listens for real-time updates via Supabase's `postgres_changes` channel, so any new queries and responses are synced immediately.

- **GROQ API and Llama3 Integration:**
  - After submitting the query, **GROQ API** fetches the relevant data, and **Llama3** generates a markdown-formatted response.
  - The response is stored in Supabase and then displayed to the user.

### **4.2 Real-Time Updates**

- **Supabase Postgres Changes API:**
  - The app listens for new entries in the `queries` table using the Postgres Changes API.
  - When a new query is inserted into the database, the real-time updates are pushed to the user interface.

### **4.3 Rendering Responses**

- **Markdown Conversion:**
  - The AI model returns responses in markdown format. Using **Markdown-it**, the markdown is converted to HTML before being rendered in the UI.
- **Handling Code Blocks:**
  - If the response contains code blocks, they are styled to avoid overflow using `max-w-full` and `overflow-auto` in Tailwind CSS.

---

## **5. Detailed API and Function Usage**

### **5.1 Supabase Client**

- **Initialization:**

```js
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    },
  );
}
```

- **Query Fetching:**

```js
const { data: queries } = await supabase
  .from("queries")
  .select()
  .eq("userId", user.id);
```

- **Real-Time Updates:**

```js
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
      if (payload.new.userId === userId) {
        setNewQueries((prevQueries: any) => [...prevQueries, payload.new]);
      }
    },
  )
  .subscribe();
```

### **5.2 GROQ API & Llama3 Response**

- **GROQ Action:**

  - `groqAction` is an internal utility that fetches the markdown response from the Llama3-8b-8192 model.
  - The response is then passed to the frontend for rendering.

```js
import Groq from "groq-sdk";

export const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
};
```

```js
export const groqAction = async ({
  query,
  userId,
}: {
  query: string;
  userId: string;
}) => {
  const completion = await groq.chat.completions.create({
    messages: [
      { role: "system", content: "give short, crisp answers" },
      { role: "user", content: query },
    ],
    model: "llama3-8b-8192",
  });

  const res = completion.choices[0].message;

  const supabase = createClient();
  const { data, error } = await supabase.from("queries").insert([
    {
      user: {
        full_name: res.role,
      },
      query: res.content,
      userId,
    },
  ]);

  if (error) {
    throw new Error(error.message);
  }
};
```

### **5.3 Rendering Markdown**

- **markdown Conversion:**

```js
const [htmlResponse, setHtmlResponse] = useState<string>("");

const renderMarkdown = () => {
  const html = marked(markdown);
  setHtmlResponse(html as SetStateAction<string>);
};
```

- **Rendering in JSX:**

```js
<div
  className="max-w-full overflow-auto"
  dangerouslySetInnerHTML={{ __html: htmlResponse }}
/>
```

### **5.4 User Authentication**

- **Supabase Authentication:**
  - Users are authenticated via Supabase, and only authenticated users can submit queries.

```js
const {
  data: { user },
} = await supabase.auth.getUser();
```

---

## **6. Frontend Design**

### **6.1 Responsive Layout**

- **Desktop:**
  - Layout is in `flex-row` for wide screens using Tailwind classes: `flex-row`, `justify-between`.
- **Mobile:**

  - On smaller screens, the layout switches to `flex-col` using responsive utilities: `flex-col`, `w-full`.

  ```html
  <main className="min-h-screen flex flex-col items-center"></main>
  ```

### **6.2 Query and Response UI**

- **Query Input:**

  - A simple input field with a send button:

```js
<Input
  type="text"
  placeholder="Type a query..."
  required
  value={query}
  onChange={(e) => setQuery(e.target.value)}
/>
```

- **Response Block:**
  - The response block uses `overflow-auto` to prevent code overflow:
  ```js
  <div
    className={`flex ${user?.full_name === query?.user?.full_name ? "justify-end" : "justify-start"}`}
  >
    <QueryResponse markdown={query?.query} />
  </div>
  ```

---

## **7. Error Handling**

### **7.1 Form Validation**

- If the user submits an empty query, an error is triggered:

### **7.2 API Errors**

- Errors from GROQ or Supabase APIs are caught and displayed:

```js
try {
  await createMessageAction({ user, query, userId });

  await groqAction({ query, userId });

  console.log("Query and response handled successfully");
} catch (error) {
  console.error("Error handling query:", error);
}
```

---

## **8. Deployment Strategy**

### **8.1 Hosting**

- The app is hosted on **Vercel** due to its seamless integration with Next.js and static site generation.

### **8.2 Continuous Integration**

- Changes pushed to the GitHub repository automatically trigger deployments via Vercel’s **CI/CD pipeline**.

### **8.3 Environment Variables**

- Ensure Supabase credentials and any other API keys are stored securely using **Vercel environment variables**.

```bash
NEXT_PUBLIC_SUPABASE_URL=<url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<key>
GROQ_API_KEY=<key>
REDIRECT_URL=http://localhost:3000
```

---

## **9. Future Enhancements**

1. **Advanced Markdown Features:**

   - Improve markdown support for additional elements like tables and images.

2. **Caching:**

   - Implement caching mechanisms to store frequent queries for faster response times.

3. **User Analytics:**
   - Add functionality to track user interaction and improve AI responses based on popular queries.

---

## **10. Conclusion**

The **Query App** leverages advanced AI technology, GROQ querying, and Supabase’s real-time capabilities to create a responsive and efficient tool for delivering short, relevant answers to user queries. By optimizing the frontend for developers and general users, and providing markdown-rendered content, the app stands out as a powerful solution for concise information retrieval.
