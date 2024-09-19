export default function Header() {
  return (
    <div className="flex flex-col gap-8 items-center">
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
        Query
      </h1>
      <h2 className="scroll-m-20 pb-2 md:text-3xl font-semibold text-center tracking-tight first:mt-0">
        Get answers. Fast. No fluff.
      </h2>
      <div className="w-full p-[1px] bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />
      <p className="leading-7 md:w-3/6 text-center [&:not(:first-child)]:mt-6">
        sleek app integrated with OpenAI that delivers precise, concise answers
        to your questions. Forget lengthy explanations and get straight to the
        point with instant, short responses tailored to your needs.
      </p>
    </div>
  );
}
