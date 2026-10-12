"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import {
  UserPlus,
  Mail,
  Lock,
  User,
  LoaderCircle,
} from "lucide-react";

import { authClient } from "@/lib/client";

type SocialProvider = "google" | "github";

export default function SignUpPage() {
  const router = useRouter();

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Loading states
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] =
    useState<SocialProvider | null>(null);

  const isBusy = loading || socialLoading !== null;

  // Create account using email and password
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const userName = name.trim();
    const userEmail = email.trim();

    // Check required fields
    if (!userName || !userEmail || !password) {
      toast.error("সবগুলো তথ্য পূরণ করো।");
      return;
    }

    // Check password length
    if (password.length < 8) {
      toast.error("পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।");
      return;
    }

    setLoading(true);

    try {
      const { error } = await authClient.signUp.email({
        name: userName,
        email: userEmail,
        password,
      });

      if (error) {
        toast.error(error.message || "অ্যাকাউন্ট তৈরি করা যায়নি।");
        return;
      }

      toast.success("অ্যাকাউন্ট তৈরি হয়েছে। এবার সাইন ইন করো।");

      router.push("/signin");
    } catch (error) {
      console.error("Sign up error:", error);
      toast.error("একটি সমস্যা হয়েছে। আবার চেষ্টা করো।");
    } finally {
      setLoading(false);
    }
  }

  // Sign up using Google or GitHub
  async function handleSocialSignUp(provider: SocialProvider) {
    setSocialLoading(provider);

    try {
      const { error } = await authClient.signIn.social({
        provider,
        callbackURL: "/",
        errorCallbackURL: "/signup",
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
    <main className="flex min-h-[75vh] items-center justify-center bg-gray-50 px-4 py-12 sm:px-6">
      <section className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-6 shadow-xl shadow-emerald-900/5 sm:p-8">

        {/* Header */}
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
          <UserPlus size={28} />
        </div>

        <div className="mt-5 text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">
            অ্যাকাউন্ট তৈরি করো
          </h1>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            বাজার দর-এর সঙ্গে যুক্ত হও এবং নিত্যপ্রয়োজনীয়
            পণ্যের দাম এক নজরে দেখো।
          </p>
        </div>

        {/* Sign Up Form */}
        <form onSubmit={handleSubmit} className="mt-7 space-y-5">

          {/* Name */}
          <div>
            <label
              htmlFor="signup-name"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              তোমার নাম
            </label>

            <div className="relative">
              <User
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                id="signup-name"
                type="text"
                autoComplete="name"
                required
                maxLength={80}
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="তোমার পূর্ণ নাম"
                disabled={isBusy}
                className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 disabled:bg-gray-50"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="signup-email"
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
                id="signup-email"
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

          {/* Password */}
          <div>
            <label
              htmlFor="signup-password"
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
                id="signup-password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="কমপক্ষে ৮ অক্ষর"
                disabled={isBusy}
                className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 disabled:bg-gray-50"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isBusy}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3.5 font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading && (
              <LoaderCircle
                size={18}
                className="animate-spin"
              />
            )}

            {loading ? "অ্যাকাউন্ট তৈরি হচ্ছে..." : "সাইন আপ"}
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />

          <span className="text-xs text-gray-400">
            অথবা
          </span>

          <div className="h-px flex-1 bg-gray-200" />
        </div>

        {/* Social Login */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

          {/* Google */}
          <button
            type="button"
            disabled={isBusy}
            onClick={() => handleSocialSignUp("google")}
            className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-gray-200 px-3 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {socialLoading === "google" ? (
              <LoaderCircle
                size={18}
                className="animate-spin"
              />
            ) : (
              <span className="text-base font-extrabold text-blue-600">
                G
              </span>
            )}

            {socialLoading === "google"
              ? "অপেক্ষা করো..."
              : "Google"}
          </button>

          {/* GitHub */}
          <button
            type="button"
            disabled={isBusy}
            onClick={() => handleSocialSignUp("github")}
            className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-gray-200 px-3 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {socialLoading === "github" ? (
              <LoaderCircle
                size={18}
                className="animate-spin"
              />
            ) : (
              <span className="inline-flex size-5 items-center justify-center rounded-full bg-gray-900 text-[10px] font-bold text-white">
                GH
              </span>
            )}

            {socialLoading === "github"
              ? "অপেক্ষা করো..."
              : "GitHub"}
          </button>
        </div>

        {/* Sign In Link */}
        <p className="mt-7 text-center text-sm text-gray-600">
          আগে থেকেই অ্যাকাউন্ট আছে?{" "}

          <Link
            href="/signin"
            className="font-bold text-emerald-700 hover:text-emerald-900"
          >
            সাইন ইন করো
          </Link>
        </p>

      </section>
    </main>
  );
}