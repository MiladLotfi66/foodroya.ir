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

    const Invoices = await Invoice.find({ shop: ShopId })
      .populate({
        path: 'contact',
        select: 'name phone email',
      })
      .populate({
        path: 'createdBy',
        select: 'name userImage userUniqName',
      })
      .populate({
        path: 'updatedBy',
        select: 'name userImage userUniqName',
      })
      .populate({
        path: 'InvoiceItems',
        populate: {
          path: 'product',
          select: 'title',
        }
      })
      .lean();

    const plainInvoices = Invoices?.map(invoice => ({
      ...invoice,
      _id: invoice._id.toString(),
      shop: invoice.shop.toString(),
      description: invoice.description?.toString() || '',
      type: invoice.type?.toString() || '',
      // Convert Decimal128 to string or number
      totalPrice: Number(invoice.totalPrice) || 0,
      totalItems: Number(invoice.totalItems) || 0,
      contact: invoice.contact ? {
        _id: invoice.contact._id.toString(),
        name: invoice.contact.name || '',
        phone: invoice.contact.phone || '',
        email: invoice.contact.email || '',
      } : null,
      createdBy: invoice.createdBy ? {
        _id: invoice.createdBy._id.toString(),
        name: invoice.createdBy.name || '',
        userImage: invoice.createdBy.userImage || '',
        userUniqName: invoice.createdBy.userUniqName || '',
      } : null,
      updatedBy: invoice.updatedBy ? {
        _id: invoice.updatedBy._id.toString(),
        name: invoice.updatedBy.name || '',
        userImage: invoice.updatedBy.userImage || '',
        userUniqName: invoice.updatedBy.userUniqName || '',
      } : null,
      InvoiceItems: invoice.InvoiceItems ? invoice.InvoiceItems.map(item => ({
        _id: item._id.toString(),
        product: item.product ? {
          _id: item.product._id.toString(),
          title: item.product.title || '',
        } : null,
        invoice: item.invoice.toString(),
        quantity: Number(item.quantity) || 0,
        // Convert Decimal128 to number
        unitPrice: Number(item.unitPrice) || 0,
        totalPrice: Number(item.totalPrice) || 0,
        Features: item.Features || [],
        description: item.description?.toString() || '',
        createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : null,
        updatedAt: item.updatedAt ? new Date(item.updatedAt).toISOString() : null
      })) : [],
      createdAt: invoice.createdAt ? new Date(invoice.createdAt).toISOString() : null,
      updatedAt: invoice.updatedAt ? new Date(invoice.updatedAt).toISOString() : null
    }));

    return { Invoices: plainInvoices, status: 200 };
  } catch (error) {
    console.error("خطا در دریافت فاکتور‌ها:", error);
    return { error: error.message, status: 500 };
  }
}


