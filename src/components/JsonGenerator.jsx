import React, { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ExcelToJson from "./ExcelReader";
import { ChevronDown } from "lucide-react"; // Make sure lucide-react is installed
// import ChangeExcelFormat from "./changeExcelFormat";

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
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [totalParcel, setTotalParcel] = useState("");
  const [shouldScroll, setShouldScroll] = useState(false);
  const scrollRef = useRef(null);

  const handleTotalParcelChange = (e) => {
    let value = Number(e.target.value);
    if (value > 10) value = 10;
    setTotalParcel(value ? value : "");
  };

  const handleGenerateItems = useCallback(() => {
    let count = Number(totalParcel);
    if (!count || count <= 0) return;

    count = Math.min(count, 10);
    const generatedItems = Array.from({ length: count }, (_, index) => ({
      id: crypto.randomUUID(),
      description: (index + 1).toString(),
      length: "1",
      width: "1",
      height: "1",
      weight: "1",
    }));
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
      if (prevItems.length >= 10) return prevItems;
      return [
        ...prevItems,
        {
          id: crypto.randomUUID(),
          description: prevItems.length + 1,
          length: "1",
          width: "1",
          height: "1",
          weight: "1",
        },
      ];
    });
    setShouldScroll(true);
  };

  const handleCopyJson = async () => {
    try {
      const jsonWithoutId = items.map(({ id, ...rest }) => rest);
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
    <div className="min-h-screen bg-gray-100 px-4 pt-10 space-y-4">
      {/* <ChangeExcelFormat /> */}
      <div className="max-w-7xl space-y-6">
        <DropdownCard
          title="კლიენტის მონაცემები"
          imageSrc="image.png"
          alt="კლიენტის მონაცემები"
        >
          თუ აგზავნით სერვისცენტრიდან ამანათს მაშინ აუცილებელია შეავსოთ "sending
          from serviscenter"(აირჩიოთ სასურველი დელივოს სერვისცენტრი, სადაც
          შეძლებთ ამანათის მიტანას) თუ არის საკურიერო აუცილებელია შეავსოთ ქალაქი
          და გამოტანის მისამართი
        </DropdownCard>
        <DropdownCard
          title="მიმღების მონაცემები"
          imageSrc="photo_2025-03-25_13-54-50.jpg"
          alt="მიმღების მონაცემები"
        ></DropdownCard>
        <DropdownCard
          title="ამანთის მონაცემები"
          imageSrc="photo_2025-03-25_17-19-47.jpg"
          alt="ამანთის მონაცემები"
        >
          თუ ამანათი არის ადგილებიანი შეგიძლიათ დააჭიროთ ღილაკს "show panel",
          დააგენერიროთ სპეციალური ფორმატი და ჩაწეროთ places ველში თუ უკვე გაქვთ
          places ველში ჩაწეროთ ციფრი თუ რამდენი ადგილიანი ამანათისგან შედგება,
          ექსელის ფაილი ატვირთოთ საიტზე "choose file" და შემდეგ "export"(
          თავისით დააგენერირებს საიტი ადგილებიან ამანათს)
        </DropdownCard>
      </div>

      <ExcelToJson />

      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="bg-blue-600 text-white px-6 py-3 rounded-full shadow-md hover:shadow-lg transition transform hover:scale-105 focus:outline-none"
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
            <div className="w-full min-h-[580px] flex flex-col bg-white shadow-xl rounded-2xl px-6 py-8">
              <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
                Enter Item Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <div className="flex gap-2 items-end">
                    <button
                      onClick={handleGenerateItems}
                      className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-green-700 transition"
                    >
                      Generate
                    </button>
                    <div className="relative flex-grow">
                      <input
                        type="number"
                        value={totalParcel}
                        onChange={handleTotalParcelChange}
                        className="border-b-2 border-gray-300 p-3 w-full outline-none focus:border-blue-400 peer transition"
                        min="1"
                        placeholder=" "
                      />
                      <label className="absolute left-0 peer-focus:-top-4 peer-focus:text-xs peer-focus:text-gray-500 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 -top-4 text-xs text-gray-500 transition-all duration-200 pointer-events-none">
                        Number of Parcels
                      </label>
                    </div>
                  </div>

                  <div
                    ref={scrollRef}
                    className="mt-4 space-y-6 pb-3 overflow-auto max-h-[292px]"
                  >
                    <AnimatePresence>
                      {items.map((item, index) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.3 }}
                          className="rounded-lg pr-2"
                        >
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-700 mb-3">
                              ITEM {index + 1}
                            </h3>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="text-red-500 hover:text-red-700"
                              title="Delete Item"
                            >
                              🗑
                            </button>
                          </div>
                          <div className="grid grid-cols-5 gap-4">
                            {[
                              "description",
                              "length",
                              "width",
                              "height",
                              "weight",
                            ].map((field) => (
                              <div key={field} className="relative">
                                <input
                                  type={
                                    field === "description" ? "text" : "number"
                                  }
                                  name={field}
                                  value={item[field]}
                                  onChange={(e) => handleItemChange(item.id, e)}
                                  className="border-b-2 border-gray-300 p-2 w-full outline-none focus:border-blue-400 peer transition"
                                  placeholder=" "
                                />
                                <label className="absolute left-0 peer-focus:-top-4 peer-focus:text-xs peer-focus:text-gray-500 peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 -top-4 text-xs text-gray-500 transition-all duration-200 pointer-events-none">
                                  {field.charAt(0).toUpperCase() +
                                    field.slice(1)}
                                </label>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>

                {items.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg shadow-inner h-[384px] overflow-auto border border-gray-300 relative">
                    <h2 className="text-xl font-semibold mb-2 text-gray-700">
                      Generated JSON
                    </h2>
                    <button
                      onClick={handleCopyJson}
                      className="absolute top-1 right-4 bg-blue-600 text-white px-3 py-2 rounded shadow-md hover:bg-blue-700 transition"
                    >
                      Copy JSON
                    </button>
                    <pre className="bg-gray-200 p-6 rounded-lg text-base border border-gray-300 overflow-auto">
                      {JSON.stringify(
                        items.map(({ id, ...rest }) => rest),
                        null,
                        2
                      )}
                    </pre>
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-auto">
                <button
                  onClick={handleAddItem}
                  className="bg-yellow-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-yellow-600 transition"
                >
                  + Add One
                </button>
                <button
                  onClick={handleDeleteAllItems}
                  className="bg-gray-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-gray-700 transition"
                >
                  🗑 Delete All
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default JsonGenerator;
