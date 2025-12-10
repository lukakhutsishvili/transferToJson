import React, { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Plus, Trash2, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import ExcelToJson from "./ExcelReader";
import ChangeExcelFormat from "./changeExcelFormat";
import DropdownCard from "./DropdownCard";
import ItemForm from "./ItemForm";
import { LIMITS, EXCEL_CONSTANTS } from "../utils/constants";
import { generateComponents } from "../utils/excelHelpers";

const JsonGenerator = () => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [totalParcel, setTotalParcel] = useState("");
  const [shouldScroll, setShouldScroll] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const scrollRef = useRef(null);

  const { MAX_ITEMS, MAX_PARCELS } = LIMITS;
  const { DEFAULT_DIMENSIONS } = EXCEL_CONSTANTS;

  const handleTotalParcelChange = (e) => {
    let value = Number(e.target.value);
    if (value > MAX_PARCELS) value = MAX_PARCELS;
    setTotalParcel(value ? value : "");
  };

  const handleGenerateItems = useCallback(() => {
    let count = Number(totalParcel);
    if (!count || count <= 0) return;

    count = Math.min(count, MAX_PARCELS);
    const generatedItems = generateComponents(count).map((component) => ({
      id: crypto.randomUUID(),
      ...component,
    }));
    setItems(generatedItems);
    setShouldScroll(false);
  }, [totalParcel, MAX_PARCELS]);

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

  const handleDeleteAllItems = useCallback(() => {
    setItems([]);
    setTotalParcel("");
  }, []);

  const handleAddItem = useCallback(() => {
    setItems((prevItems) => {
      if (prevItems.length >= MAX_ITEMS) return prevItems;
      return [
        ...prevItems,
        {
          id: crypto.randomUUID(),
          description: String(prevItems.length + 1),
          ...DEFAULT_DIMENSIONS,
        },
      ];
    });
    setShouldScroll(true);
  }, [MAX_ITEMS, DEFAULT_DIMENSIONS]);

  const handleCopyJson = async () => {
    try {
      const jsonWithoutId = items.map(({ id, ...rest }) => rest);
      await navigator.clipboard.writeText(
        JSON.stringify(jsonWithoutId, null, 2)
      );
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
      setCopySuccess(false);
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

  const jsonOutput = items.map(({ id, ...rest }) => rest);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-8 space-y-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Excel to JSON Converter
        </h1>

        <ChangeExcelFormat />

        <div className="max-w-4xl mx-auto space-y-4 mb-8">
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
          />
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

        <div className="flex justify-center mb-6">
          <button
            onClick={() => setIsPanelOpen((prev) => !prev)}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-full shadow-md hover:shadow-lg transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium"
          >
            {isPanelOpen ? (
              <>
                <EyeOff className="w-5 h-5" />
                Hide Panel
              </>
            ) : (
              <>
                <Eye className="w-5 h-5" />
                Show Panel
              </>
            )}
          </button>
        </div>

        <AnimatePresence>
          {isPanelOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-7xl mx-auto"
            >
            <div className="w-full min-h-[580px] flex flex-col bg-white shadow-xl rounded-2xl px-6 py-8">
              <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
                Enter Item Details
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
                <div className="lg:col-span-2">
                  <div className="flex gap-3 items-end mb-4">
                    <button
                      onClick={handleGenerateItems}
                      disabled={!totalParcel || Number(totalParcel) <= 0}
                      className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                    >
                      Generate
                    </button>
                    <div className="relative flex-grow">
                      <input
                        type="number"
                        value={totalParcel}
                        onChange={handleTotalParcelChange}
                        className="border-b-2 border-gray-300 p-3 w-full outline-none focus:border-blue-400 peer transition bg-transparent"
                        min="1"
                        max={MAX_PARCELS}
                        placeholder=" "
                        aria-label="Number of parcels"
                      />
                      <label className="absolute left-0 peer-focus:-top-4 peer-focus:text-xs peer-focus:text-gray-500 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 -top-4 text-xs text-gray-500 transition-all duration-200 pointer-events-none">
                        Number of Parcels (max {MAX_PARCELS})
                      </label>
                    </div>
                  </div>

                  <div
                    ref={scrollRef}
                    className="mt-4 space-y-4 pb-3 overflow-auto max-h-[400px] pr-2"
                  >
                    {items.length === 0 ? (
                      <div className="text-center text-gray-400 py-8">
                        No items yet. Generate items or add manually.
                      </div>
                    ) : (
                      <AnimatePresence>
                        {items.map((item, index) => (
                          <ItemForm
                            key={item.id}
                            item={item}
                            index={index}
                            onItemChange={handleItemChange}
                            onDeleteItem={handleDeleteItem}
                          />
                        ))}
                      </AnimatePresence>
                    )}
                  </div>
                </div>

                {items.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg shadow-inner h-[500px] overflow-auto border border-gray-300 relative">
                    <div className="sticky top-0 bg-gray-50 z-10 pb-2 mb-2 border-b border-gray-300">
                      <h2 className="text-xl font-semibold text-gray-700 mb-2">
                        Generated JSON
                      </h2>
                      <button
                        onClick={handleCopyJson}
                        className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded shadow-md hover:bg-blue-700 transition text-sm font-medium"
                      >
                        {copySuccess ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            Copy JSON
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="bg-gray-200 p-4 rounded-lg text-sm border border-gray-300 overflow-auto font-mono">
                      {JSON.stringify(jsonOutput, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={handleAddItem}
                  disabled={items.length >= MAX_ITEMS}
                  className="inline-flex items-center gap-2 bg-yellow-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-yellow-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                >
                  <Plus className="w-5 h-5" />
                  Add One
                </button>
                <button
                  onClick={handleDeleteAllItems}
                  disabled={items.length === 0}
                  className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-red-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                >
                  <Trash2 className="w-5 h-5" />
                  Delete All
                </button>
                {items.length > 0 && (
                  <div className="ml-auto flex items-center text-sm text-gray-600">
                    {items.length} / {MAX_ITEMS} items
                  </div>
                )}
              </div>
            </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default JsonGenerator;
