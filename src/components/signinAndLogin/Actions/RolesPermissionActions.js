"use server";
import RolePerimision from "@/models/RolePerimision";
import connectDB from "@/utils/connectToDB";
import { cookies } from "next/headers";
import RoleSchema from "@/utils/yupSchemas/RoleSchema";
import AuthenticateUser from "@/utils/authenticateUserInActions";
import RoleInShop from "@/models/RoleInShop";
import shops from "@/models/shops";

// احراز هویت کاربر
export async function authenticateUser() {
  try {
    const cookieStore = cookies();
    const accessToken = cookieStore.get("next-auth.session-token")?.value;

    if (!accessToken) {
      throw new Error("Access token not found");
    }

    const res = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/session`, {
      headers: {
        "Content-Type": "application/json",
        Cookie: `next-auth.session-token=${accessToken}`,
      },
      credentials: "include",
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch user data. Status: ${res.status}`);
    }

    const session = await res.json();

    if (!session.user) {
      throw new Error("No user data found in session");
    }

    return session.user;
  } catch (error) {
    console.error("Error in authenticateUser:", error);
    return { error: error.message, status: 500 };
  }
}

// بررسی دسترسی کاربر
const hasUserAccess = async (userId) => {
  try {
    await connectDB();
    return true; // در اینجا می‌توانید منطق دسترسی را تعریف کنید
  } catch (error) {
    console.error("Error in hasUserAccess function:", error);
    return false;
  }
};

// افزودن نقش
export async function AddRoleServerAction(RoleData) {
  try {
    await connectDB();

    // استخراج ShopUnicName از RoleData
    const { shopUniqName } = RoleData;

    // دریافت آی‌دی شاپ
    if (!shopUniqName) {
      throw new Error("shopUniqName is required in RoleData");
    }

    const shopId = await GetShopIdByShopUniqueName(shopUniqName);

    if (!shopId) {
      throw new Error("shopId is required in RoleData");
    }

    const userData = await authenticateUser();

    if (!userData) {
      throw new Error("User data not found");
    }

    const validatedData = await RoleSchema.validate(RoleData, {
      abortEarly: false,
    });

    const newRole = new RolePerimision({
      ...validatedData,
      ShopId: shopId, // ذخیره آی‌دی شاپ در دیتابیس
      CreatedBy: userData.id,
      LastEditedBy: userData.id,
    });

    await newRole.save();

    return { message: "نقش با موفقیت ثبت شد", status: 201 };
  } catch (error) {
    console.error("Error in AddRoleServerAction:", error);
    return { error: error.message, status: 500 };
  }
}

// ویرایش نقش
export async function EditRole(RoleData) {
  try {
    await connectDB();
    const userData = await authenticateUser();

    if (!userData) {
      throw new Error("User data not found");
    }

    const RoleID = RoleData.get("id");
    if (!RoleID) {
      throw new Error("آی‌دی نقش ارسال نشده است");
    }
    const Role = await RolePerimision.findById(RoleID);

    if (!Role) {
      throw new Error("نقشی با این آی‌دی یافت نشد");
    }

    if (!await hasUserAccess(Role.CreatedBy)) {
      throw new Error("شما دسترسی لازم برای این عملیات را ندارید");
    }

    const validatedData = await RoleSchema.validate(
      {
        RoleTitle: RoleData.get("RoleTitle"),
        RoleStatus: RoleData.get("RoleStatus"),
        bannersPermissions: RoleData.get("bannersPermissions"),
        rolesPermissions: RoleData.get("rolesPermissions"),
      },
      { abortEarly: false }
    );

    const updatedRole = {
      ...validatedData,
      LastEditedBy: userData.id,
    };

    await RolePerimision.findByIdAndUpdate(RoleID, updatedRole, { new: true });
    return { message: "ویرایش نقش با موفقیت انجام شد", status: 200 };
  } catch (error) {
    return { error: error.message, status: 500 };
  }
}

// حذف نقش
export async function DeleteRole(RoleID) {
  try {
    await connectDB();
    const userData = await authenticateUser();

    const Role = await RolePerimision.findById(RoleID);

    if (!Role) {
      throw new Error("نقش مورد نظر یافت نشد");
    }

    if (!await hasUserAccess(Role.CreatedBy)) {
      throw new Error("شما دسترسی لازم برای این عملیات را ندارید");
    }

    await RolePerimision.deleteOne({ _id: RoleID });

    return { message: "نقش با موفقیت حذف شد", status: 200 };
  } catch (error) {
    console.error("خطا در حذف نقش:", error);
    return { error: error.message, status: 500 };
  }
}

// فعال‌سازی نقش
export async function EnableRole(RoleID) {
  try {
    await connectDB();
    const userData = await authenticateUser();

    const Role = await RolePerimision.findById(RoleID);

    if (!Role) {
      throw new Error("نقشی با این آی‌دی یافت نشد");
    }

    if (!await hasUserAccess(Role.CreatedBy)) {
      throw new Error("شما دسترسی لازم برای این عملیات را ندارید");
    }

    Role.RoleStatus = true;

    await Role.save();

    return {
      message: "وضعیت نقش با موفقیت به true تغییر یافت",
      status: 200,
    };
  } catch (error) {
    return { error: error.message, status: 500 };
  }
}

