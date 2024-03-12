import Image from "next/image";
import usericone from "@/public/Images/jpg/user.jpg";

function UserMicroCard({ data }) {
  console.log("data",data)
  return (
    <span className="flex items-center gap-2">
      <Image
        className="rounded-full"
        src={usericone}
        alt="userName"
        width={40}
        height={40}
      ></Image>
      <div className="hidden xl:inline-block">{data?.user?.name}</div>
    </span>
  );
}

export default UserMicroCard;
