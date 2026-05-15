import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* Left Section */}
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-black text-white text-sm font-semibold">
            E
          </div>
          <span className="text-lg font-semibold tracking-tight">Exness</span>
        </div>

        {/* Center Navigation */}
        <div className="hidden md:flex items-center gap-8 text-sm text-neutral-600">
          <Link to="/" className="hover:text-neutral-900 transition-colors">
            Overview
          </Link>

          <Link
            to="/trading"
            className="hover:text-neutral-900 transition-colors"
          >
            Markets
          </Link>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          <Link
            to="/signup"
            className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            Sign up
          </Link>

          <Link
            to="/trading"
            className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 transition-colors"
          >
            Open Account
          </Link>
        </div>
      </div>
    </nav>
  );
}
