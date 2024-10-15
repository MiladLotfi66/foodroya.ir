import Image from "next/image";
import usericone from "@/public/Images/jpg/user.webp";

function RoleNameAndImageCart({ user }) {
  console.log(user);
  
  return (
    <span className="flex items-center gap-2">
      <Image
        className="rounded-full"
        src={user.userImage}
        // src={user.image || "/default-user.png"}
        alt="تصویر کاربر"
        width={30}
        height={30}
        quality={60}

      />
      <p className="truncate max-w-52" >{user?.name}</p>
    </span>
  );
}

export default RoleNameAndImageCart;

