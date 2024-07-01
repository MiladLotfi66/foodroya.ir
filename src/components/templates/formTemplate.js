
function FormTemplate({children}) {
  return (
    <div className="absolute w-full h-full overflow-auto">
      <div
        className="fixed inset-0 bg-no-repeat bg-cover bg-center"
        style={{ backgroundImage: "url('/Images/jpg/chefSign.webp')" }}
      ></div>
      <div className="relative container">
      
        {children}
      </div>
    </div>
  );
}

export default FormTemplate;
