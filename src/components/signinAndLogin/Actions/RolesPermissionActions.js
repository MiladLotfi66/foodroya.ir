"use server";
import RolePerimision from "@/models/RolePerimision";
import connectDB from "@/utils/connectToDB";
import { cookies } from "next/headers";
import RoleSchema from "@/utils/yupSchemas/RoleSchema";
import AuthenticateUser from "@/utils/authenticateUserInActions";
import RoleInShop from "@/models/RoleInShop";
import Shop from "@/models/shops";
import User from "@/models/Users";


export async function AddRoleToUser(UserId, shopUniqName, RoleId) {
  try {
    // اتصال به دیتابیس
    console.log("UserId, shopUniqName, RoleId",UserId, shopUniqName, RoleId);
    await connectDB();
    // دریافت آی‌دی شاپ
    if (!shopUniqName) {
      throw new Error("shopUniqName is required in RoleData");
    }

    const shopResponse = await GetShopIdByShopUniqueName(shopUniqName);
    if (shopResponse.status !== 200 || !shopResponse.ShopID) {
      throw new Error(shopResponse.error || "shopId is required in RoleData");
    }

    const ShopId = shopResponse.ShopID;
 
 
 
 
    if (!ShopId) {
      throw new Error("shopId is required in RoleData");
    }

    const userData = await authenticateUser();

    if (!userData) {
      throw new Error("User data not found");
    }
    // ایجاد رکورد جدید
    const newRoleInShop = new RoleInShop({
      UserId,
      ShopId,
      RoleId,
      CreatedBy: userData.id,
      LastEditedBy: userData.id, // فرض بر این است که خالق همان شخص آخرین ویرایشگر است
    });

    // ذخیره رکورد در دیتابیس
    await newRoleInShop.save();

    console.log('رکورد جدید با موفقیت ذخیره شد.');
    return { success: true, message: 'رکورد جدید با موفقیت ذخیره شد.' };
  } catch (error) {
    console.error('خطا در ذخیره رکورد:', error);
    return { success: false, message: 'خطا در ذخیره رکورد', error };
  }
}