// غیرفعال‌سازی نقش
export async function DisableRole(RoleID) {
  try {
    await connectDB();
    const userData = await authenticateUser();

    const Role = await RolePerimision.findById(RoleID);

    if (!Role) {
      throw new Error("نقشی با این آی‌دی یافت نشد");
    }

    if (!await hasUserAccess(Role.CreatedBy)) {
      throw new Error("شما دسترسی لازم برای این عملیات را ندارید");
    }

    Role.RoleStatus = false;

    await Role.save();

    return {
      message: "وضعیت نقش با موفقیت به false تغییر یافت",
      status: 200,
    };
  } catch (error) {
    return { error: error.message, status: 500 };
  }
}

export async function GetShopRolesByShopUniqName(ShopUniqName) {
  try {
    await connectDB();
    const userData = await authenticateUser();

    if (!userData) {
      throw new Error("User data not found");
    }
    const ShopId = await GetShopIdByShopUniqueName(ShopUniqName);

    if (!ShopId) {
      throw new Error("ShopId not found");
    }

    const Roles = await RolePerimision.find({ ShopId }).lean();

    // تبدیل فیلدهای خاص به plain strings
    const plainRoles = Roles.map(role => ({
      ...role,
      _id: role._id.toString(),
      ShopId: role.ShopId.toString(),  // تبدیل ShopId به رشته
      CreatedBy: role.CreatedBy.toString(),
      LastEditedBy: role.LastEditedBy.toString(),
      createdAt: role.createdAt.toISOString(),
      updatedAt: role.updatedAt.toISOString()
    }));

    return { Roles: plainRoles, status: 200 };
  } catch (error) {
    console.error("خطا در دریافت نقش‌ها:", error);
    return { error: error.message, status: 500 };
  }
}




export async function CheckRolePermissionsServerAction({ roles, action, access }) {
  try {
    await connectDB();
    
    const userData = await authenticateUser();
    if (!userData) {
      throw new Error("User data not found");
    }

    console.log("Role IDs received:", roles);
    console.log("Action to check:", action);
    console.log("Access to check:", access);

    for (const roleId of roles) {
      const roleData = await RolePerimision.findOne({ _id: roleId }).lean();
      if (roleData) {
        if (access in roleData && roleData[access].includes(action)) {
          // دسترسی داینامیک
          console.log(`Role ${roleId} has the required permission.`);
          return { message: "Permission granted", status: 200, data: true };
        }
      }
    }

    console.log("No roles have the required permissions.");
    
    return { message: "Permission denied", status: 200, data: false };
  } catch (error) {
    console.error("Error in CheckRolePermissions action:", error.message);
    return { error: error.message, status: 500 };
  }
}



export async function GetShopIdByShopUniqueName(ShopUniqueName) {
  try {
    await connectDB();
    const shop = await shops.findOne({ ShopUniqueName }).lean();

    if (!shop) {
      throw new Error("شاپ با این نام پیدا نشد");
    }

    return shop._id.toString(); // آی‌دی شاپ را برگردان
  } catch (error) {
    console.error(`خطا در بازیابی آی‌دی شاپ: ${error.message}`);
    throw new Error("مشکلی در بازیابی آی‌دی شاپ وجود دارد");
  }
}

export const getUsersByRoleId = async (roleId) => {
  try {
    await connectDB();
    const rolesInShop = await RoleInShop.find({ RoleId: roleId }).populate("UserId", "username");

    const userNames = rolesInShop.map((roleInShop) => roleInShop.UserId.name);

    return userNames;
  } catch (error) {
    console.error("Error fetching user names by RoleId:", error);
    throw new Error("Error fetching user names by RoleId");
  }
};

export async function GetUserRolsAtShop({ userId, shopId }) {
  try {
    await connectDB();
    
    // اعتبارسنجی کاربر
    const userData = await authenticateUser();
    if (!userData) {
      throw new Error("User data not found");
    }

    // یافتن نقش‌های کاربر در فروشگاه خاص
    const rolesInShop = await RoleInShop.find({ UserId: userId, ShopId: shopId }).populate('RoleId');
    
    // استخراج آی‌دی‌های نقش‌ها و ایجاد یک آرایه
    const roleIds = rolesInShop.map(item => item.RoleId._id.toString());

    return { message: "Roles retrieved successfully", status: 200, data: roleIds };
  } catch (error) {
    console.error("Error in GetUserRolesAtShop action:", error.message);
    return { error: error.message, status: 500 };
  }
}




export {
  AddRoleServerAction,
  EditRole,
  DeleteRole,
  EnableRole,
  DisableRole,
  GetShopRolesByShopUniqName,
 
  CheckRolePermissionsServerAction,
  GetUserRolsAtShop,
  GetShopIdByShopUniqueName,
  getUsersByRoleId,
};
