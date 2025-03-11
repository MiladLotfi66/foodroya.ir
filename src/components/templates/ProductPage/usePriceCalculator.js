"use client";

import { useState, useEffect } from "react";
import { evaluate } from 'mathjs';

export function usePriceCalculator(product, userRoles, baseCurrency) {
  const [defaultPrice, setDefaultPrice] = useState(0);
  const [userPrice, setUserPrice] = useState(0);
  const [error, setError] = useState('');
  const [formatter, setFormatter] = useState(null);

  useEffect(() => {
    // تنظیم فرمتر
    const decimalPlaces = baseCurrency?.decimalPlaces || 0;
    setFormatter(new Intl.NumberFormat('fa-IR', {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
    }));

    // بررسی داده‌های ورودی
    if (!product || !userRoles) {
      setDefaultPrice(0);
      setUserPrice(0);
      setError('');
      return;
    }

    // بررسی موجودی کالا
    if (Number(product.stock) === 0) {
      setDefaultPrice(0);
      setUserPrice(0);
      setError('');
      return;
    }

    try {
      // مقادیر پایه برای محاسبه
      const a = Number(product.accountId?.balance || 0) / (Number(product.stock) > 0 ? Number(product.stock) : 1);
      const b = Number(product.lastPurchasePrice || 0);
      const c = Number(product.price || 0);
      

      const evaluateFormula = (formula) => {
        if (!formula) return null;
        
        const allowedCharacters = /^[a-zA-Z0-9+\-*/().\s]+$/;
        if (!allowedCharacters.test(formula)) {
          throw new Error("حروف غیرمجاز در فرمول موجود است");
        }
        const scope = { a, b, c };
        return evaluate(formula, scope);
      };

      // بررسی وجود قالب قیمت‌گذاری
      if (!product.pricingTemplate) {
        console.error("قالب قیمت‌گذاری وجود ندارد");
        setDefaultPrice(c);
        setUserPrice(c);
        setError("");
        return;
      }

      let rolePrices = [];
      
      // بررسی فرمول‌های قیمت‌گذاری برای نقش‌های کاربر
      
      if (product.pricingTemplate.pricingFormulas && Array.isArray(product.pricingTemplate.pricingFormulas)) {
        product.pricingTemplate.pricingFormulas.forEach((pricingFormula) => {
          
          if (!pricingFormula.roles || !Array.isArray(pricingFormula.roles)) {
            return;
          }
          
          const formulaRoles = pricingFormula.roles;
          const userHasRole = userRoles.roles && Array.isArray(userRoles.roles) && 
            userRoles.roles.some(userRole => formulaRoles.includes(userRole.id));
          
          
          if (userHasRole) {
            const calculatedPrice = evaluateFormula(pricingFormula.formula);
            if (calculatedPrice !== null) {
              rolePrices.push(calculatedPrice);
            }
          }
        });
      }

      // محاسبه کمترین قیمت برای نقش‌های کاربر
      const minRolePrice = rolePrices.length > 0 ? Math.min(...rolePrices) : null;
      
      // محاسبه قیمت پیش‌فرض
      let defaultSalePrice = null;
      if (product.pricingTemplate.defaultFormula) {
        defaultSalePrice = evaluateFormula(product.pricingTemplate.defaultFormula);
      }

      const formatPrice = (price) => {
        if (price === null || isNaN(price)) return 0;
        const decimalPlaces = baseCurrency?.decimalPlaces || 0;
        return Number(price.toFixed(decimalPlaces));
      };

      // تنظیم قیمت‌ها
      const formattedDefaultPrice = defaultSalePrice !== null ? formatPrice(defaultSalePrice) : formatPrice(c);
      const formattedUserPrice = minRolePrice !== null ? 
        formatPrice(minRolePrice) : 
        (defaultSalePrice !== null ? formatPrice(defaultSalePrice) : formatPrice(c));
      
      
      setDefaultPrice(formattedDefaultPrice);
      setUserPrice(formattedUserPrice);
      setError("");
    } catch (err) {
      console.error("خطا در محاسبه قیمت‌ها:", err);
      setError("خطا در محاسبه قیمت‌ها");
    }
  }, [product, userRoles, baseCurrency]);

  return {
    defaultPrice,
    userPrice,
    error,
    formatter,
    formatPrice: (price) => {
      if (!formatter) return price;
      return formatter.format(price);
    }
  };
}
