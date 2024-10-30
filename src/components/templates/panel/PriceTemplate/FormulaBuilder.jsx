import React, { useState, useEffect, useRef } from "react";
import { MathJax, MathJaxContext } from 'better-react-mathjax';
import { evaluate } from 'mathjs';
import Select from 'react-select'; // استفاده از react-select

const FormulaBuilder = ({ onSave, onCancel }) => {
  const [formula, setFormula] = useState("");
  const [evaluationResult, setEvaluationResult] = useState(null);
  
  const internalVariables = [
    { value: 'averageBuyPriceForeign', label: 'میانگین قیمت خرید ارزی' },
    { value: 'latestBuyPriceForeign', label: 'آخرین قیمت خرید ارزی' },
    { value: 'averageBuyPriceBaseCurrency', label: 'میانگین قیمت خرید به ارز پایه' },
    { value: 'latestBuyPriceBaseCurrency', label: 'آخرین قیمت خرید به ارز پایه' }
  ];

  const inputRef = useRef(null);

  // تابع تبدیل اعداد فارسی به لاتین
  const convertPersianDigitsToEnglish = (input) => {
    const persianDigits = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
    const englishDigits = ['0','1','2','3','4','5','6','7','8','9'];
    let converted = input;
    for(let i=0; i < persianDigits.length; i++) {
      const regex = new RegExp(persianDigits[i], 'g');
      converted = converted.replace(regex, englishDigits[i]);
    }
    return converted;
  };

  const handleFormulaChange = (value) => {
    const convertedInput = convertPersianDigitsToEnglish(value);
    setFormula(convertedInput);
    setEvaluationResult(null); // ریست کردن نتیجه ارزیابی
  };

  const insertVariable = (variableValue) => {
    // درج متغیر در مکان کادر نوشته
    const cursorPosition = inputRef.current?.selectionStart || formula.length;
    const newFormula = formula.slice(0, cursorPosition) + variableValue + formula.slice(cursorPosition);
    setFormula(newFormula);
    
    // تنظیم مکان کرسر
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.setSelectionRange(cursorPosition + variableValue.length, cursorPosition + variableValue.length);
      }
    }, 0);
  };

  const getUsedVariables = (formulaStr) => {
    const usedVars = new Set();
    internalVariables.forEach(variable => {
      const regex = new RegExp(`\\b${variable.value}\\b`, 'g');
      if (regex.test(formulaStr)) {
        usedVars.add(variable.value);
      }
    });
    return Array.from(usedVars);
  };

  const isParenthesesBalanced = (formulaStr) => {
    let balance = 0;
    for (let char of formulaStr) {
      if (char === '(') balance += 1;
      if (char === ')') balance -= 1;
      if (balance < 0) return false;
    }
    return balance === 0;
  };

  const evaluateFormula = async () => {
    if (!isParenthesesBalanced(formula)) {
      alert("تعداد پرانتزهای باز و بسته برابر نیست. لطفاً فرمول را بررسی کنید.");
      return;
    }

    // بررسی استفاده صحیح از درصد
    const percentageInvalid = /%[^0-9]/.test(formula) || /^%/.test(formula);
    if (percentageInvalid) {
      alert("استفاده از درصد نامعتبر است. لطفاً درصدها را بررسی کنید.");
      return;
    }

    // شناسایی متغیرهای استفاده‌شده در فرمول
    const usedVariables = getUsedVariables(formula);
    if (usedVariables.length === 0) {
      alert("فرمول بدون متغیر می‌باشد و قابل ارزیابی است.");
    }

    const variableValues = {};

    // دریافت مقادیر متغیرها از کاربر
    for (let varName of usedVariables) {
      const variable = internalVariables.find(v => v.value === varName);
      if (variable) {
        let value = '';
        while (true) {
          value = window.prompt(`لطفاً مقدار عددی برای "${variable.label}" وارد کنید:`);
          if (value === null) {
            // کاربر لغو کرد
            return;
          }
          value = convertPersianDigitsToEnglish(value);
          if (value.trim() === '' || isNaN(value)) {
            alert("لطفاً یک مقدار عددی معتبر وارد کنید.");
          } else {
            break;
          }
        }
        variableValues[varName] = value;
      }
    }

    let evaluatableFormula = formula;

    for (let [varName, varValue] of Object.entries(variableValues)) {
      const regex = new RegExp(`\\b${varName}\\b`, 'g');
      evaluatableFormula = evaluatableFormula.replace(regex, `(${varValue})`);
    }

    // جایگزینی درصدها
    evaluatableFormula = evaluatableFormula.replace(/%/g, '* 0.01');

    try {
      const result = evaluate(evaluatableFormula);
      setEvaluationResult(result);
    } catch (error) {
      alert("خطا در ارزیابی فرمول. لطفاً فرمول را بررسی کنید.");
      console.error(error);
    }
  };

  const handleSave = () => {
    if (!isParenthesesBalanced(formula)) {
      alert("تعداد پرانتزهای باز و بسته برابر نیست. لطفاً فرمول را بررسی کنید.");
      return;
    }

    const percentageInvalid = /%[^0-9]/.test(formula) || /^%/.test(formula);
    if (percentageInvalid) {
      alert("استفاده از درصد نامعتبر است. لطفاً درصدها را بررسی کنید.");
      return;
    }

    onSave(formula);
  };

  return (
    <MathJaxContext>
      <div className="formula-builder">
        <h2 className="text-xl font-bold mb-4">سازنده فرمول قیمت</h2>

        <div className="mb-4">
          <label className="block mb-2 font-semibold">فرمول خود را وارد کنید:</label>
          <input
            type="text"
            value={formula}
            onChange={(e) => handleFormulaChange(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="مثلاً (averageBuyPriceForeign + latestBuyPriceForeign) * 0.1"
            ref={inputRef}
          />
        </div>

        {/* بخش دکمه‌های متغیر */}
        <div className="mb-4">
          <label className="block mb-2 font-semibold">متغیرها:</label>
          <div className="flex flex-wrap gap-2">
            {internalVariables.map((variable, idx) => (
              <button
                key={idx}
                onClick={() => insertVariable(variable.value)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                type="button"
              >
                {variable.label}
              </button>
            ))}
          </div>
        </div>

        {/* بخش حذف شده مقداردهی به متغیرها */}

        <div className="mb-4">
          <label className="block mb-2 font-semibold">تست فرمول</label>
          <div className="flex items-center gap-2">
            <button
              onClick={evaluateFormula}
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded"
              disabled={formula.trim() === ""}
            >
              ارزیابی
            </button>
            <span className="font-semibold">نتیجه: </span>
            <span className="font-mono">{evaluationResult !== null ? evaluationResult : "—"}</span>
          </div>
        </div>

        <div className="mb-4">
          <label className="block mb-2 font-semibold">نمایش فرمول:</label>
          <div className="p-2 border rounded bg-gray-100">
            <MathJax>
              {`$$${formula}$$`}
            </MathJax>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            لغو
          </button>
          <button
            onClick={handleSave}
            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded"
            disabled={formula.trim() === ""}
          >
            ذخیره
          </button>
        </div>
      </div>
    </MathJaxContext>
  );
};

export default FormulaBuilder;
