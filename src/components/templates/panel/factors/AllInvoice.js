// InvoiceManage.jsx
"use client";
import { useState, useEffect, useCallback } from "react";
import FormTemplate from "@/templates/generalcomponnents/formTemplate";
import InvoiceCard from "./InvoiceCard";
import EditSvg from "@/module/svgs/EditSvg";
import DeleteSvg from "@/module/svgs/DeleteSvg";
import { GetShopInvocesByShopId } from "./InvoicesActions";
import { deleteInvoiceAction } from "./invoiceItemsServerActions";
import { useShopInfoFromRedux } from "@/utils/getShopInfoFromREdux";
import { useSession } from "next-auth/react";
import { getUserPermissionInShopAccessList, GetUserPermissionsInShop } from "../rols/RolesPermissionActions";
import NotAuthenticated from "../rols/NotAuthenticated";
import PermissionLoading from "../rols/PermissionLoading";
import NoPermission from "../rols/NoPermission";
import { Toaster, toast } from "react-hot-toast";

function InvoiceManage() {
  const [selectedInvioce, setSelectedInvoice] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const { currentShopId, shopPanelImage } = useShopInfoFromRedux();
  const ShopId = currentShopId;
  const BGImage = shopPanelImage;

  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";

  const [permissions, setPermissions] = useState({
    Purchase: {},
    Sale: {},
    PurchaseReturn: {},
    SaleReturn: {},
    Waste: {},
    // سایر انواع فاکتورها را اینجا اضافه کنید
  });

  const [hasViewPermission, setHasViewPermission] = useState(null);
  const [hasAddPermission, setHasAddPermission] = useState(null);
  const [hasEditPermission, setHasEditPermission] = useState(null);
  const [hasDeletePermission, setHasDeletePermission] = useState(null);
  const [permissionLoading, setPermissionLoading] = useState(true);

  const processPermissions = (permissionsArray) => {
    return {
      view: permissionsArray.includes("view"),
      add: permissionsArray.includes("add"),
      edit: permissionsArray.includes("edit"),
      delete: permissionsArray.includes("delete"),
    };
  };

  const checkViewPermission = useCallback(async () => {
    if (!isAuthenticated) {
      setPermissionLoading(false);
      return;
    }

    if (!ShopId) {
      // اگر ShopId موجود نیست، منتظر بمانید تا مقداردهی شود
      return;
    }

    setPermissionLoading(true); // شروع بارگذاری مجدد

    try {
      const response = await getUserPermissionInShopAccessList(
        ShopId,
        "allInvoicesPermissions"
      );

      if (response.status === 200) {
        // بررسی اینکه آیا دسترسی view در آرایه hasPermission وجود دارد
        setHasViewPermission(response.hasPermission.includes("view"));
        setHasAddPermission(response.hasPermission.includes("add"));
        setHasEditPermission(response.hasPermission.includes("edit"));
        setHasDeletePermission(response.hasPermission.includes("delete"));
      } else {
        console.error("خطا در بررسی دسترسی:", response.message);
        setHasViewPermission(false);
        setHasAddPermission(false);
        setHasEditPermission(false);
        setHasDeletePermission(false);
      }
    } catch (error) {
      console.error("Error checking view permission:", error);
      setHasViewPermission(false);
      setHasAddPermission(false);
      setHasEditPermission(false);
      setHasDeletePermission(false);
      toast.error("خطا در بررسی دسترسی.");
    } finally {
      setPermissionLoading(false);
    }
  }, [ShopId, isAuthenticated]);

  const checkInvoicesPermission = useCallback(async () => {
    if (!isAuthenticated) {
      setPermissionLoading(false);
      return;
    }
  
    if (!ShopId) {
      // اگر ShopId موجود نیست، منتظر بمانید تا مقداردهی شود
      return;
    }
  
    setPermissionLoading(true); // شروع بارگذاری مجدد
  
    try {
      const response = await GetUserPermissionsInShop(ShopId);
  
      if (response.status === 200) {
        const newPermissions = {
          Purchase: processPermissions(response.permissions.purchaseInvoicesPermissions || []),
          Sale: processPermissions(response.permissions.saleInvoicesPermissions || []),
          PurchaseReturn: processPermissions(response.permissions.purchaseReturnInvoicesPermissions || []),
          SaleReturn: processPermissions(response.permissions.saleReturnInvoicesPermissions || []),
          Waste: processPermissions(response.permissions.wasteInvoicesPermissions || []),
          // پردازش سایر انواع فاکتورها در صورت نیاز
        };
  
        // اگر مجوزهای عمومی (allInvoicesPermissions) وجود دارند، به هر نوع فاکتور اضافه کنید
        const generalPermissions = processPermissions(response.permissions.allInvoicesPermissions || []);
        Object.keys(newPermissions).forEach((type) => {
          newPermissions[type] = { ...generalPermissions, ...newPermissions[type] };
        });
  
  
        setPermissions(newPermissions);
      } else {
        console.error("خطا در بررسی دسترسی:", response.message);
        setPermissions({
          Purchase: {},
          Sale: {},
          PurchaseReturn: {},
          SaleReturn: {},
          Waste: {},
        });
      }
    } catch (error) {
      console.error("خطا در بررسی دسترسی:", error);
      setPermissions({
        Purchase: {},
        Sale: {},
        PurchaseReturn: {},
        SaleReturn: {},
        Waste: {},
      });
      toast.error("خطا در بررسی دسترسی.");
    } finally {
      setPermissionLoading(false);
    }
  }, [ShopId, isAuthenticated]);
  

  useEffect(() => {
    if (isAuthenticated) {
      // بارگذاری دسترسی‌ها زمانی که احراز هویت انجام شده
      checkViewPermission();
      checkInvoicesPermission();
    } else {
      // اگر احراز هویت نشده باشد، مطمئن شوید که وضعیت بارگذاری تنظیم شده است
      setPermissionLoading(false);
    }
  }, [checkViewPermission, checkInvoicesPermission, isAuthenticated]);

  const refreshInvioces = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const response = await GetShopInvocesByShopId(ShopId);
      setInvoices(response.Invoices);
    } catch (error) {
      console.error("Error fetching invoices:", error);
    }
  }, [ShopId, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && hasViewPermission) {
      refreshInvioces();
    }
  }, [isAuthenticated, hasViewPermission, refreshInvioces]);

  const handleDeleteInvoice = useCallback(async (InvoiceID) => {
    const isConfirmed = window.confirm("آیا از حذف این فاکتور اطمینان دارید؟");
    if (!isConfirmed) return; // اگر کاربر لغو کند، ادامه نده
    let res = await deleteInvoiceAction(InvoiceID, ShopId);
    if (res.success) {
      const updatedInvoices = invoices.filter((invoice) => invoice._id !== InvoiceID);
      setInvoices(updatedInvoices);
    } else {
      console.error("Error deleting invoice:", res.status);
    }
  }, [invoices, ShopId]);

  const handleEditClick = (invoice) => {
    setIsOpenAddInvoice(true);
    setSelectedInvoice(invoice);
  };

  if (status === "loading" || permissionLoading) {
    return <PermissionLoading BGImage={BGImage} />;
  }

  if (!isAuthenticated) {
    return <NotAuthenticated />;
  }

  if (!hasViewPermission) {
    return <NoPermission />;
  }

  return (
    <FormTemplate BGImage={BGImage}>
      <div className="bg-white bg-opacity-95 dark:bg-zinc-700 dark:bg-opacity-95 shadow-normal rounded-2xl mt-8 md:mt-36">
        <div className="hidden">
          <EditSvg />
          <DeleteSvg />
        </div>
        <div className="flex justify-between p-2 md:p-5 mt-8 md:mt-36">
          <h1 className="text-2xl md:text-3xl font-MorabbaBold">مدیریت فاکتور ها</h1>
          {hasAddPermission && (
            <button
              className="h-11 md:h-14 bg-teal-600 rounded-xl hover:bg-teal-700 text-white mt-4 p-4"
              aria-label="add Invoice"
              onClick={() => {
                // عملکرد افزودن فاکتور
              }}
            >
              افزودن
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-2 p-4 pb-16 max-h-[70vh] overflow-y-auto justify-items-center">
          {invoices?.map((invoice) => (
            <InvoiceCard
              key={invoice._id}
              invoice={invoice}
              handleDeleteInvoice={handleDeleteInvoice}
              handleEditClick={() => handleEditClick(invoice)}
              permissions={permissions[invoice.type] || {}}
            />
          ))}
        </div>
      </div>
      <Toaster />

    </FormTemplate>
  );
}

export default InvoiceManage;
