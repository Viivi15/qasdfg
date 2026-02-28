import React, { useState } from "react";
import Tesseract from "tesseract.js";
import { Upload, Loader2, CheckCircle } from "lucide-react";

const BRAND_LIST = ["Samsung","LG","Sony","Apple","HP","Dell","Lenovo","Whirlpool","Bosch","OnePlus","Xiaomi","Realme","Panasonic"];

function extractDate(text: string) {
  // DD/MM/YYYY or DD-MM-YYYY
  const m1 = text.match(/\b(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})\b/);
  if (m1) return `${m1[3]}-${m1[2].padStart(2,"0")}-${m1[1].padStart(2,"0")}`;

  // "28 Feb 2026"
  const m2 = text.match(/\b(\d{1,2})\s*(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)\w*\s*(\d{4})\b/i);
  if (m2) {
    const monthMap: any = { jan:"01", feb:"02", mar:"03", apr:"04", may:"05", jun:"06", jul:"07", aug:"08", sep:"09", sept:"09", oct:"10", nov:"11", dec:"12" };
    const month = monthMap[m2[2].toLowerCase().slice(0,3)];
    return `${m2[3]}-${month}-${String(m2[1]).padStart(2,"0")}`;
  }
  return "";
}

function extractBrand(text: string) {
  const t = text.toLowerCase();
  const found = BRAND_LIST.find(b => t.includes(b.toLowerCase()));
  return found || "";
}

interface Props {
  onExtract: (data: { invoiceText: string; brand: string; purchaseDate: string; file: File }) => void;
}

export default function InvoiceOcrUploader({ onExtract }: Props) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState("");

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setFileName(file.name);
    setLoading(true);
    setProgress(0);

    try {
      const { data } = await Tesseract.recognize(file, "eng", {
        logger: m => {
          if (m.status === "recognizing text" && m.progress) setProgress(Math.round(m.progress * 100));
        }
      });

      const text = data.text || "";
      const purchaseDate = extractDate(text);
      const brand = extractBrand(text);

      onExtract({
        invoiceText: text,
        brand,
        purchaseDate,
        file
      });
    } catch (err) {
      console.error(err);
      alert("OCR failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition cursor-pointer relative">
      <input 
        type="file" 
        accept="image/*,application/pdf" 
        onChange={handleFile} 
        className="absolute inset-0 opacity-0 cursor-pointer"
      />
      
      {loading ? (
        <div className="flex flex-col items-center text-gray-600">
          <Loader2 className="animate-spin mb-2" />
          <p className="text-sm">Scanning Invoice... {progress}%</p>
        </div>
      ) : fileName ? (
        <div className="flex flex-col items-center text-green-600">
          <CheckCircle className="mb-2" />
          <p className="text-sm font-medium">{fileName}</p>
          <p className="text-xs text-gray-500 mt-1">Click to change</p>
        </div>
      ) : (
        <div className="flex flex-col items-center text-gray-500">
          <Upload className="mb-2" />
          <p className="font-medium">Upload Invoice</p>
          <p className="text-xs mt-1">Auto-fill details via OCR</p>
        </div>
      )}
    </div>
  );
}
