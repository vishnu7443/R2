const StockBadge = ({ stock }) => {

  let status = "";
  let styles = "";


  // Out of stock
  if (stock === 0) {

    status = "Out of Stock";

    styles =
      "bg-red-100 text-red-700";

  }


  // Low stock
  else if (stock <= 10) {

    status = "Low Stock";

    styles =
      "bg-yellow-100 text-yellow-700";

  }


  // Available
  else {

    status = "Available";

    styles =
      "bg-green-100 text-green-700";

  }


  return (

    <span
      className={`
        px-3 
        py-1 
        rounded-full 
        text-sm 
        font-medium
        ${styles}
      `}
    >

      {status}

    </span>

  );

};


export default StockBadge;