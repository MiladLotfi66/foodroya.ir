import RolsManage from "@/templates/panel/rols/RolsManage"

function page({ params }) {
  return (
    <div>
      <RolsManage params={params}/>
    </div>
  )
}

export default page

