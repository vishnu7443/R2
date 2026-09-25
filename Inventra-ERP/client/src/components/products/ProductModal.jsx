const ProductModal = ({
  isOpen,
  onClose,
  title,
  children
}) => {


  if (!isOpen) return null;


  return (

    <div
      className="
      fixed
      inset-0
      bg-black
      bg-opacity-40
      flex
      items-center
      justify-center
      z-50
      "
    >


      <div
        className="
        bg-white
        rounded-xl
        shadow-xl
        w-full
        max-w-lg
        p-6
        "
      >


        {/* Header */}

        <div
          className="
          flex
          justify-between
          items-center
          mb-5
          "
        >


          <h2
            className="
            text-xl
            font-semibold
            "
          >

            {title}

          </h2>



          <button

            onClick={onClose}

            className="
            text-gray-500
            hover:text-black
            text-xl
            "

          >

            ✕

          </button>


        </div>



        {/* Body */}

        <div>

          {children}

        </div>



      </div>


    </div>

  );

};


export default ProductModal;