import * as yup from "yup";

// *******************validate********************
const RoleSchema = yup.object().shape({
    
    RoleStatus: yup.boolean().required("وضعیت نقش الزامی است"),
    
    RoleTitle: yup.string()
    .min(2, "عنوان نقش باید حداقل دو حرف باشد")
    .max(70, "عنوان نقش باید حد اکثر ۷۰ حرف باشد")
    .required("عنوان نقش الزامی است"),

    shopUniqName: yup
    .string()
    .nullable()
    .min(5, "نام منحصر به فرد فروشگاه باید حداقل 5 کاراکتر باشد")
    .max(30, "نام منحصر به فرد فروشگاه نمی‌تواند بیشتر از 30 کاراکتر باشد")
    .matches(/^\w+$/, "نام منحصر به فرد فروشگاه باید فقط شامل حروف، اعداد و زیرخط باشد"),
  

    bannersPermissions: yup
        .array()
        .of(
            yup.string().oneOf(["add", "edit", "delete", "view"], "مقدار باید یکی از 'add', 'edit', 'delete', 'view' باشد")
        )
        .max(4, "تعداد مقادیر نمی‌تواند بیشتر از 4 باشد")
        .default([]),

    rolesPermissions: yup
        .array()
        .of(
            yup.string().oneOf(["add", "edit", "delete", "view"], "مقدار باید یکی از 'add', 'edit', 'delete', 'view' باشد")
        )
        .max(4, "تعداد مقادیر نمی‌تواند بیشتر از 4 باشد")
        .default([]),

        sendMethodPermissions: yup
        .array()
        .of(
            yup.string().oneOf(["add", "edit", "delete", "view"], "مقدار باید یکی از 'add', 'edit', 'delete', 'view' باشد")
        )
        .max(4, "تعداد مقادیر نمی‌تواند بیشتر از 4 باشد")
        .default([]),

        accountsPermissions: yup
        .array()
        .of(
            yup.string().oneOf(["add", "edit", "delete", "view"], "مقدار باید یکی از 'add', 'edit', 'delete', 'view' باشد")
        )
        .max(4, "تعداد مقادیر نمی‌تواند بیشتر از 4 باشد")
        .default([]),
        
        contactsPermissions: yup
        .array()
        .of(
            yup.string().oneOf(["add", "edit", "delete", "view"], "مقدار باید یکی از 'add', 'edit', 'delete', 'view' باشد")
        )
        .max(4, "تعداد مقادیر نمی‌تواند بیشتر از 4 باشد")
        .default([]), 
        priceTemplatesPermissions: yup

        .array()
        .of(
            yup.string().oneOf(["add", "edit", "delete", "view"], "مقدار باید یکی از 'add', 'edit', 'delete', 'view' باشد")
        )
        .max(4, "تعداد مقادیر نمی‌تواند بیشتر از 4 باشد")
        .default([]),

        productsPermissions: yup
        .array()
        .of(
            yup.string().oneOf(["add", "edit", "delete", "view"], "مقدار باید یکی از 'add', 'edit', 'delete', 'view' باشد")
        )
        .max(4, "تعداد مقادیر نمی‌تواند بیشتر از 4 باشد")
        .default([]), 
        
        financialDocumentsPermissions: yup
        .array()
        .of(
            yup.string().oneOf(["add", "edit", "delete", "view"], "مقدار باید یکی از 'add', 'edit', 'delete', 'view' باشد")
        )
        .max(4, "تعداد مقادیر نمی‌تواند بیشتر از 4 باشد")
        .default([]),

        sendMethodsPermissions: yup
        .array()
        .of(
            yup.string().oneOf(["add", "edit", "delete", "view"], "مقدار باید یکی از 'add', 'edit', 'delete', 'view' باشد")
        )
        .max(4, "تعداد مقادیر نمی‌تواند بیشتر از 4 باشد")
        .default([]),

        purchaseInvoicesPermissions: yup
        .array()
        .of(
            yup.string().oneOf(["add", "edit", "delete", "view"], "مقدار باید یکی از 'add', 'edit', 'delete', 'view' باشد")
        )
        .max(4, "تعداد مقادیر نمی‌تواند بیشتر از 4 باشد")
        .default([]), 
        
        saleInvoicesPermissions: yup
        .array()
        .of(
            yup.string().oneOf(["add", "edit", "delete", "view"], "مقدار باید یکی از 'add', 'edit', 'delete', 'view' باشد")
        )
        .max(4, "تعداد مقادیر نمی‌تواند بیشتر از 4 باشد")
        .default([]), 
        
        purchaseReturnInvoicesPermissions: yup
        .array()
        .of(
            yup.string().oneOf(["add", "edit", "delete", "view"], "مقدار باید یکی از 'add', 'edit', 'delete', 'view' باشد")
        )
        .max(4, "تعداد مقادیر نمی‌تواند بیشتر از 4 باشد")
        .default([]), 
        
        saleReturnInvoicesPermissions: yup
        .array()
        .of(
            yup.string().oneOf(["add", "edit", "delete", "view"], "مقدار باید یکی از 'add', 'edit', 'delete', 'view' باشد")
        )
        .max(4, "تعداد مقادیر نمی‌تواند بیشتر از 4 باشد")
        .default([]),

 allInvoicesPermissions: yup
        .array()
        .of(
            yup.string().oneOf(["add", "edit", "delete", "view"], "مقدار باید یکی از 'add', 'edit', 'delete', 'view' باشد")
        )
        .max(4, "تعداد مقادیر نمی‌تواند بیشتر از 4 باشد")
        .default([]), 
        
        wasteInvoicesPermissions: yup
        .array()
        .of(
            yup.string().oneOf(["add", "edit", "delete", "view"], "مقدار باید یکی از 'add', 'edit', 'delete', 'view' باشد")
        )
        .max(4, "تعداد مقادیر نمی‌تواند بیشتر از 4 باشد")
        .default([]),

});

export default RoleSchema;

