export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white px-6 text-center">
      
      <h1 className="text-6xl font-bold mb-6">404</h1>

      <p className="text-2xl italic mb-4">
        “Page not found.”
      </p>

      <p className="text-lg text-zinc-400 max-w-xl mb-8">
        “But you are not lost to Jesus.”
      </p>

      {/* <p className="text-sm text-zinc-500 mb-10">
        — Matthew 7:13-14 (Inspired)
      </p> */}

      <a
        href="/"
        className="px-6 py-3 border border-white rounded-xl hover:bg-white hover:text-black transition"
      >
        Return to the Light
      </a>
    </div>
  );
}