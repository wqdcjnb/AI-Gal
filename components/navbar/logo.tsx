import Link from "next/link"

export const Logo = () => (
  <Link href="/" className="flex items-center gap-2.5">
    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
      <span className="text-white font-bold text-sm">AG</span>
    </div>
    <span className="font-semibold text-base">AI-Gal</span>
  </Link>
)
