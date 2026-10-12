"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

import ProductCard from "@/components/ProductCard";
import { getProducts } from "@/lib/api";
import { formatBnNumber } from "@/lib/format";
import type { Product } from "@/types/bazardor";

// Loading Skeleton
function ProductSkeleton() {
  return (
    <div className="min-h-[270px] animate-pulse rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
      <div className="size-[76px] rounded-2xl bg-gray-200 sm:size-[88px]" />

      <div className="mt-4 h-3 w-20 rounded bg-gray-200" />
      <div className="mt-3 h-5 w-36 rounded bg-gray-200" />
      <div className="mt-3 h-3 w-24 rounded bg-gray-200" />

      <div className="mt-6 border-t border-gray-100 pt-4">
        <div className="h-3 w-20 rounded bg-gray-200" />
        <div className="mt-3 h-5 w-28 rounded bg-gray-200" />
      </div>
    </div>
  );
}

// Section Heading
function SectionHeading({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-5">
      <h2 className="text-lg font-extrabold text-[#202a22] sm:text-xl">
        {title}
      </h2>

      <p className="mt-2 text-sm leading-6 text-[#69736c]">
        {subtitle}
      </p>
    </div>
  );
}

// Product Grid
function ProductGrid({
  products,
  loading,
  emptyMessage,
}: {
  products: Product[];
  loading: boolean;
  emptyMessage: string;
}) {
  const gridClass =
    "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-5";

  if (loading) {
    return (
      <div className={gridClass}>
        {Array.from({ length: 6 }, (_, index) => (
          <ProductSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-10 text-center">
        <p className="text-sm text-gray-500">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div className={gridClass}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

export default function HomeProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Fetch products from API
  useEffect(() => {
    let active = true;

    async function loadProducts() {
      setLoading(true);
      setError(false);

      try {
        const data = await getProducts();

        if (!active) return;

        setProducts(data);
      } catch (err) {
        console.error("Home products loading error:", err);

        if (active) {
          setProducts([]);
          setError(true);
          toast.error("পণ্যের তথ্য লোড করা যায়নি।");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      active = false;
    };
  }, [retryCount]);

  // Products with increased prices
  const risers = products
    .filter((product) => product.change.dir === "up")
    .sort((a, b) => b.change.pct - a.change.pct)
    .slice(0, 6);

  // Products with decreased prices
  const fallers = products
    .filter((product) => product.change.dir === "down")
    .sort(
      (a, b) =>
        Math.abs(b.change.pct) - Math.abs(a.change.pct)
    )
    .slice(0, 6);

  // Retry API request
  function handleRetry() {
    setRetryCount((count) => count + 1);
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-10 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">

      {/* Price Increased Products */}
      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-10 text-center">
          <h2 className="text-lg font-bold text-red-700">
            পণ্যের তথ্য লোড করা যায়নি
          </h2>

          <p className="mt-2 text-sm text-gray-600">
            ইন্টারনেট সংযোগ ও API URL পরীক্ষা করে আবার চেষ্টা করুন।
          </p>

          <button
            type="button"
            onClick={handleRetry}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
          >
            <RefreshCw size={16} />
            আবার চেষ্টা করুন
          </button>
        </div>
      ) : (
        <>
          {/* Price Increased Section */}
          <section
            id="দাম-পরিবর্তন"
            className="scroll-mt-44"
          >
            <SectionHeading
              title="🔺 আজ দাম বেড়েছে"
              subtitle="গত দিনের তুলনায় যেসব পণ্যের দাম বেড়েছে।"
            />

            <ProductGrid
              products={risers}
              loading={loading}
              emptyMessage="আজ কোনো পণ্যের দাম বাড়ার তথ্য পাওয়া যায়নি।"
            />
          </section>

          {/* Price Decreased Section */}
          <section>
            <SectionHeading
              title="🟢 আজ দাম কমেছে"
              subtitle="গত দিনের তুলনায় যেসব পণ্যের দাম কমেছে।"
            />

            <ProductGrid
              products={fallers}
              loading={loading}
              emptyMessage="আজ কোনো পণ্যের দাম কমার তথ্য পাওয়া যায়নি।"
            />
          </section>

          {/* All Products Section */}
          <section
            id="সব-পণ্য"
            className="scroll-mt-44"
          >
            <SectionHeading
              title="সব পণ্য"
              subtitle={`চাল, ডাল, তেল, সবজিসহ নিত্যপ্রয়োজনীয় ${formatBnNumber(
                products.length
              )}টি পণ্যের তালিকা।`}
            />

            <ProductGrid
              products={products}
              loading={loading}
              emptyMessage="এই মুহূর্তে কোনো পণ্যের তথ্য পাওয়া যায়নি।"
            />
          </section>
        </>
      )}
    </div>
  );
}