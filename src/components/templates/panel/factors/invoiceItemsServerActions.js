"use server";
import mongoose from "mongoose";
import Invoice from "./Invoice";
import InvoiceItem from "./InvoiceItem";
import Ledger from "../FinancialDocument/Ledger";
import GeneralLedger from "../FinancialDocument/GeneralLedger";
import connectDB from "@/utils/connectToDB";
import { authenticateUser } from "@/templates/Shop/ShopServerActions";
import Product from "../Product/Product";
import Account from "../Account/Account";
import { GetAccountIdBystoreIdAndAccountCode } from "../Account/accountActions";

// توابع کمکی
export async function getAuthenticatedUser() {
  try {
    const user = await authenticateUser();
    return user;
  } catch (authError) {
    console.log("Authentication failed:", authError);
    return null;
  }
}

export async function validateInvoiceData(invoiceData, requiredFields) {
  for (const field of requiredFields) {
    if (!invoiceData[field]) {
      throw new Error(`لطفاً فیلد ${field} را پر کنید.`);
    }
  }
}

export async function createInvoiceItems(
  invoiceItems,
  invoiceId,
  session,
  isPurchase
) {
  const invoiceItemIds = [];
  const accountIdMap = {};
  const bulkProductOperations = {};

  for (const item of invoiceItems) {
    const requiredItemFields = [
      "productId",
      "title",
      "quantity",
      "unitPrice",
      "totalPrice",
    ];
    for (const field of requiredItemFields) {
      if (!item[field]) {
        throw new Error(`لطفاً فیلد ${field} در اقلام فاکتور را پر کنید.`);
      }
    }

    const product = await Product.findById(item.productId)
      .populate("accountId")
      .session(session);
    if (!product || !product.accountId) {
      throw new Error(
        `محصول با شناسه ${item.productId} معتبر نیست یا حساب موجودی ندارد.`
      );
    }

    let costOfGoods = 0;

    if (!isPurchase) {
      if (product.stock > 0 && product.accountId.balance > 0) {
        costOfGoods =
          (product.accountId.balance / product.stock) * item.quantity;
      } else {
        const lastPurchasePrice = await getLastPurchasedPrice(product._id);
        if (lastPurchasePrice) {
          costOfGoods = parseFloat(lastPurchasePrice) * item.quantity;
        } else {
          throw new Error(
            `قیمت خرید اخیر برای محصول ${product.title} یافت نشد.`
          );
        }
      }

      if (accountIdMap[product.accountId._id.toString()]) {
        accountIdMap[product.accountId._id.toString()] += costOfGoods;
      } else {
        accountIdMap[product.accountId._id.toString()] = costOfGoods;
      }
    }

    if (isPurchase) {
      const purchaseCost = item.unitPrice * item.quantity;

      if (accountIdMap[product.accountId._id.toString()]) {
        accountIdMap[product.accountId._id.toString()] += purchaseCost;
      } else {
        accountIdMap[product.accountId._id.toString()] = purchaseCost;
      }
    }

    const invoiceItem = new InvoiceItem({
      product: item.productId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
      invoice: invoiceId,
      description: item.description || "",
      Features: item.Features || [],
    });

    await invoiceItem.save({ session });
    invoiceItemIds.push(invoiceItem._id);

    if (bulkProductOperations[item.productId]) {
      bulkProductOperations[item.productId].quantity += item.quantity;
    } else {
      bulkProductOperations[item.productId] = {
        productId: item.productId,
        quantity: item.quantity,
      };
    }
  }

  return { invoiceItemIds, accountIdMap, bulkProductOperations };
}

export async function updateProductStock(
  bulkProductOperations,
  isPurchase,
  session
) {
  for (const op of Object.values(bulkProductOperations)) {
    const update = { $inc: { stock: isPurchase ? op.quantity : -op.quantity } };
    const options = { session, runValidators: true, context: "query" };
    const updatedProduct = await Product.findByIdAndUpdate(
      op.productId,
      update,
      options
    );
    if (!updatedProduct) {
      throw new Error(
        `به‌روزرسانی محصول با شناسه ${op.productId} موفقیت‌آمیز نبود.`
      );
    }
  }
}

