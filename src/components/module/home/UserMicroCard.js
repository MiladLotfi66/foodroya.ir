import Image from "next/image";
import usericone from "@/public/Images/jpg/user.webp";

function UserMicroCard({ user }) {
  return (
    <span className="flex items-center gap-2">
      <Image
        className="rounded-full"
        src={usericone}
        // src={user.image || "/default-user.png"}
        alt="تصویر کاربر"
        width={30}
        height={30}
        quality={60}

      />
      <div className="hidden xl:inline-block">{user?.username}</div>
    </span>
  );
}

export default UserMicroCard;

