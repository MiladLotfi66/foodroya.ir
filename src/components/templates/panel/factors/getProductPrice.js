// Import کتابخانه‌ها و مدل‌ها
import math from 'mathjs';
import mongoose from 'mongoose';
import PriceTemplate from '../PriceTemplate/PriceTemplate';
import Product from '../Product/Product';
import RoleInShop from '../rols/RoleInShop';
import InvoiceItem from './InvoiceItem';
import Account from '../Account/Account';

/**
 * محاسبه قیمت محصول بر اساس نقش‌های کاربر
 * @param {String} productId - شناسه محصول
 * @param {String} userId - شناسه کاربر
 * @returns {Number} - پایین‌ترین قیمت محاسبه‌شده
 */
async function getProductPrice(productId, userId) {
  try {
    // ۱. دریافت محصول با قالب قیمتی مرتبط
    const product = await Product.findById(productId).populate('pricingTemplate').exec();
    if (!product) throw new Error('محصول یافت نشد.');
    if (!product.pricingTemplate) throw new Error('محصول قالب قیمتی ندارد.');

    const priceTemplate = product.pricingTemplate;

    // ۲. دریافت نقش‌های کاربر در فروشگاه مربوطه
    const rolesInShop = await RoleInShop.find({
      UserId: mongoose.Types.ObjectId(userId),
      ShopId: mongoose.Types.ObjectId(product.ShopId),
    }).populate('RoleId').exec();

    const roleIds = rolesInShop.map(role => role.RoleId.toString());

    // ۳. جمع‌آوری فرمول‌های قیمتی مرتبط با نقش‌های کاربر
    let formulas = [];

    for (let roleId of roleIds) {
      const formulaObj = priceTemplate.pricingFormulas.find(pf =>
        pf.roles.map(r => r.toString()).includes(roleId)
      );
      if (formulaObj) {
        formulas.push(formulaObj.formula);
      }
    }

    // اگر کاربر نقشی نداشت یا نقشی یافت نشد، از فرمول پیش‌فرض استفاده می‌کنیم
    if (formulas.length === 0) {
      formulas.push(priceTemplate.defaultFormula);
    }

    // ۴. دریافت داده‌های مورد نیاز برای فرمول
    // a. قیمت فروش محصول
    const salePrice = product.salePrice;
    if (salePrice == null) throw new Error('قیمت فروش محصول مشخص نشده است.');

    // b. بها تمام شده = میزان حساب کالا / تعداد کالا
    const account = await Account.findById(product.accountId).exec();
    if (!account) throw new Error('حساب مربوط به محصول یافت نشد.');
    if (product.stock === 0) throw new Error('موجودی محصول صفر است.');
    const costPrice = parseFloat(account.amount.toString()) / product.stock;

    // c. آخرین قیمت خرید از اقلام فاکتور
    const lastInvoiceItem = await InvoiceItem.findOne({ product: mongoose.Types.ObjectId(productId) })
      .sort({ createdAt: -1 })
      .exec();
    const lastPurchasePrice = lastInvoiceItem ? parseFloat(lastInvoiceItem.unitPrice.toString()) : 0;

    // ۵. تعریف متغیرهای فرمول
    const variables = {
      salePrice,
      costPrice,
      lastPurchasePrice,
    };

    // ۶. محاسبه قیمت‌های مختلف بر اساس فرمول‌ها
    const prices = formulas.map(formula => {
      try {
        // اطمینان از امن بودن فرمول
        const compiledFormula = math.compile(formula);
        // ارزیابی فرمول با استفاده از متغیرها
        const result = compiledFormula.evaluate(variables);
        // اطمینان از اینکه نتیجه عددی است
        if (typeof result !== 'number') throw new Error('نتیجه فرمول عددی نیست.');
        return result;
      } catch (error) {
        console.error(`خطا در ارزیابی فرمول "${formula}":`, error.message);
        return Infinity; // برای فرمول‌های نامعتبر، قیمت بسیار بالایی برمی‌گردانیم
      }
    });

    // ۷. انتخاب پایین‌ترین قیمت
    const validPrices = prices.filter(price => price !== Infinity);
    if (validPrices.length === 0) throw new Error('هیچ فرمول معتبر برای محاسبه قیمت یافت نشد.');

    const minPrice = Math.min(...validPrices);

    return minPrice;
  } catch (error) {
    console.error('Error in getProductPrice:', error.message);
    throw error;
  }
}
export default getProductPrice;