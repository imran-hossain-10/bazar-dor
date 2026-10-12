"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import banner from "@/asset/bazar-hero.png";

export default function HeroSection() {
  const [today, setToday] = useState("");

  useEffect(() => {
    const updateDate = () => {
      const formattedDate = new Intl.DateTimeFormat("bn-BD", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "Asia/Dhaka",
      }).format(new Date());

      setToday(formattedDate);
    };

    updateDate();

    // Update the date every minute, including when midnight passes.
    const intervalId = window.setInterval(updateDate, 60_000);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <section className="bg-[#f0f5f0] px-3 py-2 sm:px-5 sm:py-3">
      <div className="mx-auto grid max-w-7xl items-center gap-5 rounded-[20px] border border-[#e1e9e2] bg-[#fbfdfb] px-4 py-5 sm:px-6 sm:py-6 lg:grid-cols-[1.2fr_0.8fr] lg:gap-8 lg:px-8 lg:py-6">
        {/* Hero Content */}
        <div className="text-left">
          {/* Dynamic Bangladesh Date */}
          <div className="mb-3 inline-flex items-center rounded-full bg-[#e2f1e7] px-3 py-1 text-xs font-medium text-[#078747] sm:text-sm">
            {today || "আজকের তারিখ"}
          </div>

          {/* Heading */}
          <h1 className="text-[27px] font-extrabold leading-[1.35] tracking-tight text-[#202a22] sm:text-3xl lg:text-[34px]">
            আজকের বাজারের দাম এক নজরে
          </h1>

          {/* Description */}
          <p className="mt-4 max-w-[560px] text-sm leading-7 text-[#68716b] sm:text-[15px]">
            চাল, ডাল, তেল, সবজি, মাছ, মাংস, ডিম ও মসলার দাম —
            বাজারভিত্তিক বিস্তৃত, গড়, সর্বনিম্ন-সর্বোচ্চ এবং
            দামের পরিবর্তন এক জায়গায়।
          </p>

          {/* Products Button */}
          <div className="mt-5">
            <Link
              href="/#সব-পণ্য"
              className="inline-flex items-center justify-center rounded-lg bg-[#078747] px-6 py-3 text-sm font-semibold text-white shadow-[0_3px_4px_rgba(0,0,0,0.22)] transition hover:bg-[#066d3b]"
            >
              সব পণ্য দেখুন
            </Link>
          </div>
        </div>

        {/* Hero Image */}
        <div className="hidden w-full lg:block">
          <div className="flex min-h-[210px] items-center justify-center overflow-hidden rounded-[20px] border border-[#e1eee4] bg-white p-5">
            <Image
              src={banner}
              alt="বাজারের ফল ও সবজির ঝুড়ি"
              priority
              className="h-auto max-h-[190px] w-full object-contain"
              sizes="(max-width: 1024px) 100vw, 40vw"
            />
          </div>
        </div>
      </div>
    </section>
  );
}