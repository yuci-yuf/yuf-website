"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowRight } from "lucide-react";
import { siteConfig } from "@/lib/content";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const links = siteConfig.navLinks.filter((l) => !l.isCTA);
  const cta = siteConfig.navLinks.find((l) => l.isCTA);

  return (
    <>
      <header
        className={cn(
          "fixed left-0 right-0 top-0 z-50 border-b border-border bg-white transition-shadow duration-300",
          scrolled ? "shadow-sm" : "",
        )}
      >
        <nav className="mx-auto flex max-w-[96rem] items-center justify-between px-6 py-3 lg:px-10">
          {/* Logo cluster */}
          <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label={siteConfig.siteName}>
            <Image
              src="/images/logo.png"
              alt={siteConfig.siteName}
              width={120}
              height={60}
              className="h-12 w-auto object-contain sm:h-14"
              priority
            />
            <span className="h-8 w-px bg-border sm:h-10" aria-hidden />
            <Image
              src="/images/yuci-logo.png"
              alt="YUCI"
              width={48}
              height={48}
              className="h-12 w-auto object-contain sm:h-14"
              priority
            />
          </Link>

          {/* Desktop links — centered */}
          <div className="hidden items-center gap-1 lg:flex">
            {links.map((link) => {
              const active = pathname === link.path;
              return (
                <Link
                  key={link.path}
                  href={link.path}
                  className={cn(
                    "rounded-full px-4 py-2 text-[13.5px] font-medium transition-colors",
                    active
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-500 hover:text-gray-900",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right: CTA + hamburger */}
          <div className="flex items-center gap-3">
            {cta && (
              <Link
                href={cta.path}
                className="group hidden items-center gap-1.5 rounded-full bg-primary-600 px-5 py-2.5 text-[13px] font-semibold text-white shadow-sm transition-all hover:bg-primary-700 hover:shadow-md lg:inline-flex"
              >
                {cta.label}
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            )}
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-gray-600 transition-colors hover:bg-gray-100 lg:hidden"
              aria-label="Toggle menu"
              aria-expanded={open}
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile drawer overlay */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="fixed left-0 right-0 top-16 z-50 border-b border-border bg-white p-6 shadow-lg lg:hidden"
            >
              <div className="flex flex-col gap-1">
                {links.map((link) => (
                  <Link
                    key={link.path}
                    href={link.path}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "rounded-xl px-4 py-3 text-[15px] font-medium transition-colors",
                      pathname === link.path
                        ? "bg-gray-50 text-gray-900"
                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900",
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
                {cta && (
                  <Link
                    href={cta.path}
                    onClick={() => setOpen(false)}
                    className="mt-3 flex h-12 items-center justify-center rounded-xl bg-primary-600 text-[15px] font-semibold text-white transition-colors hover:bg-primary-700"
                  >
                    {cta.label}
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
