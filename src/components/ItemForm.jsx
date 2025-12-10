import React from "react";
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";

const ITEM_FIELDS = ["description", "length", "width", "height", "weight"];

const ItemForm = ({ item, index, onItemChange, onDeleteItem }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="rounded-lg pr-2 bg-gray-50 p-4 border border-gray-200"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-700">ITEM {index + 1}</h3>
        <button
          onClick={() => onDeleteItem(item.id)}
          className="text-red-500 hover:text-red-700 transition-colors p-1 rounded hover:bg-red-50"
          title="Delete Item"
          aria-label={`Delete item ${index + 1}`}
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
      <div className="grid grid-cols-5 gap-4">
        {ITEM_FIELDS.map((field) => (
          <div key={field} className="relative">
            <input
              type={field === "description" ? "text" : "number"}
              name={field}
              value={item[field]}
              onChange={(e) => onItemChange(item.id, e)}
              className="border-b-2 border-gray-300 p-2 w-full outline-none focus:border-blue-400 peer transition bg-transparent"
              placeholder=" "
              aria-label={field}
            />
            <label className="absolute left-0 peer-focus:-top-4 peer-focus:text-xs peer-focus:text-gray-500 peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 -top-4 text-xs text-gray-500 transition-all duration-200 pointer-events-none">
              {field.charAt(0).toUpperCase() + field.slice(1)}
            </label>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default ItemForm;

