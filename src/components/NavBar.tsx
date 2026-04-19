"use client";

import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { Zap } from "lucide-react";

interface NavBarProps {
  showBack?: boolean;
  backHref?: string;
  backLabel?: string;
}

export function NavBar({ showBack, backHref = "/", backLabel = "Back" }: NavBarProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center
            group-hover:shadow-lg group-hover:shadow-purple-500/30 transition-all duration-200">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg gradient-text">Briefit</span>
        </Link>

        <div className="flex items-center gap-3">
          {showBack && backHref && (
            <Link
              href={backHref}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors px-4 py-2 rounded-lg hover:bg-white/10"
            >
              {backLabel}
            </Link>
          )}
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
