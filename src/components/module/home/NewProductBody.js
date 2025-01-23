import ProductCard from "./ProductCard"

function NewProductBody({ products }) {
  // فیلتر کردن محصولات نامعتبر
  const validProducts = products.filter(product => product && product._id);

  if (validProducts.length === 0) {
    return <div>هیچ محصولی برای نمایش وجود ندارد.</div>;
  }

  return (
    <div className="container grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 grid-rows-2 gap-3.5 md:gap-5 pb-5">
      {validProducts.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  )
}

export default NewProductBody
