"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { getChangeLogs } from "@/lib/db";
import { AnimatePresence, motion } from "framer-motion";
import toggleTheme from "@/components/ThemeToggle";

type ChangeLogProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function ChangeLog({ isOpen, onClose }: ChangeLogProps) {
  const [changegetChangeLogs, setChangegetChangeLogs] = useState<{ version: string; changes: string[] }[]>([]);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  useEffect(() => {
    setChangegetChangeLogs(getChangeLogs);
  }, []);

  const handleAccordionChange = (value: string) => {
    setExpandedItem(expandedItem === value ? null : value);
  };

  const textVariants = {
    hidden: { opacity: 0 },
    visible: (i: number) => ({
      opacity: 1,
      transition: {
        delay: i * 0.1,
      },
    }),
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative w-full max-w-md max-h-[50vh] overflow-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent dark:scrollbar-thumb-gray-700 dark:scrollbar-track-transparent bg-white dark:bg-gray-950 dark:text-white rounded-lg shadow-lg m-4"
            initial={{ y: 50, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 50, opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="w-full flex items-center justify-between sticky top-0 bg-white dark:bg-gray-950 z-10 p-4 border-b dark:border-gray-800">
              <motion.h2
                onClick={toggleTheme}
                className="text-2xl font-bold cursor-pointer"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                تغییرات
              </motion.h2>
              <motion.button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                whileHover={{ scale: 1.2, rotate: 90 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
              >
                <X className="h-5 w-5 cursor-pointer" />
              </motion.button>
            </div>

            {/* Body */}
            <div className="p-6 w-full" dir="rtl">
              {changegetChangeLogs.map((log, index) => (
                <motion.div
                  key={index}
                  className="border-b last:border-b-0 px-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{
                    backgroundColor: "rgba(0, 0, 0, 0.03)",
                    transition: { duration: 0.2 },
                  }}
                >
                  <div
                    className="py-4 text-xl flex justify-between items-center cursor-pointer"
                    onClick={() => handleAccordionChange(`item-${index}`)}
                  >
                    <span className="font-medium">نسخه {log.version}</span>
                    <motion.div
                      animate={{ rotate: expandedItem === `item-${index}` ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M2 4L6 8L10 4"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </motion.div>
                  </div>

                  <AnimatePresence>
                    {expandedItem === `item-${index}` && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="pb-4 px-1">
                          <ul className="list-disc pl-5 space-y-1">
                            {log.changes.map(
                              (change, changeIndex) =>
                                change && (
                                  <motion.li
                                    key={changeIndex}
                                    className="text-gray-800 dark:text-gray-400"
                                    custom={changeIndex}
                                    initial="hidden"
                                    animate="visible"
                                    variants={textVariants}
                                  >
                                    - {change}
                                  </motion.li>
                                )
                            )}
                          </ul>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
