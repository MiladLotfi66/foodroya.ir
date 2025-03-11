"use client";

import React from "react";
import { usePriceCalculator } from "./usePriceCalculator";

export function PriceDisplay({ product, userRoles, baseCurrency }) {
  const { defaultPrice, userPrice, error, formatter } = usePriceCalculator(product, userRoles, baseCurrency);

  if (error) {
    return <div className="text-red-500 text-sm">{error}</div>;
  }

  if (Number(product?.stock) === 0) {
    return <div className="text-red-600 font-DanaDemiBold text-sm md:text-base lg:text-xl">ناموجود</div>;
  }

  return (
    <div className="flex flex-col mt-2 md:mt-3 gap-3 font-Dana text-xs">
      {defaultPrice !== userPrice && (
        <div>
          <span className="font-DanaDemiBold text-xs md:text-sm lg:text-xl offerPrice">
            {formatter.format(defaultPrice)}{" "}
          </span>
          <span className="text-xs md:text-sm text-gray-400">{baseCurrency?.title}</span>
        </div>
      )}
      <div className="text-teal-600 dark:text-emerald-500">
        <span className="font-DanaDemiBold text-sm md:text-base lg:text-xl">
          {formatter.format(userPrice)}{" "}
        </span>
        <span className="text-xs md:text-sm tracking-tighter">{baseCurrency?.title}</span>
      </div>
    </div>
  );
}