export async function updateAccountsBalance(bulkAccountOperations, session) {
  for (const op of Object.values(bulkAccountOperations)) {
    const updateFields = {};
    if (op.debit) {
      updateFields.balance = op.debit;
    } else if (op.credit) {
      updateFields.balance = -op.credit;
    }

    const update = { $inc: { balance: updateFields.balance } };
    const options = { session, runValidators: true, context: "query" };
    const updatedAccount = await Account.findByIdAndUpdate(
      op.accountId,
      update,
      options
    );
    if (!updatedAccount) {
      throw new Error(
        `به‌روزرسانی حساب با شناسه ${op.accountId} موفقیت‌آمیز نبود.`
      );
    }
  }
}

export async function createFinancialDocumentsForSales(
  invoiceId,
  shopId,
  userId,
  accountAllocations,
  accountIdMap,
  totalCostOfGoods,
  totalSales,
  session
) {
  // دریافت شماره حساب بهای تمام‌شده و فروش کالا
  const costOfGoodsAccount = await GetAccountIdBystoreIdAndAccountCode(
    shopId,
    "5000-1"
  );
  if (!costOfGoodsAccount.success) {
    throw new Error(costOfGoodsAccount.message); // خطا در دریافت حساب بهای تمام‌شده کالا
  }

  const salesRevenueAccount = await GetAccountIdBystoreIdAndAccountCode(
    shopId,
    "4000-1"
  );
  if (!salesRevenueAccount.success) {
    throw new Error(salesRevenueAccount.message); // خطا در دریافت حساب فروش کالا
  }

  const ledger = new Ledger({
    referenceId:  invoiceId ,
    type: "invoice",
    // description,
    shop: shopId,
    createdBy: userId,
    updatedBy: userId,
  });


  const generalLedgers = [];
  const bulkAccountOperations = {};

  for (const allocation of accountAllocations) {
    const generalLedger = new GeneralLedger({
      ledger: ledger._id,
      account: allocation.accountId,
      debit: allocation.amount,
      credit: 0,
      referenceId:  invoiceId ,
      type: "invoice",
      shop: shopId,
      createdBy: userId,
      updatedBy: userId,
    });

    generalLedgers.push(generalLedger._id);

    if (bulkAccountOperations[allocation.accountId.toString()]) {
      bulkAccountOperations[allocation.accountId.toString()].debit +=
        allocation.amount;
    } else {
      bulkAccountOperations[allocation.accountId.toString()] = {
        accountId: allocation.accountId,
        debit: allocation.amount,
      };
    }
  }

  // ثبت بهای تمام‌شده کالا (Cost of Goods Sold)
  const costOfGoodsLedger = new GeneralLedger({
    ledger: ledger._id,
    account: costOfGoodsAccount.accountId,
    debit: totalCostOfGoods,
    credit: 0,
    referenceId:  invoiceId ,
    type: "invoice",
    shop: shopId,
    createdBy: userId,
    updatedBy: userId,
  });

  await costOfGoodsLedger.save({ session });
  generalLedgers.push(costOfGoodsLedger._id);

  // ثبت درآمد فروش کالا (Sales Revenue)
  const salesRevenueLedger = new GeneralLedger({
    ledger: ledger._id,
    account: salesRevenueAccount.accountId,
    debit: 0,
    credit: totalSales,
    referenceId:  invoiceId ,
    type: "invoice",
    shop: shopId,
    createdBy: userId,
    updatedBy: userId,
  });

  await salesRevenueLedger.save({ session });
  generalLedgers.push(salesRevenueLedger._id);

  for (const [accountId, amount] of Object.entries(accountIdMap)) {
    const generalLedger = new GeneralLedger({
      ledger: ledger._id,
      account: accountId,
      debit: 0,
      credit: amount,
      referenceId:  invoiceId ,
      type: "invoice",
      shop: shopId,
      createdBy: userId,
      updatedBy: userId,
    });

    await generalLedger.save({ session });
    generalLedgers.push(generalLedger._id);

    if (!bulkAccountOperations[accountId.toString()]) {
      bulkAccountOperations[accountId.toString()] = {
        accountId: accountId,
        credit: amount,
      };
    } else {
      bulkAccountOperations[accountId.toString()].credit += amount;
    }
  }

  await updateAccountsBalance(bulkAccountOperations, session);

  ledger.transactions = generalLedgers;
  await ledger.save({ session });

  return ledger._id;
}

