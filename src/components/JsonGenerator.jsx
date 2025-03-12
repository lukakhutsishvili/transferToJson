import React, { useState } from "react";

const JsonGenerator = () => {
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({
    description: "",
    length: "",
    width: "",
    height: "",
    weight: "",
  });
  const [copySuccess, setCopySuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddItem = () => {
    if (!formData.length || !formData.width || !formData.height || !formData.weight) {
      alert("Please fill in all required fields (length, width, height, weight)");
      return;
    }
    const newItem = {
      description: formData.description ,
      length: Number(formData.length),
      width: Number(formData.width),
      height: Number(formData.height),
      weight: Number(formData.weight),
    };
    setItems([...items, newItem]);
    setFormData({ description: "", length: "", width: "", height: "", weight: "" });
  };

  const handleDeleteLastItem = () => {
    if (items.length === 0) return;
    setItems(items.slice(0, -1));
  };

  const handleDeleteAllItems = () => {
    setItems([]);
  };

  const handleLogItems = () => {
    console.log(`Total items: ${items.length}`);
    items.forEach((item, index) => {
      console.log(`Item ${index + 1}: Weight = ${item.weight}kg, Height = ${item.height}cm`);
    });
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(items, null, 2))
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 1000);
      })
      .catch((err) => console.error("Failed to copy:", err));
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white shadow-xl rounded-2xl p-6">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Enter Item Details</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-gray-700 font-semibold">Total Items: {items.length}</p>
            <div className="grid grid-cols-1 gap-4">
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Description (optional)"
                className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="number"
                name="length"
                value={formData.length}
                onChange={handleChange}
                placeholder="Length (cm)"
                className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="number"
                name="width"
                value={formData.width}
                onChange={handleChange}
                placeholder="Width (cm)"
                className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="number"
                name="height"
                value={formData.height}
                onChange={handleChange}
                placeholder="Height (cm)"
                className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                placeholder="Weight (kg)"
                className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div className="mt-6 text-center space-x-4">
              <button
                onClick={handleAddItem}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-700 transition"
              >
                + Add Item
              </button>
              <button
                onClick={handleDeleteLastItem}
                className="bg-red-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-red-600 transition"
              >
                - Delete Last Item
              </button>
              <button
                onClick={handleDeleteAllItems}
                className="bg-gray-600 mt-2 text-white px-6 py-3 rounded-lg shadow-md hover:bg-gray-700 transition"
              >
                🗑 Delete All
              </button>
              <button
                onClick={handleLogItems}
                className="bg-green-500 mt-2 text-white px-6 py-3 rounded-lg shadow-md hover:bg-green-600 transition"
              >
                📋 Log Items
              </button>
            </div>
          </div>

          {items.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg shadow-inner max-h-[400px] overflow-auto border border-gray-300 relative">
              <h2 className="text-xl font-semibold mb-2 text-gray-700">Generated JSON</h2>
              
              <pre className="bg-gray-200 p-6 rounded-lg text-base border border-gray-300 overflow-auto">
                {JSON.stringify(items, null, 2)}
              </pre>

              {/* Copy Button */}
              <button
                onClick={handleCopyJson}
                className="absolute top-3 right-3 bg-blue-500 text-white px-3 py-2 rounded-lg shadow-md hover:bg-blue-600 transition text-sm"
              >
                📋 Copy JSON
              </button>

              {/* Copy success message */}
              {copySuccess && (
                <div className="absolute top-14 right-3 bg-green-500 text-white px-3 py-1 rounded-md text-sm">
                  ✅ Copied!
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JsonGenerator;
