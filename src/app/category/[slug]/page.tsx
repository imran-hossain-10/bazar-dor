
"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import { ArrowLeft, ChevronDown, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

import ProductCard from "@/components/ProductCard";

import {
  getCategories,
  getProductsByCategory,
} from "@/lib/api";

import { formatBnNumber } from "@/lib/format";

import type { Category, Product } from "@/types/bazardor";

type SortOption = "default" | "asc" | "desc";

// Loading Skeleton
function CategorySkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }, (_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-2xl border border-gray-200 bg-white p-5"
        >
          <div className="size-16 rounded-2xl bg-gray-200" />
          <div className="mt-5 h-4 w-3/4 rounded bg-gray-200" />
          <div className="mt-3 h-3 w-1/2 rounded bg-gray-200" />
          <div className="mt-6 h-7 w-2/3 rounded bg-gray-200" />
        </div>
      ))}
    </div>
  );
}

// Back to Homepage
function HomeButton() {
  return (
    <Link
      href="/"
      className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
    >
      <ArrowLeft size={18} />
      হোম পেজে ফিরে যান
    </Link>
  );
}

// Category Page Content
function CategoryPageContent() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  const [sort, setSort] = useState<SortOption>("default");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadCategory() {
      setLoading(true);
      setError(false);
      setCategory(null);
      setProducts([]);

      try {
        const categories = await getCategories();

        const selectedCategory = categories.find(
          (item) => item.slug === slug || item.id === slug
        );

        if (!active) return;

        if (!selectedCategory) {
          setLoading(false);
          return;
        }

        const data = await getProductsByCategory(
          selectedCategory.slug
        );

        if (!active) return;

        setCategory(selectedCategory);

        setProducts(
          data.filter(
            (product) =>
              product.category === selectedCategory.slug ||
              product.category === selectedCategory.id
          )
        );
      } catch (err) {
        console.error("Category loading error:", err);

        if (active) {
          setError(true);
          toast.error("পণ্যের তথ্য লোড করা যায়নি।");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadCategory();

    return () => {
      active = false;
    };
  }, [slug, retryCount]);

  // Sort products by price
  const sortedProducts = [...products];

  if (sort === "asc") {
    sortedProducts.sort((a, b) => a.today - b.today);
  }

  if (sort === "desc") {
    sortedProducts.sort((a, b) => b.today - a.today);
  }

  function handleRetry() {
    setRetryCount((count) => count + 1);
  }

  return (
    <section className="mx-auto min-h-[60vh] max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      {/* Back Link */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-emerald-700"
      >
        <ArrowLeft size={16} />
        হোম পেজ
      </Link>

      {/* Loading */}
      {loading ? (
        <div className="mt-8">
          <div className="h-9 w-56 animate-pulse rounded bg-gray-200" />
          <div className="mt-3 h-4 w-72 max-w-full animate-pulse rounded bg-gray-200" />

          <div className="mt-8">
            <CategorySkeleton />
          </div>
        </div>
      ) : error ? (
        /* Error State */
        <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 px-5 py-12 text-center">
          <h1 className="text-xl font-bold text-red-700">
            পণ্যের তথ্য লোড করা যায়নি
          </h1>

          <p className="mt-3 text-sm text-gray-600">
            ইন্টারনেট সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।
          </p>

          <button
            type="button"
            onClick={handleRetry}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white transition hover:bg-emerald-800"
          >
            <RefreshCw size={17} />
            আবার চেষ্টা করুন
          </button>
        </div>
      ) : !category ? (
        /* Category Not Found */
        <div className="mt-8 rounded-3xl border border-gray-200 bg-white px-5 py-12 text-center">
          <div className="text-5xl">🔎</div>

          <h1 className="mt-4 text-2xl font-extrabold text-gray-900">
            ক্যাটাগরি পাওয়া যায়নি
          </h1>

          <p className="mt-3 text-sm text-gray-500">
            এই ক্যাটাগরিটি নেই অথবা লিংকটি সঠিক নয়।
          </p>

          <HomeButton />
        </div>
      ) : (
        <>
          {/* Category Header */}
          <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-4xl">
                  {category.icon}
                </span>

                <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                  {category.nameBn}
                </h1>
              </div>

              <p className="mt-3 text-sm leading-6 text-gray-500 sm:text-base">
                {category.nameBn} ক্যাটাগরির সব পণ্যের দাম
                এক নজরে দেখুন।
              </p>
            </div>

            {/* Sorting */}
            <div className="relative w-full shrink-0 sm:w-60">
              <select
                aria-label="পণ্যের দাম অনুযায়ী সাজান"
                value={sort}
                onChange={(event) =>
                  setSort(event.target.value as SortOption)
                }
                className="w-full appearance-none rounded-xl border border-gray-200 bg-white py-3 pl-4 pr-11 text-sm font-medium text-gray-700 outline-none transition focus:border-emerald-600"
              >
                <option value="default">
                  সাজান: ডিফল্ট
                </option>

                <option value="asc">
                  দাম: কম থেকে বেশি
                </option>

                <option value="desc">
                  দাম: বেশি থেকে কম
                </option>
              </select>

              <ChevronDown
                size={18}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
              />
            </div>
          </div>

          {/* Total Products */}
          <p className="mb-5 mt-8 text-sm text-gray-500">
            মোট {formatBnNumber(products.length)}টি পণ্য
          </p>

          {/* Product Grid */}
          {sortedProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {sortedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="rounded-3xl border border-gray-200 bg-white px-5 py-12 text-center">
              <div className="text-5xl">🛒</div>

              <h2 className="mt-4 text-xl font-bold text-gray-900">
                এই ক্যাটাগরিতে কোনো পণ্য নেই
              </h2>

              <p className="mt-3 text-sm text-gray-500">
                অন্য ক্যাটাগরি থেকে পণ্য দেখুন।
              </p>

              <HomeButton />
            </div>
          )}
        </>
      )}
    </section>
  );
}

// Main Category Page
export default function CategoryPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto min-h-[60vh] max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <CategorySkeleton />
        </div>
      }
    >
      <CategoryPageContent />
    </Suspense>
  );
}
