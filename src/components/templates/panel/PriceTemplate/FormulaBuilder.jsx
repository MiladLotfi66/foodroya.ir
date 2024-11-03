import React, { useState, useEffect, useRef } from "react";
import { MathJax, MathJaxContext } from 'better-react-mathjax';
import { evaluate } from 'mathjs';
import Select from 'react-select'; // استفاده از react-select

const FormulaBuilder = ({ onSave, onCancel ,formole}) => {
  const [formula, setFormula] = useState(formole);
  const [evaluationResult, setEvaluationResult] = useState(null);
  
  // تعریف متغیرها با حروف اختصاری
  const internalVariables = [
    { value: 'averageBuyPriceForeign', label: 'میانگین قیمت خرید ارزی', alias: 'a' },
    { value: 'latestBuyPriceForeign', label: 'آخرین قیمت خرید ارزی', alias: 'b' },
    { value: 'averageBuyPriceBaseCurrency', label: 'میانگین قیمت خرید به ارز پایه', alias: 'c' },
    { value: 'latestBuyPriceBaseCurrency', label: 'آخرین قیمت خرید به ارز پایه', alias: 'd' }
  ];

  const inputRef = useRef(null);

  // نقشه حروف اختصاری به متغیرها
  const aliasToVariableMap = internalVariables.reduce((acc, variable) => {
    acc[variable.alias] = variable.value;
    return acc;
  }, {});

  // نقشه متغیرها به حروف اختصاری
  const variableToAliasMap = internalVariables.reduce((acc, variable) => {
    acc[variable.value] = variable.alias;
    return acc;
  }, {});

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

  const insertVariable = (alias) => {
    // درج حروف اختصاری در مکان کرسر
    const cursorPosition = inputRef.current?.selectionStart || formula.length;
    const newFormula = formula.slice(0, cursorPosition) + alias + formula.slice(cursorPosition);
    setFormula(newFormula);
    
    // تنظیم مکان کرسر
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.setSelectionRange(cursorPosition + alias.length, cursorPosition + alias.length);
      }
    }, 0);
  };

  const getUsedAliases = (formulaStr) => {
    const usedAliases = new Set();
    Object.keys(aliasToVariableMap).forEach(alias => {
      const regex = new RegExp(`\\b${alias}\\b`, 'g');
      if (regex.test(formulaStr)) {
        usedAliases.add(alias);
      }
    });
    return Array.from(usedAliases);
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

    // شناسایی حروف اختصاری استفاده‌شده در فرمول
    const usedAliases = getUsedAliases(formula);
    if (usedAliases.length === 0) {
      alert("فرمول بدون متغیر می‌باشد و قابل ارزیابی است.");
    }

    const variableValues = {};

    // دریافت مقادیر متغیرها از کاربر
    for (let alias of usedAliases) {
      const varName = aliasToVariableMap[alias];
      const variable = internalVariables.find(v => v.value === varName);
      if (variable) {
        let value = '';
        while (true) {
          value = window.prompt(`لطفاً مقدار عددی برای "${variable.label}" (حرف اختصار: "${alias}") وارد کنید:`);
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
        variableValues[alias] = value;
      }
    }

    let evaluatableFormula = formula;

    for (let [alias, varValue] of Object.entries(variableValues)) {
      const regex = new RegExp(`\\b${alias}\\b`, 'g');
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
          <label htmlFor="formula-input" className="block mb-2 font-semibold">فرمول خود را وارد کنید:</label>
          <textarea
            id="formula-input"
            value={formula}
            onChange={(e) => handleFormulaChange(e.target.value)}
            className="w-full p-2 border bg-gray-200 dark:bg-zinc-500 rounded resize-vertical h-32 overflow-y-auto focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="مثلاً (a + b) * 0.1"
            ref={inputRef}
            dir="ltr"
          />
        </div>

        {/* بخش دکمه‌های متغیر */}
        <div className="mb-4">
          <label className="block mb-2 font-semibold">متغیرها:</label>
          <div className="flex flex-wrap gap-2">
            {internalVariables.map((variable, idx) => (
              <button
                key={idx}
                onClick={() => insertVariable(variable.alias)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                type="button"
              >
                {`${variable.label} (${variable.alias})`}
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