export async function  RemoveUserFromRole (UserId, shopUniqName, RoleId) {
  
  try {
    // اتصال به دیتابیس
    console.log("UserId, shopUniqName, RoleId",UserId, shopUniqName, RoleId);
    await connectDB();
    // دریافت آی‌دی شاپ
    if (!shopUniqName) {
      throw new Error("shopUniqName is required in RoleData");
    }
   const shopResponse = await GetShopIdByShopUniqueName(shopUniqName);
    if (shopResponse.status !== 200 || !shopResponse.ShopID) {
      throw new Error(shopResponse.error || "shopId is required in RoleData");
    }

    const ShopId = shopResponse.ShopID;    if (!ShopId) {
      throw new Error("shopId is required in RoleData");
    }

    const userData = await authenticateUser();

    if (!userData) {
      throw new Error("User data not found");
    }
    // پیدا کردن و حذف رکورد
    const result = await RoleInShop.findOneAndDelete({
      UserId,
      ShopId,
      RoleId
    });

    if (!result) {
      throw new Error('Record not found');
    }

    console.log('رکورد با موفقیت حذف شد.');
    return { success: true, message: 'رکورد با موفقیت حذف شد.' };
  } catch (error) {
    console.error('خطا در حذف رکورد:', error);
    return { success: false, message: 'خطا در حذف رکورد', error };
  }
}

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

    const shopResponse = await GetShopIdByShopUniqueName(shopUniqName);
    if (shopResponse.status !== 200 || !shopResponse.ShopID) {
      throw new Error(shopResponse.error || "shopId is required in RoleData");
    }

    const ShopId = shopResponse.ShopID;
    if (!ShopId) {
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
      ShopId: ShopId, // ذخیره آی‌دی شاپ در دیتابیس
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
export async function EditRole(RoleData , roleId) {
  console.log(roleId);
  
  try {
    await connectDB();
    const userData = await authenticateUser();

    if (!userData) {
      throw new Error("User data not found");
    }

   
    if (!roleId) {
      throw new Error("آی‌دی نقش ارسال نشده است");
    }
    const Role = await RolePerimision.findById(roleId);

    if (!Role) {
      throw new Error("نقشی با این آی‌دی یافت نشد");
    }

    if (!await hasUserAccess(Role.CreatedBy)) {
      throw new Error("شما دسترسی لازم برای این عملیات را ندارید");
    }

    const validatedData = await RoleSchema.validate(
      {
        RoleTitle: RoleData.RoleTitle ,
        RoleStatus: RoleData.RoleStatus,
        bannersPermissions: RoleData.bannersPermissions,
        rolesPermissions: RoleData.rolesPermissions,
      },
      { abortEarly: false }
    );

    const updatedRole = {
      ...validatedData,
      LastEditedBy: userData.id,
    };

    await RolePerimision.findByIdAndUpdate(roleId, updatedRole, { new: true });
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

export async function GetAllFollowedUsers(ShopId){
  try {
  await connectDB()

  const shop = await Shop.findOne({ _id : ShopId }).populate({path: 'followers', select: 'username'}).lean();
  
  const followers = shop.followers?.map(follower => ({
    ...follower,
    _id: follower._id.toString(), // تبدیل ObjectId به رشته
  }));


  return { "status": 200, "data": followers }; // فقط لیست کاربران را برگردانید



} catch (error) {
  console.error("خطا در دریافت فالور ها:", error);
  return { error: error.message, status: 500 };
}
}

export async function GetAllFollowedUsersWithRoles(ShopId, roleId) {
  try {
    await connectDB();

    // دریافت فالورهای فروشگاه
    const shop = await Shop.findOne({ _id: ShopId })
      .populate({ path: 'followers', select: 'username' })
      .lean();

    const followersWithRoles = await Promise.all(
      shop.followers?.map(async (follower) => {
        // بررسی اینکه آیا این فالور برای این فروشگاه نقش خاصی دارد یا خیر
        const roleInShop = await RoleInShop.findOne({
          UserId: follower._id,
          ShopId: ShopId,
          RoleId: roleId,
        });

        return {
          ...follower,
          _id: follower._id.toString(),
          hasRole: !!roleInShop, // اگر نقش وجود داشت، مقدار true برمی‌گرداند
        };
      })
    );

    return { status: 200, data: followersWithRoles };
  } catch (error) {
    console.error("خطا در دریافت فالورها و بررسی نقش:", error);
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
    const shopResponse = await GetShopIdByShopUniqueName(ShopUniqName);
    if (shopResponse.status !== 200 || !shopResponse.ShopID) {
      throw new Error(shopResponse.error || "shopId is required in RoleData");
    }

    const ShopId = shopResponse.ShopID;
    if (!ShopId) {
      throw new Error("ShopId not found");
    }

    const Roles = await RolePerimision.find({ ShopId }).lean();

    // تبدیل فیلدهای خاص به plain strings
    const plainRoles = Roles?.map(role => ({
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
    const shop = await Shop.findOne({ ShopUniqueName }).lean();

    if (!shop) {
      throw new Error("شاپ با این نام پیدا نشد");
    }

    return { status: 200, ShopID: shop._id.toString() }; // آی‌دی شاپ و وضعیت را برگردان
  } catch (error) {
    console.error(`خطا در بازیابی آی‌دی شاپ: ${error.message}`);
    throw new Error("مشکلی در بازیابی آی‌دی شاپ وجود دارد");
  }
}

export async function  getUsersByRoleId (roleId) {
  try {
    await connectDB();
    // const rolesInShop = await RoleInShop.find({ RoleId: roleId }).populate('UserId');
    const rolesInShop = await RoleInShop.find({ RoleId: roleId }) .populate({
      path: 'UserId',
      select: '_id username'
    });

    const users = rolesInShop?.map(roleInShop => {
      const user = roleInShop.UserId;
      return user ? { _id: user._id, username: user.username } : null;
    }).filter(user => user !== null); // حذف موارد null

    // بررسی داده‌های برگردانده شده
    console.log("users:", users);

    return users;
  } catch (error) {
    console.error("Error fetching user names by RoleId:", error.message);
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
    const roleIds = rolesInShop?.map(item => item.RoleId._id.toString());

    return { message: "Roles retrieved successfully", status: 200, data: roleIds };
  } catch (error) {
    console.error("Error in GetUserRolesAtShop action:", error.message);
    return { error: error.message, status: 500 };
  }
}

