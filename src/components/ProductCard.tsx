import Image from "next/image";
import Link from "next/link";

import type { Product } from "@/types/bazardor";
import { formatBnNumber, getUnitText } from "@/lib/format";

type ProductCardProps = {
  product: Product;
};

// Price change badge
function getPriceChange(direction: Product["change"]["dir"]) {
  if (direction === "up") {
    return {
      arrow: "▲",
      style: "bg-red-50 text-red-600",
      label: "দাম বেড়েছে",
    };
  }

  if (direction === "down") {
    return {
      arrow: "▼",
      style: "bg-emerald-50 text-emerald-700",
      label: "দাম কমেছে",
    };
  }

  return {
    arrow: "—",
    style: "bg-gray-100 text-gray-600",
    label: "দাম অপরিবর্তিত",
  };
}

// Product Image
function ProductImage({ product }: ProductCardProps) {
  const image = product.image;

  const isImageUrl =
    typeof image === "string" &&
    (image.startsWith("http://") ||
      image.startsWith("https://") ||
      image.startsWith("/"));

  return (
    <div className="relative flex size-[76px] shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-emerald-50 sm:size-[88px]">
      {isImageUrl ? (
        <Image
          src={image}
          alt={product.nameBn}
          fill
          unoptimized
          sizes="(max-width: 640px) 76px, 88px"
          className="object-contain p-2"
        />
      ) : (
        <span className="text-4xl sm:text-5xl">
          {image || "🛒"}
        </span>
      )}
    </div>
  );
}

export default function ProductCard({ product }: ProductCardProps) {
  const priceChange = getPriceChange(product.change.dir);

  const todayPrice = formatBnNumber(product.today);

  const changePercent = formatBnNumber(
    Math.abs(product.change.pct)
  );

  return (
    <Link
      href={`/product/${product.slug}`}
      aria-label={`${product.nameBn}, বিস্তারিত দেখুন`}
      className="group flex h-full min-h-[270px] w-full flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 sm:p-6"
    >
      {/* Product Image */}
      <ProductImage product={product} />

      {/* Product Information */}
      <div className="mt-4 flex-1">
        <p className="text-xs font-medium text-emerald-700">
          {product.categoryIcon} {product.categoryNameBn}
        </p>

        <h3 className="mt-2 text-lg font-bold leading-7 text-gray-900 transition-colors group-hover:text-emerald-800">
          {product.nameBn}
        </h3>

        <p className="mt-2 text-sm text-gray-500">
          {getUnitText(product.unit)}
        </p>
      </div>

      {/* Today's Price */}
      <div className="mt-5 flex items-end justify-between gap-3 border-t border-gray-100 pt-4">
        <div className="min-w-0">
          <p className="text-xs text-gray-500">
            আজকের দাম
          </p>

          <p className="mt-1 text-[22px] font-extrabold text-gray-900">
            {todayPrice}{" "}
            <span className="text-sm font-semibold">
              টাকা
            </span>
          </p>
        </div>

        {/* Price Change */}
        <span
          title={priceChange.label}
          aria-label={`${priceChange.label}: ${changePercent}%`}
          className={`shrink-0 rounded-full px-2.5 py-1.5 text-xs font-bold ${priceChange.style}`}
        >
          {priceChange.arrow} {changePercent}%
        </span>
      </div>
    </Link>
  );
}