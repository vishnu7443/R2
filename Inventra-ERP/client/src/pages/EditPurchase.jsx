import { useParams, useNavigate } from "react-router-dom";

function EditPurchase() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div>
      <h1>Edit Purchase</h1>
      <p>Purchase ID: {id}</p>

      <button onClick={() => navigate("/purchase")}>
        Back
      </button>
    </div>
  );
}

export default EditPurchase;