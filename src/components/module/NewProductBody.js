import ProductCard from "./ProductCard"

function NewProductBody() {
  return (
    <div className="container grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 grid-rows-2 gap-3.5 md:gap-5 pb-5">
     <ProductCard/>
     <ProductCard/>
     <ProductCard/>
     <ProductCard/>
     <ProductCard/>
     <ProductCard/>
     <ProductCard/>
     <ProductCard/>
    </div>
  )
}

export default NewProductBody
