
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { User, LogOut } from "lucide-react";
import toast from "react-hot-toast";

import { authClient } from "@/lib/client";

export default function ProfilePage() {
  const router = useRouter();

  const { data: session, isPending, refetch } = authClient.useSession();
  const user = session?.user;

  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // সেশন থেকে নাম ফর্মে বসিয়ে দেওয়া
  useEffect(() => {
    if (user?.name) setName(user.name);
  }, [user?.name]);

  // লগইন না থাকলে রিডাইরেক্ট
  useEffect(() => {
    if (!isPending && !user) {
      router.replace("/signin");
    }
  }, [isPending, user, router]);

  // নাম আপডেট
  async function handleSave(event: React.FormEvent) {
    event.preventDefault();

    const newName = name.trim();

    if (!newName) {
      toast.error("আপনার নাম লিখুন।");
      return;
    }

    if (newName.length < 2) {
      toast.error("নাম কমপক্ষে ২ অক্ষরের হতে হবে।");
      return;
    }

    if (newName === user?.name) return;

    setSaving(true);

    try {
      const { error } = await authClient.updateUser({ name: newName });

      if (error) {
        toast.error(error.message || "নাম আপডেট করা যায়নি।");
        return;
      }

      await refetch();
      toast.success("আপনার নাম সফলভাবে আপডেট হয়েছে।");
      router.refresh();
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error("নাম আপডেট করতে সমস্যা হয়েছে।");
    } finally {
      setSaving(false);
    }
  }

  // সাইন আউট
  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      const { error } = await authClient.signOut();

      if (error) {
        toast.error(error.message || "সাইন আউট করা যায়নি।");
        return;
      }

      toast.success("সফলভাবে সাইন আউট হয়েছে।");
      router.replace("/");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("সাইন আউট করতে সমস্যা হয়েছে।");
    } finally {
      setLoggingOut(false);
    }
  }

  if (isPending) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <p className="text-lg font-medium text-[#058a3e]">
          প্রোফাইল লোড হচ্ছে...
        </p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-[80vh] bg-[#f0f4f0] px-4 py-8">
      <div className="mx-auto max-w-3xl">
        {/* পেজ হেডিং */}
        <div className="mb-5">
          <h1 className="text-3xl font-bold text-[#17211b]">আমার প্রোফাইল</h1>
          <p className="mt-1 text-sm text-gray-600">
            আপনার অ্যাকাউন্টের তথ্য এখানে দেখুন।
          </p>
        </div>

        {/* প্রোফাইল কার্ড */}
        <section className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-[#e1e7e1] bg-[#fafcfa] p-6">
          <div className="flex min-w-0 items-center gap-5">
            <div className="flex size-[88px] shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gray-100">
              {user.image ? (
                <Image
                  src={user.image}
                  alt={user.name || "ব্যবহারকারী"}
                  width={88}
                  height={88}
                  unoptimized
                  className="h-full w-full object-cover"
                />
              ) : (
                <User size={40} className="text-[#058a3e]" />
              )}
            </div>

            <div className="min-w-0">
              <h2 className="truncate text-xl font-semibold text-[#17211b]">
                {user.name || "ব্যবহারকারী"}
              </h2>
              <p className="mt-1 break-all text-base text-gray-500">
                {user.email}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center gap-2 rounded-lg border border-red-500 px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
          >
            <LogOut size={16} />
            {loggingOut ? "অপেক্ষা করুন..." : "সাইন আউট"}
          </button>
        </section>

        {/* তথ্য কার্ড */}
        <section className="rounded-3xl border border-[#e1e7e1] bg-[#fafcfa] p-6 pb-10">
          <h2 className="text-lg font-semibold text-[#17211b]">তথ্য</h2>

          <form onSubmit={handleSave} className="mt-6 px-6">
            <label
              htmlFor="profile-name"
              className="mb-1 block text-sm font-medium text-[#17211b]"
            >
              নাম
            </label>

            <input
              id="profile-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={100}
              disabled={saving}
              placeholder="আপনার নাম লিখুন"
              className="w-full rounded-xl border border-gray-300 bg-[#fafcfa] px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#058a3e] focus:ring-2 focus:ring-[#058a3e]/20"
            />

            <button
              type="submit"
              disabled={saving}
              className="mt-4 w-full rounded-xl bg-[#058a3e] py-3 text-sm font-semibold text-white shadow-md shadow-green-900/20 transition hover:bg-[#047a37] disabled:opacity-60"
            >
              {saving ? "আপডেট হচ্ছে..." : "আপডেট"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}