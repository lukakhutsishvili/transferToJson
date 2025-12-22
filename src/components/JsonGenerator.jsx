import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ExcelToJson from "./ExcelReader";
import { ChevronDown } from "lucide-react"; // Make sure lucide-react is installed
import ChangeExcelFormat from "./changeExcelFormat";

const MAX_PARCELS = 10;
const DEFAULT_ITEM_DIMENSIONS = {
  length: "1",
  width: "1",
  height: "1",
  weight: "1",
};
const ITEM_FIELDS = ["description", "length", "width", "height", "weight"];

function stripId(item) {
  // Remove internal UI-only id from output (clipboard + preview).
  const { id, ...rest } = item;
  void id;
  return rest;
}

function createDefaultItem(description) {
  return {
    id: crypto.randomUUID(),
    description,
    ...DEFAULT_ITEM_DIMENSIONS,
  };
}

// dropdown component
const DropdownCard = ({ title, imageSrc, alt, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden transition-all duration-300">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left px-6 py-4 hover:bg-gray-100 transition-colors"
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
            <img
              src={imageSrc}
              alt={alt}
              className="w-full rounded-lg object-cover mt-2"
            />
            <p className="mt-4 text-gray-600 text-base leading-relaxed">
              {children}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

//json generator(whole page)
const JsonGenerator = () => {
  // Eslint can mis-detect JSX member expressions like <motion.div /> as "unused".
  // This is a no-op runtime usage to keep lint clean without changing behavior.
  void motion;

  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [totalParcel, setTotalParcel] = useState("");
  const [shouldScroll, setShouldScroll] = useState(false);
  const scrollRef = useRef(null);

  const handleTotalParcelChange = (e) => {
    let value = Number(e.target.value);
    if (value > MAX_PARCELS) value = MAX_PARCELS;
    setTotalParcel(value ? value : "");
  };

  const handleGenerateItems = useCallback(() => {
    let count = Number(totalParcel);
    if (!count || count <= 0) return;

    count = Math.min(count, MAX_PARCELS);
    const generatedItems = Array.from({ length: count }, (_, index) =>
      createDefaultItem((index + 1).toString())
    );
    setItems(generatedItems);
    setShouldScroll(false);
  }, [totalParcel]);

  const handleItemChange = useCallback((id, e) => {
    const { name, value } = e.target;
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, [name]: value } : item
      )
    );
  }, []);

  const handleDeleteItem = useCallback((id) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  }, []);

  const handleDeleteAllItems = () => setItems([]);

  const handleAddItem = () => {
    setItems((prevItems) => {
      if (prevItems.length >= MAX_PARCELS) return prevItems;
      return [...prevItems, createDefaultItem(prevItems.length + 1)];
    });
    setShouldScroll(true);
  };

  const handleCopyJson = async () => {
    try {
      const jsonWithoutId = items.map(stripId);
      await navigator.clipboard.writeText(
        JSON.stringify(jsonWithoutId, null, 2)
      );
      alert("Copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy:", error);
      alert("Failed to copy. Please try again.");
    }
  };

  useEffect(() => {
    if (shouldScroll && scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
      setShouldScroll(false);
    }
  }, [items, shouldScroll]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
            Transfer to JSON
          </h1>
          <p className="text-gray-600">
            Tools for formatting your Excel template and generating places JSON.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChangeExcelFormat />
          <ExcelToJson />
        </div>

        <section className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <DropdownCard
              title="კლიენტის მონაცემები"
              imageSrc="image.png"
              alt="კლიენტის მონაცემები"
            >
              თუ აგზავნით სერვისცენტრიდან ამანათს მაშინ აუცილებელია შეავსოთ
              "sending from serviscenter"(აირჩიოთ სასურველი დელივოს სერვისცენტრი,
              სადაც შეძლებთ ამანათის მიტანას) თუ არის საკურიერო აუცილებელია
              შეავსოთ ქალაქი და გამოტანის მისამართი
            </DropdownCard>
            <DropdownCard
              title="მიმღების მონაცემები"
              imageSrc="photo_2025-03-25_13-54-50.jpg"
              alt="მიმღების მონაცემები"
            />
            <DropdownCard
              title="ამანთის მონაცემები"
              imageSrc="photo_2025-03-25_17-19-47.jpg"
              alt="ამანთის მონაცემები"
            >
              თუ ამანათი არის ადგილებიანი შეგიძლიათ დააჭიროთ ღილაკს "show panel",
              დააგენერიროთ სპეციალური ფორმატი და ჩაწეროთ places ველში თუ უკვე
              გაქვთ places ველში ჩაწეროთ ციფრი თუ რამდენი ადგილიანი ამანათისგან
              შედგება, ექსელის ფაილი ატვირთოთ საიტზე "choose file" და შემდეგ
              "export"(თავისით დააგენერირებს საიტი ადგილებიან ამანათს)
            </DropdownCard>
          </div>
        </section>

        <section className="space-y-3">
          <button
            onClick={() => setIsOpen((prev) => !prev)}
            className="inline-flex items-center justify-center bg-blue-600 text-white px-5 py-3 rounded-2xl shadow-sm hover:bg-blue-700 transition focus:outline-none"
          >
            {isOpen ? "Hide Panel" : "Show Panel"}
          </button>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
                className="w-full"
              >
                <div className="w-full min-h-[580px] flex flex-col bg-white shadow-xl rounded-2xl border border-gray-100 px-6 py-8">
                  <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-6">
                    Enter Item Details
                  </h2>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                      <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
                        <button
                          onClick={handleGenerateItems}
                          className="bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-sm hover:bg-emerald-700 transition"
                        >
                          Generate
                        </button>
                        <div className="relative flex-grow">
                          <input
                            type="number"
                            value={totalParcel}
                            onChange={handleTotalParcelChange}
                            className="rounded-xl border border-gray-200 bg-white px-4 py-3 w-full outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
                            min="1"
                            placeholder="Number of Parcels"
                          />
                        </div>
                      </div>

                      <div
                        ref={scrollRef}
                        className="mt-4 space-y-4 pr-2 overflow-auto max-h-[320px]"
                      >
                        <AnimatePresence>
                          {items.map((item, index) => (
                            <motion.div
                              key={item.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              transition={{ duration: 0.25 }}
                              className="rounded-2xl border border-gray-100 bg-gray-50 p-4"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <h3 className="font-semibold text-gray-800">
                                  ITEM {index + 1}
                                </h3>
                                <button
                                  onClick={() => handleDeleteItem(item.id)}
                                  className="text-red-600 hover:text-red-700"
                                  title="Delete Item"
                                >
                                  🗑
                                </button>
                              </div>
                              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                                {ITEM_FIELDS.map((field) => (
                                  <div key={field} className="space-y-1">
                                    <label className="text-xs font-medium text-gray-600">
                                      {field.charAt(0).toUpperCase() +
                                        field.slice(1)}
                                    </label>
                                    <input
                                      type={
                                        field === "description"
                                          ? "text"
                                          : "number"
                                      }
                                      name={field}
                                      value={item[field]}
                                      onChange={(e) =>
                                        handleItemChange(item.id, e)
                                      }
                                      className="rounded-xl border border-gray-200 bg-white px-3 py-2 w-full outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
                                    />
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    </div>

                    {items.length > 0 && (
                      <div className="bg-gray-50 p-4 rounded-2xl shadow-inner h-[420px] overflow-auto border border-gray-200 relative">
                        <div className="flex items-center justify-between mb-2">
                          <h2 className="text-lg font-semibold text-gray-800">
                            Generated JSON
                          </h2>
                          <button
                            onClick={handleCopyJson}
                            className="bg-blue-600 text-white px-3 py-2 rounded-xl shadow-sm hover:bg-blue-700 transition"
                          >
                            Copy JSON
                          </button>
                        </div>
                        <pre className="bg-white p-4 rounded-xl text-sm border border-gray-200 overflow-auto">
                          {JSON.stringify(items.map(stripId), null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 mt-6">
                    <button
                      onClick={handleAddItem}
                      className="bg-amber-500 text-white px-6 py-3 rounded-xl shadow-sm hover:bg-amber-600 transition"
                    >
                      + Add One
                    </button>
                    <button
                      onClick={handleDeleteAllItems}
                      className="bg-gray-700 text-white px-6 py-3 rounded-xl shadow-sm hover:bg-gray-800 transition"
                    >
                      🗑 Delete All
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>
    </div>
  );
};

export default JsonGenerator;
