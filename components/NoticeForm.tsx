import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Sparkles, Calendar, Tag, AlertOctagon, Upload, X, ShieldAlert } from "lucide-react";
import { Notice } from "./NoticeCard.tsx";

interface NoticeFormData {
  title: string;
  body: string;
  category: string;
  priority: string;
  publishDate: string;
}

interface NoticeFormProps {
  initialData?: Notice | null;
  onSubmit: (data: NoticeFormData & { image?: string | null }) => void;
  isLoading: boolean;
  onCancel: () => void;
}

export default function NoticeForm({ initialData = null, onSubmit, isLoading, onCancel }: NoticeFormProps) {
  const [imageBase64, setImageBase64] = useState<string | null>(initialData?.image || null);
  const [imageError, setImageError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NoticeFormData>({
    defaultValues: {
      title: initialData?.title || "",
      body: initialData?.body || "",
      category: initialData?.category || "General",
      priority: initialData?.priority || "Normal",
      publishDate: initialData?.publishDate 
        ? new Date(initialData.publishDate).toISOString().substring(0, 10)
        : new Date().toISOString().substring(0, 10),
    },
  });

  // Sync image when editing
  useEffect(() => {
    if (initialData?.image) {
      setImageBase64(initialData.image);
    } else {
      setImageBase64(null);
    }
  }, [initialData]);

  // Handle local image to base64 conversion
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setImageError("FILE EXCEEDS BANDWIDTH ALLOCATION (MAX 2MB)");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageBase64(reader.result as string);
      setImageError("");
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setImageError("FILE EXCEEDS BANDWIDTH ALLOCATION (MAX 2MB)");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageBase64(reader.result as string);
      setImageError("");
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImageBase64(null);
  };

  const handleFormSubmit = (data: NoticeFormData) => {
    onSubmit({
      ...data,
      image: imageBase64,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* CORNER DECORATION FRAME */}
      <div className="relative border-2 border-zinc-800 bg-[#06060a] p-6 md:p-8 space-y-6">
        <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-[#00f0ff]" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-[#ff00ff]" />

        <div className="flex items-center gap-2 border-b border-zinc-800 pb-4 mb-4">
          <Sparkles className="w-5 h-5 text-[#ff00ff]" />
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#00f0ff] glitch-shadow-cyan">
            {initialData ? "MODIFY ACTIVE BULLETIN" : "CREATE NEW DECENTRALIZED NOTICE"}
          </h2>
        </div>

        {/* TITLE FIELD */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
            Bulletin Title <span className="text-[#ff00ff]">*</span>
          </label>
          <input
            type="text"
            placeholder="ENTER NODE TRANSMISSION TITLE..."
            className={`w-full px-4 py-3 bg-black border-2 outline-none text-sm tracking-wider font-mono transition-all duration-300 ${
              errors.title 
                ? "border-red-500 text-red-500 focus:shadow-[0_0_10px_rgba(239,68,68,0.5)]" 
                : "border-zinc-800 focus:border-[#00f0ff] focus:shadow-[0_0_10px_rgba(0,240,255,0.3)] text-slate-100"
            }`}
            {...register("title", { required: "BULLETIN TITLE IS REQUIRED FROM NETWORK OPERATION" })}
          />
          {errors.title && (
            <p className="text-red-500 text-xs uppercase tracking-wide flex items-center gap-1 mt-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              {errors.title.message}
            </p>
          )}
        </div>

        {/* BODY FIELD */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
            Bulletin Body Content <span className="text-[#ff00ff]">*</span>
          </label>
          <textarea
            rows={5}
            placeholder="PROVIDE MAIN DISPATCH CONTENT..."
            className={`w-full px-4 py-3 bg-black border-2 outline-none text-sm tracking-wider font-mono transition-all duration-300 whitespace-pre-wrap ${
              errors.body 
                ? "border-red-500 text-red-500 focus:shadow-[0_0_10px_rgba(239,68,68,0.5)]" 
                : "border-zinc-800 focus:border-[#00f0ff] focus:shadow-[0_0_10px_rgba(0,240,255,0.3)] text-slate-100"
            }`}
            {...register("body", { required: "BULLETIN CONTENT IS CRITICAL; CANNOT REMAIN NULL" })}
          />
          {errors.body && (
            <p className="text-red-500 text-xs uppercase tracking-wide flex items-center gap-1 mt-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              {errors.body.message}
            </p>
          )}
        </div>

        {/* META DOCKS (CATEGORY & PRIORITY & PUBLISH DATE) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* CATEGORY DROPDOWN */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-[#00f0ff]" />
              <span>Category Block</span>
            </label>
            <select
              className="w-full px-4 py-3 bg-black border-2 border-zinc-800 focus:border-[#00f0ff] outline-none text-sm tracking-wider text-slate-100 font-mono transition-colors"
              {...register("category")}
            >
              <option value="Exam">Exam Block</option>
              <option value="Event">Event Block</option>
              <option value="General">General Transmission</option>
            </select>
          </div>

          {/* PRIORITY DROPDOWN */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
              <AlertOctagon className="w-3.5 h-3.5 text-[#ff00ff]" />
              <span>Priority Status</span>
            </label>
            <select
              className="w-full px-4 py-3 bg-black border-2 border-zinc-800 focus:border-[#00f0ff] outline-none text-sm tracking-wider text-slate-100 font-mono transition-colors"
              {...register("priority")}
            >
              <option value="Normal">Normal Operation</option>
              <option value="Urgent">Urgent Priority</option>
            </select>
          </div>

          {/* PUBLISH DATE PICKER */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-zinc-400" />
              <span>Publish Date</span>
            </label>
            <input
              type="date"
              className="w-full px-4 py-3 bg-black border-2 border-zinc-800 focus:border-[#00f0ff] outline-none text-sm tracking-wider text-slate-100 font-mono transition-colors"
              {...register("publishDate", { required: "VALID TIMESTAMP DATE IS COMPULSORY" })}
            />
          </div>
        </div>

        {/* IMAGE UPLOAD DOCK */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
            Image Asset Matrix (Optional)
          </label>
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="border-2 border-dashed border-zinc-800 bg-black/50 p-6 flex flex-col items-center justify-center relative cursor-pointer hover:border-[#00f0ff] transition-all group"
          >
            {imageBase64 ? (
              <div className="relative w-full max-h-64 overflow-hidden border border-zinc-800">
                <img
                  src={imageBase64}
                  alt="Asset Preview"
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute top-2 right-2 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded shadow transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="w-full h-full flex flex-col items-center justify-center py-4 cursor-pointer">
                <Upload className="w-8 h-8 text-zinc-500 group-hover:text-[#00f0ff] mb-2 transition-colors" />
                <span className="text-xs font-bold text-zinc-400 group-hover:text-[#00f0ff] transition-colors mb-1">
                  DRAG & DROP IMAGE OR CLICK TO INJECT
                </span>
                <span className="text-[10px] text-zinc-600">
                  PNG / JPG UP TO 2MB FOR CORE BANDWIDTH
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
          {imageError && (
            <p className="text-red-500 text-xs font-bold uppercase tracking-wide flex items-center gap-1 mt-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              {imageError}
            </p>
          )}
        </div>

        {/* FORM ACTION CONTROLS */}
        <div className="flex items-center justify-end gap-3 border-t border-zinc-800 pt-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-5 py-2.5 border border-zinc-700 hover:border-[#ff00ff] hover:bg-[#ff00ff]/10 text-xs font-bold uppercase tracking-wider text-zinc-300 transition-all cursor-pointer disabled:opacity-50"
          >
            Abort Dispatch
          </button>

          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2.5 border-2 border-[#00f0ff] bg-black hover:bg-[#00f0ff] hover:text-black hover:glitch-shadow-cyan text-xs font-bold uppercase tracking-wider text-[#00f0ff] transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full border-2 border-t-transparent border-current animate-spin" />
                <span>Broadcasting...</span>
              </span>
            ) : (
              <span>Confirm Dispatch</span>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