export async function AddSalesInvoiceAction(invoiceData) {
  await connectDB();
  const user = await getAuthenticatedUser();
  if (!user) {
    return { status: 401, message: "کاربر وارد نشده است." };
  }

  const session = await mongoose.startSession();

  try {
    const result = await session.withTransaction(async () => {
      const requiredFields = [
        "type",
        "totalAmount",
        "invoiceItems",
        "storeId",
        "customerId",
        "accountAllocations",
      ];
      validateInvoiceData(invoiceData, requiredFields);

      const totalItems = invoiceData.invoiceItems.reduce(
        (acc, item) => acc + item.quantity,
        0
      );

      const invoice = new Invoice({
        description: invoiceData.description || "",
        type: invoiceData.type,
        totalPrice: invoiceData.totalAmount,
        totalItems: totalItems,
        contact: invoiceData.customerId,
        shop: invoiceData.storeId,
        createdBy: user.id,
        updatedBy: user.id,
      });
      const invoiceId = invoice._id;


      const { invoiceItemIds, accountIdMap, bulkProductOperations } =
        await createInvoiceItems(
          invoiceData.invoiceItems,
          invoiceId,
          session,
          false
        );

      let totalCostOfGoods = 0;
      let totalSales = invoiceData.totalAmount;

      for (const item of invoiceData.invoiceItems) {
        const product = await Product.findById(item.productId)
          .populate("accountId")
          .session(session);
        if (!product || product.stock < item.quantity) {
          throw new Error(
            `موجودی محصول ${
              product?.title || "[نامشخص]"
            } کافی نیست. موجودی فعلی: ${product?.stock || 0}`
          );
        }
        const costPerUnit =
          product.stock > 0 ? product.accountId.balance / product.stock : 0;
        totalCostOfGoods += costPerUnit * item.quantity;
      }

      await updateProductStock(bulkProductOperations, false, session);

      invoice.InvoiceItems = invoiceItemIds;
            // اختصاص شناسه Ledger به فاکتور
     

      const ledgerId =  await createFinancialDocumentsForSales(
        invoiceId,
        invoice.shop,
        user.id,
        invoiceData.accountAllocations,
        accountIdMap,
        totalCostOfGoods,
        totalSales,
        session,
        
      );
      invoice.Ledger = ledgerId;

      await invoice.save({ session });
      return invoice;
    });

    return { success: true, message: "فاکتور فروش با موفقیت ثبت شد." };
  } catch (error) {
    console.error("خطا در AddSalesInvoiceAction:", error);
    return {
      success: false,
      message: `ثبت فاکتور فروش با مشکل مواجه شد: ${error.message}`,
    };
  } finally {
    session.endSession();
  }
}

