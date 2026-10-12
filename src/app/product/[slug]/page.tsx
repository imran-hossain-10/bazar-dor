"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { toast } from "react-hot-toast";

import { authClient } from "@/lib/client";
import { getProducts } from "@/lib/api";
import { formatBnNumber, getUnitText } from "@/lib/format";
import type { Product } from "@/types/bazardor";

function ProductDetailsContent() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const router = useRouter();

  const { data: session, isPending: sessionPending } =
    authClient.useSession();

  const isAuthenticated = Boolean(session?.user);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Check authentication
  useEffect(() => {
    if (sessionPending) return;

    if (!isAuthenticated) {
      const callbackURL = `/product/${encodeURIComponent(slug)}`;

      router.replace(
        `/signin?callbackURL=${encodeURIComponent(callbackURL)}`
      );
    }
  }, [sessionPending, isAuthenticated, router, slug]);

  // Fetch product details
  useEffect(() => {
    if (sessionPending || !isAuthenticated || !slug) return;

    let cancelled = false;

    async function loadProduct() {
      setLoading(true);
      setError(false);
      setProduct(null);

      try {
        const products = await getProducts();

        const foundProduct = products.find(
          (item) => item.slug === slug
        );

        if (!cancelled) {
          setProduct(foundProduct ?? null);
        }
      } catch {
        if (!cancelled) {
          setError(true);
          toast.error("পণ্যের তথ্য লোড করা যায়নি।");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProduct();

    return () => {
      cancelled = true;
    };
  }, [slug, sessionPending, isAuthenticated]);

  // Authentication loading
  if (sessionPending || !isAuthenticated) {
    return (
      <main className="min-h-[60vh] bg-[#f4f8f4] px-4 py-10 text-center text-gray-500">
        সাইন-ইন যাচাই করা হচ্ছে...
      </main>
    );
  }

  // Loading
  if (loading) {
    return (
      <main className="min-h-screen bg-[#f4f8f4]">
        <div className="mx-auto max-w-7xl animate-pulse px-4 py-8">
          <div className="h-4 w-32 rounded bg-gray-200" />

          <div className="mt-5 h-28 rounded-xl bg-white" />

          <div className="mt-4 rounded-xl bg-white p-4">
            <div className="h-5 w-40 rounded bg-gray-200" />

            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              <div className="h-16 rounded-lg bg-gray-100" />
              <div className="h-16 rounded-lg bg-gray-100" />
              <div className="h-16 rounded-lg bg-gray-100" />
            </div>

            <div className="mt-6 h-64 rounded-lg bg-gray-100" />
          </div>
        </div>
      </main>
    );
  }

  // Error
  if (error) {
    return (
      <main className="min-h-[60vh] bg-[#f4f8f4] px-4 py-20 text-center">
        <h1 className="text-xl font-bold text-gray-900">
          পণ্যের তথ্য লোড করা যায়নি
        </h1>

        <p className="mt-3 text-sm text-gray-500">
          ইন্টারনেট সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।
        </p>

        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-5 rounded-lg bg-emerald-700 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
        >
          আবার চেষ্টা করুন
        </button>
      </main>
    );
  }

  // Product not found
  if (!product) {
    return (
      <main className="min-h-[60vh] bg-[#f4f8f4] px-4 py-20 text-center">
        <h1 className="text-xl font-bold text-gray-900">
          পণ্যটি পাওয়া যায়নি
        </h1>

        <p className="mt-3 text-sm text-gray-500">
          পণ্যের লিংকটি ভুল হতে পারে।
        </p>

        <Link
          href="/"
          className="mt-5 inline-block rounded-lg bg-emerald-700 px-5 py-2 text-sm text-white"
        >
          হোম পেজে ফিরে যান
        </Link>
      </main>
    );
  }

  // Market price calculation
  const markets = product.markets ?? [];

  const minimumPrice =
    markets.length > 0
      ? Math.min(...markets.map((market) => market.min))
      : product.today;

  const maximumPrice =
    markets.length > 0
      ? Math.max(...markets.map((market) => market.max))
      : product.today;

  const averagePrice =
    markets.length > 0
      ? Math.round(
          markets.reduce(
            (total, market) =>
              total + (market.min + market.max) / 2,
            0
          ) / markets.length
        )
      : product.today;

  const changeArrow =
    product.change.dir === "up"
      ? "▲"
      : product.change.dir === "down"
        ? "▼"
        : "—";

  const changeColor =
    product.change.dir === "up"
      ? "text-red-500"
      : product.change.dir === "down"
        ? "text-emerald-600"
        : "text-gray-500";

  return (
    <main className="min-h-screen bg-[#f4f8f4]">
      <div className="mx-auto max-w-7xl px-3 py-4 sm:px-5 lg:px-6">

        {/* Back Button */}
        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-2 text-xs text-gray-600 hover:text-emerald-700"
        >
          <ArrowLeft size={15} />
          সব পণ্যে ফিরে যান
        </Link>

        {/* Product Header */}
        <section className="rounded-xl border border-[#e4eae4] bg-white p-3 sm:p-4">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">

            {/* Product Image */}
            <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-[#f2f7f3] text-3xl sm:size-16">
              {product.image}
            </div>

            {/* Product Information */}
            <div className="min-w-0 flex-1">

              <h1 className="text-lg font-bold text-[#253126] sm:text-xl">
                {product.nameBn}
              </h1>

              <p className="mt-1 text-[11px] text-gray-500">
                প্রতি একক: {getUnitText(product.unit)}
              </p>

              <p className="mt-1 text-[11px] leading-5 text-gray-600">
                সর্বশেষ তথ্য অনুযায়ী আজকের বাজার রেট
              </p>

            </div>

            {/* Today's Price */}
            <div className="w-full rounded-xl bg-[#f4f8f4] px-4 py-3 text-center sm:w-auto sm:min-w-[110px]">

              <p className="text-[10px] text-gray-500">
                আজকের দাম
              </p>

              <p className="mt-1 text-2xl font-extrabold text-[#243126]">
                {formatBnNumber(product.today)}
              </p>

              <p className="text-[10px] text-gray-500">
                টাকা / {product.unit}
              </p>

              <p className={`mt-1 text-[10px] font-semibold ${changeColor}`}>
                {changeArrow}{" "}
                {formatBnNumber(Math.abs(product.change.pct))}%
              </p>

            </div>

          </div>
        </section>

        {/* Summary and Market Table */}
        <section className="mt-4 rounded-xl border border-[#e4eae4] bg-white p-3 sm:p-4">

          {/* Price Summary */}
          <h2 className="text-sm font-bold text-[#263328]">
            দামের সারসংক্ষেপ
          </h2>

          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">

            {/* Minimum Price */}
            <div className="rounded-xl border border-[#e5ece6] bg-white p-3">

              <p className="text-[11px] text-gray-500">
                সর্বনিম্ন দাম
              </p>

              <p className="mt-1 text-lg font-bold text-emerald-600">
                {formatBnNumber(minimumPrice)} টাকা
              </p>

              <p className="mt-1 text-[10px] text-gray-500">
                সবচেয়ে কম দামের বাজার
              </p>

            </div>

            {/* Maximum Price */}
            <div className="rounded-xl border border-[#e5ece6] bg-white p-3">

              <p className="text-[11px] text-gray-500">
                সর্বোচ্চ দাম
              </p>

              <p className="mt-1 text-lg font-bold text-red-500">
                {formatBnNumber(maximumPrice)} টাকা
              </p>

              <p className="mt-1 text-[10px] text-gray-500">
                সবচেয়ে বেশি দামের বাজার
              </p>

            </div>

            {/* Average Price */}
            <div className="rounded-xl border border-[#e5ece6] bg-white p-3">

              <p className="text-[11px] text-gray-500">
                গড় দাম
              </p>

              <p className="mt-1 text-lg font-bold text-emerald-600">
                {formatBnNumber(averagePrice)} টাকা
              </p>

              <p className="mt-1 text-[10px] text-gray-500">
                প্রতি কেজি-এর হিসাবে
              </p>

            </div>

          </div>

          {/* Market Table */}
          <div className="mt-5">

            <h2 className="mb-3 text-sm font-bold text-[#263328]">
              বাজারভিত্তিক আজকের দাম
            </h2>

            {markets.length > 0 ? (
              <div className="overflow-x-auto rounded-xl border border-[#e5ece6]">

                <table className="w-full min-w-[560px] border-collapse text-left text-xs">

                  <thead className="bg-[#fafcfb] text-gray-500">
                    <tr>
                      <th className="px-3 py-3 font-medium">
                        বাজার
                      </th>

                      <th className="px-3 py-3 font-medium">
                        বিভাগ
                      </th>

                      <th className="px-3 py-3 font-medium">
                        সর্বনিম্ন
                      </th>

                      <th className="px-3 py-3 font-medium">
                        সর্বোচ্চ
                      </th>

                      <th className="px-3 py-3 text-right font-medium">
                        গড়
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {markets.map((market, index) => {
                      const marketAverage =
                        (market.min + market.max) / 2;

                      return (
                        <tr
                          key={`${market.market}-${market.division}-${index}`}
                          className={
                            index % 2 === 0
                              ? "border-t border-[#e5ece6] bg-white"
                              : "border-t border-[#e5ece6] bg-[#f2f6f2]"
                          }
                        >

                          <td className="px-3 py-3 font-medium text-gray-800">
                            {market.market}
                          </td>

                          <td className="px-3 py-3 text-gray-600">
                            {market.division}
                          </td>

                          <td className="px-3 py-3 text-gray-700">
                            {formatBnNumber(market.min)} টাকা
                          </td>

                          <td className="px-3 py-3 text-gray-700">
                            {formatBnNumber(market.max)} টাকা
                          </td>

                          <td className="px-3 py-3 text-right font-semibold text-gray-800">
                            {formatBnNumber(
                              Math.round(marketAverage)
                            )} টাকা
                          </td>

                        </tr>
                      );
                    })}
                  </tbody>

                </table>
              </div>
            ) : (
              <div className="rounded-lg border border-gray-200 p-5 text-center text-sm text-gray-500">
                এই পণ্যের বাজারভিত্তিক তথ্য পাওয়া যায়নি।
              </div>
            )}

          </div>
        </section>

      </div>
    </main>
  );
}

export default function ProductDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] bg-[#f4f8f4] px-4 py-12 text-center text-gray-500">
          পণ্যের বিস্তারিত লোড হচ্ছে...
        </div>
      }
    >
      <ProductDetailsContent />
    </Suspense>
  );
}