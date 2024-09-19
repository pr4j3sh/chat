import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

const baseURL = process.env.AI_BASE_URL;
const apiKey = process.env.OPENAI_API_KEY;

const openai = new OpenAI({
  apiKey,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "POST") {
    try {
      const { query } = req.body;
      console.log(query);
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "Give short, crisp answers" },
          { role: "user", content: query },
        ],
        temperature: 0.7,
        max_tokens: 256,
      });
      console.log(completion);
      res.status(200).json({ message: completion.choices[0].message });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
