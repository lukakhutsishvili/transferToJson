import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const DropdownCard = ({ title, imageSrc, alt, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left px-6 py-4 hover:bg-gray-50 transition-colors"
        aria-expanded={isOpen}
        aria-label={`Toggle ${title}`}
      >
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className="w-6 h-6 text-gray-500" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4 }}
            className="px-6 pb-6"
          >
            {imageSrc && (
              <img
                src={imageSrc}
                alt={alt || title}
                className="w-full rounded-lg object-cover mt-2 shadow-sm"
                loading="lazy"
              />
            )}
            {children && (
              <p className="mt-4 text-gray-600 text-base leading-relaxed">
                {children}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DropdownCard;

