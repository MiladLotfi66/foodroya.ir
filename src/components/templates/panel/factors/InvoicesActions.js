"use server";
import mongoose from 'mongoose';
import Invoice from './Invoice';
import InvoiceItem from './InvoiceItem';
import Ledger from '../FinancialDocument/Ledger';
import GeneralLedger from '../FinancialDocument/GeneralLedger';
import connectDB from '@/utils/connectToDB';
import { authenticateUser } from '@/templates/Shop/ShopServerActions';
import Product from '../Product/Product';
import Account from '../Account/Account';
import { GetAccountIdBystoreIdAndAccountCode } from '../Account/accountActions';

export async function GetShopInvocesByShopId(ShopId) {
  try {
    await connectDB();
    let userData;
    try {
      userData = await authenticateUser();
    } catch (authError) {
      userData = null;
      console.log("Authentication failed:", authError);
    }

    if (!userData) {
      return { status: 401, message: 'کاربر وارد نشده است.' };
    }

    if (!ShopId) {
      throw new Error("ShopId not found");
    }

    ///////////////////////////
    // واکشی فاکتورها با پر کردن اطلاعات مرتبط
    const Invoices = await Invoice.find({ shop: ShopId })
      .populate({
        path: 'contact',
        select: 'name phone email', // فیلدهای مورد نیاز از مدل Contact
      })
      .populate({
        path: 'createdBy',
        select: 'name userImage userUniqName', // فیلدهای مورد نیاز از مدل User
      })
      .populate({
        path: 'updatedBy',
        select: 'name userImage userUniqName', // فیلدهای مورد نیاز از مدل User
      })
      .populate({
        path: 'InvoiceItems',
        populate: {
          path: 'product',
          select: 'title', // فیلدهای مورد نیاز از مدل Product
        }
      })
      .lean();

    // تبدیل فیلدهای خاص به plain strings
    const plainInvoices = Invoices?.map(invoice => ({
      ...invoice,
      _id: invoice._id.toString(),
      shop: invoice.shop.toString(),
      description: invoice.description.toString(),
      type: invoice.type.toString(),
      totalPrice: invoice.totalPrice.toString(),
      totalItems: invoice.totalItems.toString(),
      contact: invoice.contact ? {
        _id: invoice.contact._id.toString(),
        name: invoice.contact.name,
        phone: invoice.contact.phone,
        email: invoice.contact.email,
      } : null,
      createdBy: invoice.createdBy ? {
        _id: invoice.createdBy._id.toString(),
       
        name: invoice.createdBy.name,
        userImage: invoice.createdBy.userImage,
        userUniqName: invoice.createdBy.userUniqName,
      } : null,
      updatedBy: invoice.updatedBy ? {
        _id: invoice.updatedBy._id.toString(),
        name: invoice.updatedBy.name,
        userImage: invoice.updatedBy.userImage,
        userUniqName: invoice.updatedBy.userUniqName,
      } : null,
      InvoiceItems: invoice.InvoiceItems ? invoice.InvoiceItems.map(item => ({
        ...item,
        _id: item._id.toString(),
        product: item.product ? {
          _id: item.product._id.toString(),
          title: item.product.title,
        } : null,
        invoice: item.invoice.toString(),
      })) : [],
      createdAt: invoice.createdAt.toISOString(),
      updatedAt: invoice.updatedAt.toISOString()
    }));

    return { Invoices: plainInvoices, status: 200 };
  } catch (error) {
    console.error("خطا در دریافت فاکتور‌ها:", error);
    return { error: error.message, status: 500 };
  }
}
