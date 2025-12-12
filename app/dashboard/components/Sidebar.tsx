"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Measure", href: "/measure"},
    { name: "Analytics", href: "/analytics" },
    { name: "KardiaAI", href: "/ai"},
    { name: "About", href: "/about"},
  ];

  return (
    <aside className="w-60 h-screen bg-white shadow-xl border-r fixed left-0 top-0 flex flex-col p-6">
      <Image
        src="/kardia-logo.png"
        alt="Kardia Logo"
        width={120}
        height={120}
        className="mb-8"
      />

      <nav className="flex flex-col gap-2 mb-10">
        {navItems.map((item) => {
          const active = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg text-lg transition
                ${
                  active
                    ? "bg-blue-100 text-blue-600 font-semibold"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
            >
              {/* <span className="text-xl">{item.icon}</span> */}
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-4">
        <form action="/api/auth/logout" method="POST">
          <button
            type="submit"
            className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-center"
          >
            Logout
          </button>
        </form>

        <div className="text-sm text-gray-400 text-center">
          © {new Date().getFullYear()} Kardia
        </div>
      </div>
    </aside>
  );
}
