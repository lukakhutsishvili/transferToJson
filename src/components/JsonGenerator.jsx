import React, { useState } from "react";

const JsonGenerator = () => {
  const [items, setItems] = useState([]);
  const [totalParcel, setTotalParcel] = useState("");

  const handleTotalParcelChange = (e) => {
    const value = e.target.value;
    setTotalParcel(value === "" ? "" : Number(value));
  };

  const handleGenerateItems = () => {
    const count = Number(totalParcel);
    if (!count || count <= 0) return;

    const generatedItems = Array.from({ length: count }, (_, index) => ({
      description: (index + 1).toString(),
      length: "1",
      width: "1",
      height: "1",
      weight: "1",
    }));

    setItems(generatedItems);
  };

  const handleItemChange = (index, e) => {
    const newItems = [...items];
    newItems[index][e.target.name] = e.target.value;
    setItems(newItems);
  };

  const handleDeleteAllItems = () => {
    setItems([]);
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      { description: "", length: "", width: "", height: "", weight: "" },
    ]);
  };

  const handleDeleteLastItem = () => {
    setItems(items.slice(0, -1));
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center  px-4 ">
      <div className="w-full   bg-white shadow-xl rounded-2xl px-6 ">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Enter Item Details
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className=" flex gap-2">
              <button
                onClick={handleGenerateItems}
                className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-green-700 transition"
              >
                Generate
              </button>
              <div className="relative">
                <input
                  type="number"
                  value={totalParcel}
                  onChange={handleTotalParcelChange}
                  placeholder=" "
                  className="border-b-2 border-gray-300 p-3 w-full outline-none focus:border-blue-400 peer transition"
                  min="1"
                />
                <label
                  className="absolute left-0 
               peer-focus:-top-4 peer-focus:text-xs peer-focus:text-gray-500
               peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400
               -top-4 text-xs text-gray-500 transition-all duration-200 pointer-events-none"
                >
                  Number of Parcels
                </label>
              </div>
            </div>

            <div className="mt-4 z-50 space-y-6 max-h-96 pb-3 overflow-auto">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="mt-4 grid grid-cols-5 gap-4 relative"
                >
                  {["description", "length", "width", "height", "weight"].map(
                    (field) => (
                      <div className="relative">
                        <input
                          type={field === "description" ? "text" : "number"}
                          name={field}
                          value={item[field]}
                          onChange={(e) => handleItemChange(index, e)}
                          placeholder=" "
                          className="border-b-2 border-gray-300 p-2 w-full outline-none focus:border-blue-400 peer transition"
                        />
                        <label
                          className="absolute left-0 
                                peer-focus:-top-4 peer-focus:text-xs peer-focus:text-gray-500 
                                peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 
                                -top-4 text-xs text-gray-500 transition-all duration-200 pointer-events-none"
                        >
                          {field.charAt(0).toUpperCase() + field.slice(1)}
                        </label>
                      </div>
                    )
                  )}
                </div>
              ))}
            </div>
          </div>

          {items.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg shadow-inner max-h-96 overflow-auto border border-gray-300">
              <h2 className="text-xl font-semibold mb-2 text-gray-700">
                Generated JSON
              </h2>
              <pre className="bg-gray-200 p-6 rounded-lg text-base border border-gray-300 overflow-auto">
                {JSON.stringify(items, null, 2)}
              </pre>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleAddItem}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-700 transition"
          >
            + Add One
          </button>
          <button
            onClick={handleDeleteLastItem}
            className="bg-red-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-red-600 transition"
          >
            - Delete Last
          </button>
          <button
            onClick={handleDeleteAllItems}
            className="bg-gray-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-gray-700 transition"
          >
            🗑 Delete All
          </button>
        </div>
      </div>
    </div>
  );
};

export default JsonGenerator;