export async function AddPurchaseReturnAction(invoiceData) {
  
  await connectDB();
  const user = await getAuthenticatedUser();
  if (!user) {
    return { status: 401, message: "کاربر وارد نشده است." };
  }

  const session = await mongoose.startSession();

  try {
    const result = await session.withTransaction(async () => {
      const requiredFields = [
        "type",
        "totalAmount",
        "invoiceItems",
        "storeId",
        "customerId",
        "accountAllocations",
      ];
      validateInvoiceData(invoiceData, requiredFields);

      const totalItems = invoiceData.invoiceItems.reduce(
        (acc, item) => acc + item.quantity,
        0
      );

      const invoice = new Invoice({
        description: invoiceData.description || "",
        type: invoiceData.type,
        totalPrice: -invoiceData.totalAmount, // توجه: مبلغ کل باید منفی باشد
        totalItems: totalItems,
        contact: invoiceData.customerId,
        shop: invoiceData.storeId,
        createdBy: user.id,
        updatedBy: user.id,
      });

      const invoiceId = invoice._id;

      const { invoiceItemIds, accountIdMap, bulkProductOperations } =
        await createInvoiceItems(
          invoiceData.invoiceItems,
          invoice._id,
          session,
          true
        );

      await updateProductStock(bulkProductOperations, false, session); // توجه: برای برگشت باید به نوعی مدیریت شود

      invoice.InvoiceItems = invoiceItemIds;

      // استفاده از تابع مخصوص برگشت از خرید برای حسابداری
      const ledgerId = await createFinancialDocumentsForPurchaseReturn(
        invoice._id,
        invoice.shop,
        user.id,
        invoiceData.accountAllocations,
        accountIdMap,
        session
      );
      
      invoice.Ledger = ledgerId;
      await invoice.save({ session });

      return invoice;
    });

    return { success: true, message: "بازگشت خرید با موفقیت ثبت شد." };
  } catch (error) {
    console.error("خطا در AddPurchaseReturnAction:", error);
    return {
      success: false,
      message: `ثبت بازگشت خرید با مشکل مواجه شد: ${error.message}`,
    };
  } finally {
    session.endSession();
  }
}

async function createFinancialDocumentsForPurchaseReturn(
  invoiceId,
  shopId,
  userId,
  accountAllocations,
  accountIdMap,
  session
) {
  const ledger = new Ledger({
    referenceId:  invoiceId ,
    type: "invoice",
    shop: shopId,
    createdBy: userId,
    updatedBy: userId,
  });


  const generalLedgers = [];
  const bulkAccountOperations = {};

  // ایجاد ترازنامه‌ها برای هر تخصیصی
  for (const allocation of accountAllocations) {
    const generalLedger = new GeneralLedger({
      ledger: ledger._id,
      account: allocation.accountId,
      debit: allocation.amount, // باید بدهکار شود.
      credit: 0,
      referenceId:  invoiceId ,
      type: "invoice",
      shop: shopId,
      createdBy: userId,
      updatedBy: userId,
    });

    generalLedgers.push(generalLedger);

    if (bulkAccountOperations[allocation.accountId.toString()]) {
      bulkAccountOperations[allocation.accountId.toString()].debit +=
        allocation.amount;
    } else {
      bulkAccountOperations[allocation.accountId.toString()] = {
        accountId: allocation.accountId,
        debit: allocation.amount,
      };
    }
  }

  // برای حساب‌های مربوط به موجودی، بستانکار و هزینه‌های برگشت از خرید، در بدهکار ثبت می‌شود
  for (const [accountId, amount] of Object.entries(accountIdMap)) {
    const generalLedger = new GeneralLedger({
      ledger: ledger._id,
      account: accountId,
      debit: 0,
      credit: amount, // برای موجودی باید بستانکار شود.
      referenceId:  invoiceId ,
      type: "invoice",
      shop: shopId,
      createdBy: userId,
      updatedBy: userId,
    });

    // await generalLedger.save({ session });
    generalLedgers.push(generalLedger);

    if (!bulkAccountOperations[accountId.toString()]) {
      bulkAccountOperations[accountId.toString()] = {
        accountId: accountId,
        credit: amount,
      };
    } else {
      bulkAccountOperations[accountId.toString()].credit += amount;
    }
  }
  // ذخیره GeneralLedgers به صورت دسته‌ای
  const savedGeneralLedgers = await GeneralLedger.insertMany(generalLedgers, {
    session,
  });

  await updateAccountsBalance(bulkAccountOperations, session);

  // تنظیم فیلد transactions در Ledger
  ledger.transactions = savedGeneralLedgers.map((gl) => gl._id);

  // ذخیره نهایی Ledger
  await ledger.save({ session });

  return ledger._id;
}

