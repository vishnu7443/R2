import StockBadge from "./StockBadge";

const ProductTable = ({
  products,
  onEdit,
  onDelete,
  isAdmin
}) => {


  return (

    <div className="bg-white rounded-xl shadow overflow-x-auto">


      <table className="w-full text-left">


        <thead className="bg-gray-100">


          <tr>

            <th className="p-4">
              Product
            </th>


            <th className="p-4">
              SKU
            </th>


            <th className="p-4">
              Category
            </th>


            <th className="p-4">
              Supplier
            </th>


            <th className="p-4">
              Price
            </th>


            <th className="p-4">
              Stock
            </th>


            <th className="p-4">
              Status
            </th>


            {isAdmin && (
              <th className="p-4">
                Actions
              </th>
            )}
          </tr>


        </thead>



        <tbody>


          {
            products.length === 0 ? (

              <tr>

                <td
                  colSpan="8"
                  className="text-center p-6 text-gray-500"
                >

                  No Products Found

                </td>

              </tr>


            ) : (


              products.map((product)=>(


                <tr
                  key={product.id}
                  className="border-b hover:bg-gray-50"
                >


                  <td className="p-4 font-medium">

                    {product.name}

                  </td>



                  <td className="p-4">

                    {product.sku}

                  </td>



                  <td className="p-4">

                    {
                      product.category?.name ||
                      "N/A"
                    }

                  </td>



                  <td className="p-4">

                    {
                      product.supplier?.name ||
                      "N/A"
                    }

                  </td>



                  <td className="p-4">

                    ₹
                    {
                      product.price?.toLocaleString()
                    }

                  </td>



                  <td className="p-4">

                    {product.stock}

                  </td>



                  <td className="p-4">

                    <StockBadge
                      stock={product.stock}
                    />

                  </td>



                  {isAdmin && (
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => onEdit(product)}
                          className="px-3 py-1 rounded bg-blue-500 text-white text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onDelete(product.id)}
                          className="px-3 py-1 rounded bg-red-500 text-white text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  )}
                </tr>


              ))

            )
          }


        </tbody>


      </table>


    </div>


  );

};


export default ProductTable;