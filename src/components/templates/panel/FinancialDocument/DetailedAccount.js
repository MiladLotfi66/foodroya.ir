"use client";
import FormTemplate from "@/templates/generalcomponnents/formTemplate";
import { useParams } from "next/navigation";
import { Toaster, toast } from "react-hot-toast";
import { useCallback, useEffect, useState } from "react";
import SelectAccountModal from "./SelectAcountModal";
import { getAccountTransactions } from "./FinancialDocumentsServerActions";
import TransactionTable from "./TransactionTable";
import { GetShopLogos } from "@/templates/Shop/ShopServerActions";

function DetailedAccount() {
  const params = useParams();
  const { ShopId } = params;
  const [BGImage, setbGImage] = useState([]);

  const [showSelectAccountModal, setShowSelectAccountModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [transactions, setTransactions] = useState();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const getShopPanelImage = useCallback(async () => {
    try {
      if (!ShopId) {
        console.error("نام یکتای فروشگاه موجود نیست.");
        return;
      }

      const response = await GetShopLogos(ShopId);

      setbGImage(response.logos.backgroundPanelUrl);
    } catch (error) {
      console.error("Error fetching banners:", error);
    }
  }, [ShopId]);

  useEffect(() => {
    getShopPanelImage();
  }, [ShopId]);
  // تابع برای باز کردن مودال
  const handleOpenModal = useCallback(() => {
    setShowSelectAccountModal(true);
  }, []);

  // تابع برای بستن مودال
  const handleCloseModal = useCallback(() => {
    setShowSelectAccountModal(false);
    setSelectedAccount(null);
    setError(null);
  }, []);

  // تابع برای واکشی تراکنش‌ها
  const handleGetAccountTransactions = async (accountId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAccountTransactions(accountId);
      
      setTransactions(data);
    } catch (err) {
      setError(err.message || 'خطایی در دریافت تراکنش‌ها رخ داده است.');
    } finally {
      setLoading(false);
    }
  };
    // استفاده از useEffect برای واکشی تراکنش‌ها در زمان تغییر حساب انتخاب‌شده
    useEffect(() => {
        
        if (selectedAccount && selectedAccount._id) {
            
          handleGetAccountTransactions(selectedAccount._id);
        }

      }, [selectedAccount]);
    

  // تابع برای دریافت حساب انتخاب شده از کامپوننت SelectAccountModal
  const handleAccountSelect = useCallback((account) => {
    try {
      setSelectedAccount(account);
      setShowSelectAccountModal(false);
      toast.success("حساب با موفقیت انتخاب شد.");
      // اینجا می‌توانید منطق اضافی خود را اضافه کنید، مانند ذخیره حساب در سرور
    } catch (err) {
      setError("خطا در انتخاب حساب. لطفاً دوباره تلاش کنید.");
      console.error(err);
    }
  }, []);

  // تابع برای دریافت خطا از فرزند
  const handleChildError = useCallback((errorMessage) => {
    toast.error(errorMessage || "خطایی رخ داد.");
  }, []);

  return (
    <FormTemplate BGImage={BGImage}>
      <div className="bg-white bg-opacity-95 dark:bg-zinc-700 dark:bg-opacity-95 shadow-normal rounded-2xl mt-36">
        
        {/* مودال SelectAccountModal */}
        {showSelectAccountModal && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
            onClick={handleCloseModal} // بستن مودال با کلیک روی پس‌زمینه
          >
            <div
              className="relative bg-white dark:bg-zinc-700 shadow-lg rounded-2xl w-[90%] sm:w-[70%] md:w-[60%] lg:w-[50%] p-6"
              onClick={(e) => e.stopPropagation()} // جلوگیری از بستن مودال با کلیک داخل آن
            >
              <SelectAccountModal
                selectionMode="account"
                onSelect={handleAccountSelect}
                onCancel={handleCloseModal}
                onError={handleChildError}
              />
            </div>
          </div>
        )}

        <div className="flex justify-between p-2 md:p-5 mt-10 md:mt-36">
          <h1 className="text-3xl font-MorabbaBold">حساب معین</h1>
          <button
            className="h-11 md:h-14 bg-teal-600 rounded-xl hover:bg-teal-700 text-white mt-4 p-4"
            aria-label="select account"
            onClick={handleOpenModal}
          >
            انتخاب حساب
          </button>
        </div>

        {selectedAccount ? (
          <div className="p-3 flex gap-4">
            {/* <FaUserCircle size={50} /> آیکون حساب */}
            <h3>{selectedAccount.title}</h3>
            <p>کدینگ حساب: {selectedAccount.accountCode}</p>
            <p>نوع حساب: {selectedAccount.accountType}</p>
            {/* اطلاعات اضافی دیگر می‌تواند اینجا اضافه شود */}
          </div>
        ) : (
          <p className="p-3 flex gap-4">هیچ حسابی انتخاب نشده است.</p>
        )}
           {loading && <p className="mt-4 text-gray-600">در حال بارگذاری...</p>}
      {error && <p className="mt-4 text-red-500">{error}</p>}
      
      {!loading && !error && transactions?.length > 0 && (
        <TransactionTable transactions={transactions} />
      )}


      </div>
      <Toaster />
    </FormTemplate>
  );
}

export default DetailedAccount;
