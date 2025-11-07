// app/layouts/DashboardLayout.tsx

"use client";

import { ReactNode, useState } from "react";
import { Navbar } from "@/components/rnavbar";
import {
  NavBody,
  NavbarLogo,
  NavItems,
  NavbarButton,
  MobileNav,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/rnavbar";
import { BackgroundBeams } from "@/components/BackgroundBeams";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-indigo-950 text-white overflow-hidden">
      <Navbar className="bg-transparent border-b border-white/10 shadow-md backdrop-blur">
        <NavBody visible>
          <NavbarLogo />
          <NavItems
            items={[
              { name: "Dashboard", link: "/dashboard" },
              { name: "Create Habit", link: "/dashboard/create" },
              { name: "History", link: "/history" },
              { name: "Onboarding", link: "/onboarding" },
              { name: "Export", link: "/dashboard/export" },
            ]}
          />
          <NavbarButton href="/login" variant="dark">
            Log Out
          </NavbarButton>
        </NavBody>

        <MobileNav visible>
          <MobileNavHeader>
            <NavbarLogo />
            <MobileNavToggle isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} />
          </MobileNavHeader>
          <MobileNavMenu isOpen={isOpen} onClose={() => setIsOpen(false)}>
            <NavItems
              items={[
                { name: "Dashboard", link: "/dashboard" },
                { name: "Create Habit", link: "/dashboard/create" },
                { name: "History", link: "/history" },
                { name: "Onboarding", link: "/onboarding" },
                { name: "Export", link: "/dashboard/export" },
              ]}
            />
            <NavbarButton href="/login" variant="dark">
              Log Out
            </NavbarButton>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>

      <BackgroundBeams className="pointer-events-none z-0" />

      <div className="relative z-10 pt-28 px-4">{children}</div>
    </main>
  );
}