export async function getLastPurchasedPrice(productId) {
  await connectDB();

  // اعتبارسنجی productId
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    console.error("شناسه محصول معتبر نیست:", productId);
    return null;
  }

  try {
    const productObjectId = new mongoose.Types.ObjectId(productId);

    const pipeline = [
      // فیلتر کردن فاکتورهای از نوع 'Purchase'
      { $match: { type: "Purchase" } },

      // الحاق اسناد InvoiceItem به هر Invoice
      {
        $lookup: {
          from: "invoiceitems", // نام مجموعه 'InvoiceItem' در پایگاه داده
          localField: "InvoiceItems",
          foreignField: "_id",
          as: "invoiceItemsPopulated",
        },
      },

      // فیلتر کردن فاکتورهایی که حداقل یکی از InvoiceItems آنها محصول مورد نظر را دارد
      { $match: { "invoiceItemsPopulated.product": productObjectId } },

      // مرتب‌سازی براساس تاریخ ایجاد به ترتیب نزولی
      { $sort: { createdAt: -1 } },

      // محدود کردن به اولین سند (آخرین فاکتور)
      { $limit: 1 },

      // باز کردن آرایه invoiceItemsPopulated به اسناد جداگانه
      { $unwind: "$invoiceItemsPopulated" },

      // فیلتر کردن InvoiceItems Populated برای محصول مورد نظر
      { $match: { "invoiceItemsPopulated.product": productObjectId } },

      // انتخاب فیلد unitPrice از InvoiceItem مربوطه
      { $project: { unitPrice: "$invoiceItemsPopulated.unitPrice", _id: 0 } },
    ];

    const result = await Invoice.aggregate(pipeline).exec();

    if (!result || result.length === 0) {
      return null;
    }

    const unitPrice = result[0].unitPrice;

    // تبدیل unitPrice به رشته قبل از بازگرداندن آن
    return unitPrice.toString();
  } catch (error) {
    console.error("خطا در دریافت آخرین قیمت خرید:", error);
    return null;
  }
}
export async function AddPurchaseInvoiceAction(invoiceData) {
  await connectDB();
  const user = await getAuthenticatedUser();
  if (!user) {
    return { status: 401, message: "کاربر وارد نشده است." };
  }

  const session = await mongoose.startSession();

  try {
    const result = await session.withTransaction(async () => {
      const requiredFields = [
        "type",
        "totalAmount",
        "invoiceItems",
        "storeId",
        "customerId",
        "accountAllocations",
      ];
      validateInvoiceData(invoiceData, requiredFields);

      const totalItems = invoiceData.invoiceItems.reduce(
        (acc, item) => acc + item.quantity,
        0
      );

      // پیش‌تولید شناسه فاکتور
      const invoice = new Invoice({
        // سایر فیلدها را می‌توانید در اینجا مقداردهی کنید
        description: invoiceData.description || "",
        type: invoiceData.type,
        totalPrice: invoiceData.totalAmount,
        totalItems: totalItems,
        contact: invoiceData.customerId,
        shop: invoiceData.storeId,
        createdBy: user.id,
        updatedBy: user.id,
        // فیلد Ledger را در ابتدا مقداردهی نمی‌کنیم
      });

      // استخراج شناسه فاکتور پیش‌تولید شده
      const invoiceId = invoice._id;

      // ایجاد اقلام فاکتور و به‌روزرسانی موجودی محصولات
      const { invoiceItemIds, accountIdMap, bulkProductOperations } =
        await createInvoiceItems(
          invoiceData.invoiceItems,
          invoiceId,
          session,
          true
        );

      await updateProductStock(bulkProductOperations, true, session);
      invoice.InvoiceItems = invoiceItemIds;

      // ایجاد سند مالی با تنظیم توضیحات در لحظه ایجاد
      const ledgerId = await createFinancialDocuments(
        invoiceId,
        invoice.shop,
        user.id,
        invoiceData.accountAllocations,
        accountIdMap,
        true,
        0,
        session
      );

      // اختصاص شناسه Ledger به فاکتور
      invoice.Ledger = ledgerId;

      // ذخیره‌سازی نهایی فاکتور با Ledger
      await invoice.save({ session });

      return invoice;
    });

    // بازگشت داده‌ها با حذف فیلدهای حلقه‌ای
    const responseData = {
      _id: result._id,
      description: result.description,
      referenceId:result.referenceId,
      type: result.type,
      totalPrice: result.totalPrice,
      totalItems: result.totalItems,
      contact: result.contact,
      shop: result.shop,
      createdBy: result.createdBy,
      updatedBy: result.updatedBy,
      InvoiceItems: result.InvoiceItems,
      Ledger: result.Ledger,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    };

    return {
      success: true,
      message: "فاکتور با موفقیت ثبت شد.",
      data: responseData,
    };
  } catch (error) {
    console.error("خطا در AddPurchaseInvoiceAction:", error);
    return {
      success: false,
      message: `ثبت فاکتور با مشکل مواجه شد: ${error.message}`,
    };
  } finally {
    session.endSession();
  }
}
export async function createFinancialDocuments(
  description,
  shopId,
  userId,
  accountAllocations,
  accountIdMap,
  isPurchase,
  totalCostOfGoods,
  session
) {
  // ایجاد سند Ledger بدون ذخیره‌سازی اولیه
  const ledger = new Ledger({
    referenceId:  description ,
      type: "invoice",
    description,
    shop: shopId,
    createdBy: userId,
    updatedBy: userId,
  });

  // آرایه‌ای برای نگه‌داری GeneralLedgerها
  const generalLedgers = [];
  const bulkAccountOperations = {};

  const validateAmount = (amount) => {
    return isNaN(amount) ? 0 : amount;
  };

  // پردازش allocations
  for (const allocation of accountAllocations) {
    const gl = {
      ledger: ledger._id,
      account: allocation.accountId,
      debit: isPurchase ? 0 : validateAmount(allocation.amount),
      credit: isPurchase ? validateAmount(allocation.amount) : 0,
      referenceId:  description ,
      type: "invoice",
      shop: shopId,
      createdBy: userId,
      updatedBy: userId,
    };
    generalLedgers.push(gl);

    // به‌روزرسانی bulkAccountOperations
    if (isPurchase) {
      if (bulkAccountOperations[allocation.accountId.toString()]) {
        bulkAccountOperations[allocation.accountId.toString()].credit +=
          allocation.amount;
      } else {
        bulkAccountOperations[allocation.accountId.toString()] = {
          accountId: allocation.accountId,
          credit: allocation.amount,
        };
      }
    } else {
      if (bulkAccountOperations[allocation.accountId.toString()]) {
        bulkAccountOperations[allocation.accountId.toString()].debit +=
          allocation.amount;
      } else {
        bulkAccountOperations[allocation.accountId.toString()] = {
          accountId: allocation.accountId,
          debit: allocation.amount,
        };
      }
    }
  }

  // پردازش accountIdMap
  for (const [accountId, costOfGoods] of Object.entries(accountIdMap)) {
    const gl = {
      ledger: ledger._id,
      account: accountId,
      debit: isPurchase ? validateAmount(costOfGoods) : 0,
      credit: isPurchase ? 0 : validateAmount(costOfGoods),
      referenceId:  description ,
      type: "invoice",
      shop: shopId,
      createdBy: userId,
      updatedBy: userId,
    };
    generalLedgers.push(gl);

    // به‌روزرسانی bulkAccountOperations
    if (isPurchase) {
      if (bulkAccountOperations[accountId.toString()]) {
        bulkAccountOperations[accountId.toString()].debit += costOfGoods;
      } else {
        bulkAccountOperations[accountId.toString()] = {
          accountId: accountId,
          debit: costOfGoods,
        };
      }
    } else {
      if (bulkAccountOperations[accountId.toString()]) {
        bulkAccountOperations[accountId.toString()].credit += costOfGoods;
      } else {
        bulkAccountOperations[accountId.toString()] = {
          accountId: accountId,
          credit: costOfGoods,
        };
      }
    }
  }

  // ذخیره GeneralLedgers به صورت دسته‌ای
  const savedGeneralLedgers = await GeneralLedger.insertMany(generalLedgers, {
    session,
  });

  // به‌روزرسانی تعادل حساب‌ها
  await updateAccountsBalance(bulkAccountOperations, session);

  // تنظیم فیلد transactions در Ledger
  ledger.transactions = savedGeneralLedgers.map((gl) => gl._id);

  // ذخیره نهایی Ledger
  await ledger.save({ session });

  return ledger._id;
}