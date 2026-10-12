import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-emerald-100 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div>
          <Link
            href="/"
            className="text-lg font-extrabold text-emerald-800"
          >
            🛒 বাজার দর
          </Link>

          <p className="mt-2 text-sm text-gray-600">
            বাজার দর — প্রয়োজনীয় পণ্যের দাম এক নজরে।
          </p>
        </div>

        <p className="max-w-xl text-sm leading-6 text-gray-500 md:text-right">
          সকল দাম সম্ভাব্য; বাজার অবস্থার ওপর নির্ভর করে পরিবর্তিত হয়।
        </p>
      </div>
    </footer>
  );
}