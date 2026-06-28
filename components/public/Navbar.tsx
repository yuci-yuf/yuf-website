"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { siteConfig } from "@/lib/content";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const links = siteConfig.navLinks.filter((l) => !l.isCTA);
  const cta = siteConfig.navLinks.find((l) => l.isCTA);

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-surface/85 backdrop-blur-md">
      <nav className="mx-auto flex h-24 max-w-7xl items-center justify-between gap-4 px-6 py-3 lg:px-8">
        <div className="flex items-center gap-3 sm:gap-4 lg:gap-6">
          <Link
            href="/"
            className="flex items-center gap-3 sm:gap-4"
            aria-label={siteConfig.siteName}
          >
            <Image
              src="/images/logo.png"
              alt={siteConfig.siteName}
              width={150}
              height={75}
              className="h-16 w-auto object-contain"
              priority
            />
            <Image
              src="/images/yuci-logo.png"
              alt="Youth United Council of India"
              width={88}
              height={88}
              className="h-16 w-auto object-contain"
              priority
            />
          </Link>

          {/* Ministry of Skill Development & Entrepreneurship credit */}
          <Image
            src="/images/gov-logo.png"
            alt="Ministry of Skill Development and Entrepreneurship, Government of India"
            width={275}
            height={100}
            className="hidden h-16 w-auto object-contain lg:block"
            priority
          />
        </div>

        <div className="flex items-center gap-3 lg:gap-5">
          {/* Desktop nav */}
          <div className="hidden items-center gap-1 lg:flex">
            {links.map((link) => {
              const active = pathname === link.path;
              return (
                <Link
                  key={link.path}
                  href={link.path}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary-50 text-primary-700"
                      : "text-text hover:text-primary-700",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="hidden lg:block">
            {cta && (
              <Button href={cta.path} size="sm" variant="secondary">
                {cta.label}
              </Button>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex items-center justify-center rounded-md p-2 text-text lg:hidden"
            aria-expanded={open}
            aria-label="Toggle navigation menu"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-border bg-surface lg:hidden">
          <div className="flex flex-col gap-1 px-6 py-4">
            {links.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-lg px-4 py-2.5 text-sm font-medium",
                  pathname === link.path
                    ? "bg-primary-50 text-primary-700"
                    : "text-text hover:bg-surface-alt",
                )}
              >
                {link.label}
              </Link>
            ))}
            {cta && (
              <Button
                href={cta.path}
                variant="secondary"
                className="mt-2 w-full"
                onClick={() => setOpen(false)}
              >
                {cta.label}
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
