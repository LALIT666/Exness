import { BarChart3, Globe, Shield, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const stats = [
  { value: "1.2M+", label: "Trades Executed" },
  { value: "180+", label: "Markets Supported" },
  { value: "<90ms", label: "Avg Execution Time" },
  { value: "$3.4B", label: "Total Volume" },
  { value: "99.98%", label: "Platform Uptime" },
];

const platforms = [
  "MetaTrader 4",
  "MetaTrader 5",
  "TradingView",
  "Web Terminal",
  "Mobile Apps",
];

const chartBars = [
  30, 45, 52, 41, 68, 72, 64, 80, 77, 88, 79, 93, 85, 100, 95, 110, 103, 115,
  107, 120,
];

const advantages = [
  {
    icon: Zap,
    title: "Ultra Fast Execution",
    copy: "Orders processed instantly with high-performance infrastructure.",
  },
  {
    icon: Shield,
    title: "Secure Infrastructure",
    copy: "Advanced encryption and account protection at every level.",
  },
  {
    icon: BarChart3,
    title: "Real-Time Analytics",
    copy: "Track performance and risk with intelligent insights.",
  },
  {
    icon: Globe,
    title: "Global Market Access",
    copy: "Trade crypto, forex, and commodities worldwide.",
  },
];

export default function Homepage() {
  return (
    <div className="min-h-screen bg-white text-neutral-900">
      {/* Header */}
      <header className="border-b border-neutral-200">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="text-lg font-semibold tracking-tight">
            Exness
          </Link>

          <nav className="hidden items-center gap-8 text-sm text-neutral-600 md:flex">
            <Link to="/">Overview</Link>
            <Link to="/trading">Markets</Link>
            <Link to="/signin">Sign In</Link>
          </nav>

          <Link
            to="/trading"
            className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
          >
            Open Account
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 py-28 text-center">
        <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl">
          Trade Smarter.
          <br />
          Move Faster.
        </h1>

        <p className="mt-6 text-lg text-neutral-600">
          A minimal trading platform built for clarity, performance, and
          professional execution.
        </p>

        <div className="mt-10 flex justify-center gap-4">
          <Link
            to="/trading"
            className="rounded-md bg-black px-6 py-3 text-sm font-medium text-white hover:bg-neutral-800"
          >
            Launch Terminal
          </Link>

          <button className="rounded-md border border-neutral-300 px-6 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-100">
            View Demo
          </button>
        </div>
      </section>

      {/* Stats */}
      <section className="border-t border-neutral-200">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-16 text-center sm:grid-cols-2 lg:grid-cols-5">
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className="text-3xl font-semibold">{stat.value}</p>
              <p className="mt-2 text-sm text-neutral-600">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Platforms */}
      <section className="border-t border-neutral-200">
        <div className="mx-auto max-w-6xl px-6 py-12 text-center">
          <p className="text-xs font-medium uppercase tracking-widest text-neutral-500">
            Supported Platforms
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-base font-medium text-neutral-500">
            {platforms.map((p) => (
              <span key={p}>{p}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Market Activity */}
      <section className="border-t border-neutral-200">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h3 className="mb-6 text-sm font-medium uppercase tracking-wider text-neutral-500">
            Live Market Activity
          </h3>

          <div className="flex h-24 items-end gap-1">
            {chartBars.map((height, i) => (
              <div
                key={i}
                className="flex-1 rounded-t-sm bg-neutral-300"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Advantages */}
      <section className="border-t border-neutral-200">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight">
              Built for Performance
            </h2>
            <p className="mt-4 text-neutral-600">
              Professional tools designed for modern traders.
            </p>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {advantages.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="rounded-lg border border-neutral-200 p-6"
                >
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 text-neutral-700">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-medium">{item.title}</h3>
                  <p className="mt-2 text-sm text-neutral-600">{item.copy}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-neutral-200 bg-neutral-50">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <h2 className="text-3xl font-semibold">Ready to Begin?</h2>

          <p className="mt-4 text-neutral-600">
            Join thousands of traders building smarter strategies.
          </p>

          <div className="mt-8">
            <Link
              to="/trading"
              className="rounded-md bg-black px-6 py-3 text-sm font-medium text-white hover:bg-neutral-800"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-200">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-neutral-600 md:flex-row">
          <div>© 2026 Exness. Built for traders.</div>

          <div className="flex gap-6">
            <a href="#" className="hover:text-neutral-900 transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-neutral-900 transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-neutral-900 transition-colors">
              Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
