import UserMicroCard from "../home/UserMicroCard";

function UsersListModal({ Users }) {
    console.log("UsersListModal");
  return (
    <div className='w-40 h-40 bg-red-200'>
      {Users?.map((user) => (
        <UserMicroCard key={user.id} user={user.name} />
      ))}
    </div>
  );
}

export default UsersListModal;