# Query App

## Overview

Query App is a simple, efficient application designed to provide short and crisp answers to user queries using the GROQ API and the Llama3-8b-8192 model. It helps users, particularly students, quickly access the information they need without the burden of lengthy responses.

## Features

- **Instant Answers**: Get precise answers to your queries in real-time.
- **User-Friendly Interface**: Simple and intuitive design for ease of use.
- **Real-Time Updates**: Supports real-time conversation updates with PostgreSQL integration.

## Technologies Used

- **Frontend**: [Next.js](https://nextjs.org/)
- **Backend**: [GROQ API](https://groq.com/)
- **AI Model**: [Llama3-8b-8192](https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct)
- **Database**: [Supabase](https://supabase.com/)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/prajeshElEvEn/query.git
   cd query
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables (create a `.env.local` file):

   ```plaintext
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   GROQ_API_KEY=your_groq_api_key
   REDIRECT_URL=http://localhost:3000
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Usage

1. Open the app in your browser: `http://localhost:3000`.
2. Receive a concise response immediately.
