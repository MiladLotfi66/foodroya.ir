"use client";

import { useState, useEffect, useMemo } from "react";
import { evaluate } from 'mathjs';
import { GetAllGlobalVariables } from "../panel/PriceTemplate/GlobalVariableServerAction";

export function usePriceCalculator(product, userRoles, baseCurrency) {
  const [defaultPrice, setDefaultPrice] = useState(0);
  const [userPrice, setUserPrice] = useState(0);
  const [error, setError] = useState('');
  const [formatter, setFormatter] = useState(null);
  const [globalVariables, setGlobalVariables] = useState({});
  const [isLoadingVariables, setIsLoadingVariables] = useState(true);
  const [hasAttemptedCalculation, setHasAttemptedCalculation] = useState(false);
  
  // دریافت متغیرهای عمومی از سرور
  useEffect(() => {
    const fetchGlobalVariables = async () => {
      if (!product) {
        setIsLoadingVariables(false);
        return;
      }
      
      try {
        setIsLoadingVariables(true);
        
        // استخراج شناسه فروشگاه از محصول
        const shopId = product?.ShopId?._id || product?.ShopId;
        
        if (!shopId) {
          console.error("شناسه فروشگاه پیدا نشد:", product);
          setIsLoadingVariables(false);
          return;
        }
        
        // console.log("درخواست متغیرهای عمومی برای فروشگاه:", shopId);
        const response = await GetAllGlobalVariables(shopId);
        
        if (response.status === 200 && response.globalVariables) {
          // تبدیل آرایه به آبجکت برای استفاده راحت‌تر در فرمول‌ها
          const varsObj = {};
          
          if (Array.isArray(response.globalVariables)) {
            response.globalVariables.forEach(variable => {
              if (variable && variable.alias) {
                // استفاده از name به عنوان کلید با حذف فضای خالی
                const safeVarName = variable.alias.toLowerCase().trim().replace(/\s+/g, '_');
                varsObj[safeVarName] = Number(variable.value) || 0;
                
                // اگر نماد (سمبل) دارد، آن را هم اضافه کنیم
                if (variable.symbol) {
                  varsObj[variable.symbol.trim()] = Number(variable.value) || 0;
                }
              }
            });
          }
          
          // console.log("متغیرهای عمومی دریافت شدند:", varsObj);
          setGlobalVariables(varsObj);
        } else {
          console.error("خطا در دریافت متغیرهای عمومی:", response);
        }
      } catch (error) {
        console.error("خطا در دریافت متغیرهای عمومی:", error);
      } finally {
        setIsLoadingVariables(false);
      }
    };
    
    fetchGlobalVariables();
  }, [product?.ShopId]);

  // تابع بررسی و جایگزینی متغیرها در فرمول
  const safeEvaluateFormula = (formula, scope) => {
    if (!formula) return null;
    
    try {
      // سعی می‌کنیم ابتدا به صورت مستقیم محاسبه کنیم
      try {
        const result = evaluate(formula, scope);
        // console.log(`محاسبه موفق "${formula}":`, result);
        return result;
      } catch (directError) {
        // console.log(`خطای مستقیم در محاسبه "${formula}":`, directError.message);
        
        // پیدا کردن تمام متغیرهای احتمالی در فرمول (به جز توابع ریاضی و عملگرها)
        const variableRegex = /[a-zA-Z_][a-zA-Z0-9_]*/g;
        const allMatches = formula.match(variableRegex) || [];
        
        // لیست توابع رایج mathjs که نباید به عنوان متغیر در نظر گرفته شوند
        const mathJsFunctions = ['sin', 'cos', 'tan', 'abs', 'sqrt', 'log', 'exp', 'pow', 'round', 'floor', 'ceil'];
        
        // فیلتر کردن متغیرها (حذف توابع mathjs)
        const variables = allMatches.filter(match => !mathJsFunctions.includes(match));
        
        // console.log("متغیرهای یافت شده در فرمول:", variables);
        
        // بررسی متغیرهای تعریف نشده
        const undefinedVars = variables.filter(varName => !(varName in scope));
        
        if (undefinedVars.length > 0) {
          console.warn(`متغیرهای تعریف نشده در فرمول "${formula}": [${undefinedVars.join(', ')}]`);
          
          // جایگزینی مستقیم متغیرهای تعریف نشده در خود فرمول
          let modifiedFormula = formula;
          undefinedVars.forEach(varName => {
            const regex = new RegExp(`\\b${varName}\\b`, 'g');
            modifiedFormula = modifiedFormula.replace(regex, '0');
          });
          
          // console.log(`فرمول اصلاح شده: "${modifiedFormula}"`);
          
          try {
            // ارزیابی فرمول اصلاح شده
            const result = evaluate(modifiedFormula, scope);
            // console.log(`نتیجه محاسبه فرمول اصلاح شده "${modifiedFormula}":`, result);
            return result;
          } catch (modifiedErr) {
            console.error(`خطا در ارزیابی فرمول اصلاح شده "${modifiedFormula}":`, modifiedErr);
            return 0; // مقدار پیش‌فرض در صورت خطا
          }
        }
        
        // اگر به اینجا رسیدیم، متغیرهای تعریف نشده وجود ندارند اما خطای دیگری رخ داده است
        console.error(`خطای ناشناخته در فرمول "${formula}":`, directError);
        return 0;
      }
    } catch (err) {
      console.error(`خطا در پردازش اولیه فرمول "${formula}":`, err);
      return 0; // مقدار پیش‌فرض در صورت خطا
    }
  };
  

  // محاسبه قیمت‌ها
  useEffect(() => {
    if (!product || !userRoles || isLoadingVariables) {
      // console.log("منتظر داده‌های ورودی یا اتمام بارگذاری متغیرها...");
      return;
    }
    
    setHasAttemptedCalculation(true);
    
    // تنظیم فرمتر
    const decimalPlaces = baseCurrency?.decimalPlaces || 0;
    setFormatter(new Intl.NumberFormat('fa-IR', {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
    }));

    // بررسی داده‌های ورودی
    if (Number(product.stock) === 0) {
      setDefaultPrice(0);
      setUserPrice(0);
      return;
    }

    try {
      // مقادیر پایه برای محاسبه
      const a = Number(product.accountId?.balance || 0) / (Number(product.stock) > 0 ? Number(product.stock) : 1);
      const b = Number(product.lastPurchasePrice || 0);
      const c = Number(product.price || 0);
      
      // ترکیب متغیرهای اصلی با متغیرهای عمومی
      // نکته مهم: اینجا مطمئن می‌شویم که متغیرهای عمومی مقدار عددی دارند
      const scope = { 
        a, 
        b, 
        c
      };
      
      // اضافه کردن متغیرهای عمومی به scope
      Object.keys(globalVariables).forEach(key => {
        scope[key] = Number(globalVariables[key]) || 0;
      });
      
      // console.log("اسکوپ نهایی برای محاسبه:", scope);
      
      // بررسی وجود قالب قیمت‌گذاری
      if (!product.pricingTemplate) {
        console.warn("قالب قیمت‌گذاری وجود ندارد، از قیمت پایه استفاده می‌شود");
        setDefaultPrice(c);
        setUserPrice(c);
        setError("");
        return;
      }

      let rolePrices = [];
      
      // بررسی فرمول‌های قیمت‌گذاری برای نقش‌های کاربر
      if (product.pricingTemplate.pricingFormulas && 
          Array.isArray(product.pricingTemplate.pricingFormulas)) {
        
        product.pricingTemplate.pricingFormulas.forEach((pricingFormula) => {
          if (!pricingFormula.roles || !Array.isArray(pricingFormula.roles)) {
            return;
          }
          
          const formulaRoles = pricingFormula.roles;
          
          // بهبود مقایسه شناسه‌ها
          const userHasRole = userRoles.roles && 
            Array.isArray(userRoles.roles) && 
            userRoles.roles.some(userRole => {
              return formulaRoles.some(role => {
                const roleId = typeof role === 'object' ? (role.id || role._id) : role;
                const userRoleId = userRole.id || userRole._id;
                return String(roleId) === String(userRoleId);
              });
            });
          
          if (userHasRole) {
            const calculatedPrice = safeEvaluateFormula(pricingFormula.formula, scope);
            if (calculatedPrice !== null && !isNaN(calculatedPrice)) {
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
        defaultSalePrice = safeEvaluateFormula(product.pricingTemplate.defaultFormula, scope);
      }

      const formatPrice = (price) => {
        if (price === null || isNaN(price)) return 0;
        const decimalPlaces = baseCurrency?.decimalPlaces || 0;
        return Number(parseFloat(price).toFixed(decimalPlaces));
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
      console.error("خطا در محاسبه قیمت:", err);
      setError("خطا در محاسبه قیمت");
      setDefaultPrice(product.price || 0);
      setUserPrice(product.price || 0);
    }
  }, [product, userRoles, baseCurrency, globalVariables, isLoadingVariables]);

  // ارائه داده‌های مورد نیاز
  return {
    defaultPrice,
    userPrice,
    error,
    formatter,
    formatPrice: (price) => {
      if (!formatter) return price;
      return formatter.format(price);
    },
    isLoadingVariables,
    hasAttemptedCalculation,
    globalVariables
  };
}
