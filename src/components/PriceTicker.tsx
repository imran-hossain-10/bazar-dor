"use client";

import { useEffect, useState } from "react";

import { getProducts } from "@/lib/api";
import { formatBnNumber, getUnitText } from "@/lib/format";
import type { Product } from "@/types/bazardor";


function getPriceChange(direction: Product["change"]["dir"]) {
  if (direction === "up") {
    return {
      arrow: "▲",
      color: "text-red-600",
    };
  }

  if (direction === "down") {
    return {
      arrow: "▼",
      color: "text-emerald-700",
    };
  }

  return {
    arrow: "—",
    color: "text-gray-500",
  };
}


function TickerItem({ product }: { product: Product }) {
  const { arrow, color } = getPriceChange(product.change.dir);

  const price = formatBnNumber(product.today);
  const change = formatBnNumber(Math.abs(product.change.pct));
  const unit = getUnitText(product.unit).replace("প্রতি ", "/");

  return (
    <span className="inline-flex shrink-0 items-center gap-2 px-4 text-sm">
      {/* Product Icon */}
      <span className="text-base">{product.image}</span>

      {/* Product Name */}
      <span className="font-medium text-gray-700">
        {product.nameBn}
      </span>

      {/* Today's Price */}
      <span className="font-bold text-gray-900">
        {price} টাকা
      </span>

      {/* Product Unit */}
      <span className="text-xs text-gray-500">
        {unit}
      </span>

      {/* Price Change */}
      <span className={`font-bold ${color}`}>
        {arrow} {change}%
      </span>

      {/* Separator */}
      <span aria-hidden="true" className="ml-2 text-emerald-300">
        •
      </span>
    </span>
  );
}

// Reusable ticker group
function TickerGroup({
  products,
  hidden = false,
}: {
  products: Product[];
  hidden?: boolean;
}) {
  return (
    <div className="ticker-group" aria-hidden={hidden}>
      {products.map((product) => (
        <TickerItem key={product.id} product={product} />
      ))}
    </div>
  );
}

export default function PriceTicker() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadProducts() {
      try {
        const data = await getProducts();

        if (active) {
          setProducts(data);
        }
      } catch (error) {
        console.error("Price ticker error:", error);

        if (active) {
          setProducts([]);
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
  }, []);

  return (
    <div
      aria-label="আজকের বাজারদরের চলমান আপডেট"
      className="overflow-hidden border-b border-emerald-100 bg-emerald-50 py-3"
    >
      {products.length > 0 ? (
        <div className="ticker-track">
          {/* Original Products */}
          <TickerGroup products={products} />

          {/* Duplicate for continuous animation */}
          <TickerGroup products={products} hidden />
        </div>
      ) : (
        <p className="px-4 text-center text-sm font-medium text-gray-600">
          {loading
            ? "আজকের বাজারদর লোড হচ্ছে..."
            : "এই মুহূর্তে বাজারদরের তথ্য পাওয়া যায়নি।"}
        </p>
      )}
    </div>
  );
}