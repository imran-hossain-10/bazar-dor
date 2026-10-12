"use client";

import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { LogOut, UserRound } from "lucide-react";

import { authClient } from "@/lib/client";
import { getCategories } from "@/lib/api";
import type { Category } from "@/types/bazardor";

import logo from "@/asset/logo-icon.png";

function NavbarContent() {
  const pathname = usePathname();
  const router = useRouter();

  const { data: session, isPending } = authClient.useSession();

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [today, setToday] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  
  useEffect(() => {
    const date = new Intl.DateTimeFormat("bn-BD", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date());

    setToday(date);

    let active = true;

    async function loadCategories() {
      try {
        const data = await getCategories();

        if (active) {
          setCategories(data);
        }
      } catch (error) {
        console.error("Category loading error:", error);

        if (active) {
          setCategories([]);
        }
      } finally {
        if (active) {
          setCategoryLoading(false);
        }
      }
    }

    loadCategories();

    return () => {
      active = false;
    };
  }, []);

  // Logout Function
  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      const { error } = await authClient.signOut();

      if (error) {
        toast.error(error.message || "লগআউট করা যায়নি।");
        return;
      }

      toast.success("সফলভাবে লগআউট হয়েছে।");

      router.replace("/");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("লগআউট করতে সমস্যা হয়েছে।");
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <header className="w-full border-b border-emerald-100 bg-white/95 backdrop-blur-md">

      {/* Logo, Date and Authentication */}
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-3 py-3 sm:px-6 lg:px-8">

        {/* Logo */}
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2 sm:gap-3"
        >
          <Image
            src={logo}
            alt="বাজার দর লোগো"
            width={55}
            height={55}
            className="size-10 shrink-0 object-contain sm:size-14"
            priority
          />

          <div className="min-w-0">
            <h1 className="text-lg font-extrabold text-emerald-800 sm:text-2xl">
              বাজার দর
            </h1>

            <p className="mt-1 text-[10px] text-gray-500 sm:text-xs">
              {today || "প্রতিদিনের বাজারদর"}
            </p>
          </div>
        </Link>

        {/* Authentication */}
        <div className="flex shrink-0 items-center gap-2">

          {isPending ? (
            <div className="h-9 w-24 animate-pulse rounded-lg bg-gray-100" />
          ) : session?.user ? (
            <>
              {/* User Profile Link */}
              <Link
                href="/profile"
                title="আমার প্রোফাইল"
                aria-label="আমার প্রোফাইল"
                aria-current={
                  pathname === "/profile" ? "page" : undefined
                }
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  pathname === "/profile"
                    ? "bg-emerald-700 text-white"
                    : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                }`}
              >
                <UserRound size={18} />

                <span className="hidden max-w-32 truncate sm:inline">
                  {session.user.name || "আমার প্রোফাইল"}
                </span>
              </Link>

              {/* Logout Button */}
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60 sm:text-sm"
              >
                <LogOut size={16} />

                <span>
                  {loggingOut ? "অপেক্ষা..." : "লগআউট"}
                </span>
              </button>
            </>
          ) : (
            <>
              {/* Sign In */}
              <Link
                href="/signin"
                className="rounded-lg border border-emerald-700 px-3 py-2 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-50 sm:px-4 sm:text-sm"
              >
                সাইন ইন
              </Link>

              {/* Sign Up */}
              <Link
                href="/signup"
                className="rounded-lg bg-emerald-700 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-800 sm:px-4 sm:text-sm"
              >
                সাইন আপ
              </Link>
            </>
          )}

        </div>
      </div>

      {/* Category Navigation */}
      <nav
        aria-label="পণ্যের ক্যাটাগরি"
        className="border-t border-gray-100"
      >
        <div className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto px-3 py-2 sm:px-6 lg:px-8">

          {/* All Products */}
          <Link
            href="/"
            aria-current={pathname === "/" ? "page" : undefined}
            className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition sm:text-sm ${
              pathname === "/"
                ? "bg-emerald-700 text-white"
                : "text-gray-600 hover:bg-emerald-50"
            }`}
          >
            সব পণ্য
          </Link>

          
          {categoryLoading ? (
            <span className="shrink-0 px-4 py-2 text-xs text-gray-500 sm:text-sm">
              ক্যাটাগরি লোড হচ্ছে...
            </span>
          ) : (
            categories.map((category) => {
              const active =
                pathname === `/category/${category.slug}` ||
                pathname === `/category/${category.id}`;

              return (
                <Link
                  key={category.id}
                  href={`/category/${category.slug}`}
                  aria-current={active ? "page" : undefined}
                  className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition sm:text-sm ${
                    active
                      ? "bg-emerald-700 text-white"
                      : "text-gray-600 hover:bg-emerald-50"
                  }`}
                >
                  {category.icon} {category.nameBn}
                </Link>
              );
            })
          )}

        </div>
      </nav>
    </header>
  );
}

export default function Navbar() {
  return (
    <Suspense
      fallback={
        <header className="w-full border-b border-emerald-100 bg-white/95">
          <div className="mx-auto h-20 max-w-7xl px-4 sm:px-6 lg:px-8" />
        </header>
      }
    >
      <NavbarContent />
    </Suspense>
  );
}