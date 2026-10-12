
"use client";

import { Suspense, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { Lock, Mail, LogIn, LoaderCircle } from "lucide-react";

import { authClient } from "@/lib/client";

import { useParams } from "next/navigation";

type SocialProvider = "google" | "github";

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] =
    useState<SocialProvider | null>(null);

  const isBusy = loading || socialLoading !== null;

  // Keep the requested destination after login.
  // Only allow local paths to prevent open redirects.
  const requestedCallback = searchParams.get("callbackURL");

  const redirectTo =
    requestedCallback?.startsWith("/") &&
    !requestedCallback.startsWith("//") &&
    !requestedCallback.includes("\\")
      ? requestedCallback
      : "/";

  // Email and password login
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const userEmail = email.trim();

    if (!userEmail || !password) {
      toast.error("ইমেইল ও পাসওয়ার্ড দাও।");
      return;
    }

    setLoading(true);

    try {
      const { error } = await authClient.signIn.email({
        email: userEmail,
        password,
      });

      if (error) {
        toast.error(error.message || "ইমেইল বা পাসওয়ার্ড ভুল।");
        return;
      }

      toast.success("সফলভাবে সাইন ইন হয়েছে!");

      router.replace(redirectTo);
      router.refresh();
    } catch (error) {
      console.error("Sign in error:", error);
      toast.error("লগইন করা যায়নি। আবার চেষ্টা করো।");
    } finally {
      setLoading(false);
    }
  }

  // Google and GitHub login
  async function handleSocialSignIn(provider: SocialProvider) {
    setSocialLoading(provider);

    try {
      const { error } = await authClient.signIn.social({
        provider,
        callbackURL: redirectTo,
        errorCallbackURL: "/signin",
      });

      if (error) {
        toast.error(error.message || "Social Login ব্যর্থ হয়েছে।");
      }
    } catch (error) {
      console.error(`${provider} login error:`, error);
      toast.error("Social Login শুরু করা যায়নি।");
    } finally {
      setSocialLoading(null);
    }
  }

  return (
    <main className="flex min-h-[75vh] items-center justify-center bg-gray-50 px-4 py-10 sm:px-6 sm:py-14">
      <section className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-6 shadow-xl shadow-emerald-900/5 sm:p-8">
        {/* Page Header */}
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
          <LogIn size={28} />
        </div>

        <div className="mt-5 text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">
            আবার স্বাগতম
          </h1>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            তোমার অ্যাকাউন্টে সাইন ইন করে বাজারদর দেখো।
          </p>
        </div>

        {/* Email and Password Form */}
        <form onSubmit={handleSubmit} className="mt-7 space-y-5">
          {/* Email Input */}
          <div>
            <label
              htmlFor="signin-email"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              ইমেইল অ্যাড্রেস
            </label>

            <div className="relative">
              <Mail
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                id="signin-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@example.com"
                disabled={isBusy}
                className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 disabled:bg-gray-50"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label
              htmlFor="signin-password"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              পাসওয়ার্ড
            </label>

            <div className="relative">
              <Lock
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                id="signin-password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="তোমার পাসওয়ার্ড"
                disabled={isBusy}
                className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 disabled:bg-gray-50"
              />
            </div>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={isBusy}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3.5 font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading && (
              <LoaderCircle size={18} className="animate-spin" />
            )}

            {loading ? "সাইন ইন হচ্ছে..." : "সাইন ইন"}
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />

          <span className="text-xs text-gray-400">অথবা</span>

          <div className="h-px flex-1 bg-gray-200" />
        </div>

        {/* Social Login Buttons */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* Google Login */}
          <button
            type="button"
            disabled={isBusy}
            onClick={() => handleSocialSignIn("google")}
            className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-gray-200 px-3 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {socialLoading === "google" ? (
              <LoaderCircle size={18} className="animate-spin" />
            ) : (
              <span className="text-base font-extrabold text-blue-600">
                G
              </span>
            )}

            {socialLoading === "google"
              ? "অপেক্ষা করো..."
              : "Google দিয়ে সাইন ইন"}
          </button>

          {/* GitHub Login */}
          <button
            type="button"
            disabled={isBusy}
            onClick={() => handleSocialSignIn("github")}
            className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-gray-200 px-3 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {socialLoading === "github" ? (
              <LoaderCircle size={18} className="animate-spin" />
            ) : (
              <span className="inline-flex size-5 items-center justify-center rounded-full bg-gray-900 text-[10px] font-bold text-white">
                GH
              </span>
            )}

            {socialLoading === "github"
              ? "অপেক্ষা করো..."
              : "GitHub দিয়ে সাইন ইন"}
          </button>
        </div>

        {/* Sign Up Link */}
        <p className="mt-7 text-center text-sm text-gray-600">
          নতুন ব্যবহারকারী?{" "}
          <Link
            href="/signup"
            className="font-bold text-emerald-700 hover:text-emerald-900"
          >
            অ্যাকাউন্ট তৈরি করো
          </Link>
        </p>
      </section>
    </main>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[75vh] items-center justify-center bg-gray-50 px-4 text-gray-500">
          সাইন-ইন পেজ লোড হচ্ছে...
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  );
}
