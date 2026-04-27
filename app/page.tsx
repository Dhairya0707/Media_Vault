"use client";

import { useState, useEffect, useCallback } from "react";
import {
  UploadCloud,
  Copy,
  Maximize2,
  X,
  FileImage,
  MoreHorizontal,
  CheckCircle2,
  Calendar,
  HardDrive,
  LayoutGrid,
  List as ListIcon,
  Loader2,
  Trash2,
  AlertTriangle,
  FileText,
  Eye,
  EyeOff,
  Box,
} from "lucide-react";
import Image from "next/image";
// --- TYPES ---
interface CloudinaryAsset {
  asset_id: string;
  public_id: string;
  resource_type: string;
  secure_url: string;
  format: string;
  bytes: number;
  width: number;
  height: number;
  created_at: string;
}

interface Toast {
  id: number;
  message: string;
  type: "success" | "error";
}

// --- UTILS ---
const formatBytes = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "2-digit",
  });
};

// Helper to check if file is viewable as an image
const isImageFile = (format: string, resourceType: string) => {
  if (resourceType === "image" && format !== "pdf") return true;
  const imgFormats = ["jpg", "jpeg", "png", "gif", "webp", "svg", "ico"];
  return imgFormats.includes(format?.toLowerCase());
};

export default function AssetManagerV3() {
  const [assets, setAssets] = useState<CloudinaryAsset[]>([]);
  const [loading, setLoading] = useState(true);

  // VIEW STATE
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [showPreviews, setShowPreviews] = useState(false); // Default HIDDEN as requested

  const [selectedAsset, setSelectedAsset] = useState<CloudinaryAsset | null>(
    null
  );
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Upload State
  const [uploading, setUploading] = useState(false);

  // --- TOAST SYSTEM ---
  const addToast = (message: string, type: "success" | "error" = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  // --- DATA FETCHING ---
  const fetchAssets = useCallback(async () => {
    try {
      const res = await fetch("/api/media");
      const data = await res.json();
      setAssets(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch error", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  // --- UPLOAD HANDLER ---
  const handleUpload = async (file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Upload failed");

      addToast("File uploaded successfully", "success");
      await fetchAssets();
    } catch (err: any) {
      addToast(err.message, "error");
    } finally {
      setUploading(false);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) handleUpload(e.target.files[0]);
  };

  // --- DELETE HANDLER ---
  const handleDelete = async (public_id: string, resource_type: string) => {
    try {
      const res = await fetch("/api/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ public_id, resource_type }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Delete failed");

      setAssets((prev) => prev.filter((item) => item.public_id !== public_id));
      setSelectedAsset(null);
      addToast("Asset terminated", "success");
    } catch (err: any) {
      addToast(err.message || "Failed to delete", "error");
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-[#e4e4e7] font-mono selection:bg-orange-500/30">
      {/* --- HEADER --- */}
      <header className="sticky top-0 z-20 border-b border-zinc-800 bg-[#09090b]/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="h-3 w-3 rounded-sm bg-orange-600 shadow-[0_0_10px_rgba(234,88,12,0.5)]"></div>
            <h1 className="text-sm font-bold tracking-tight text-zinc-100">
              SYSTEM_EXPLORER
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {/* VIEW CONTROLS */}
            <div className="flex rounded bg-zinc-900 p-1">
              {/* TOGGLE PREVIEW BUTTON */}
              <button
                onClick={() => setShowPreviews(!showPreviews)}
                className={`rounded p-1.5 transition-colors mr-2 border-r border-zinc-800 ${
                  showPreviews
                    ? "text-orange-500 bg-orange-500/10"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
                title={showPreviews ? "Hide Previews" : "Show Previews"}
              >
                {showPreviews ? <Eye size={14} /> : <EyeOff size={14} />}
              </button>

              <button
                onClick={() => setViewMode("list")}
                className={`rounded p-1.5 transition-colors ${
                  viewMode === "list"
                    ? "bg-zinc-700 text-white"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                <ListIcon size={14} />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`rounded p-1.5 transition-colors ${
                  viewMode === "grid"
                    ? "bg-zinc-700 text-white"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                <LayoutGrid size={14} />
              </button>
            </div>

            {/* UPLOAD BUTTON */}
            <label
              className={`cursor-pointer group relative flex items-center gap-2 rounded bg-white px-3 py-1.5 text-xs font-bold text-black transition-all hover:bg-zinc-200 ${
                uploading ? "opacity-50 pointer-events-none" : ""
              }`}
            >
              <input
                type="file"
                className="hidden"
                onChange={onFileChange}
                disabled={uploading}
              />
              {uploading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <UploadCloud size={14} />
              )}
              <span className="hidden sm:inline">
                {uploading ? "SYNCING..." : "UPLOAD"}
              </span>
            </label>
          </div>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="mx-auto max-w-2xl p-2 sm:p-4 pb-20">
        {!loading && assets.length === 0 && (
          <div className="flex h-64 flex-col items-center justify-center gap-4 border border-dashed border-zinc-800 rounded-lg text-zinc-500">
            <FileImage size={32} className="opacity-20" />
            <p className="text-xs">NO ASSETS FOUND IN INDEX</p>
          </div>
        )}

        {viewMode === "list" && (
          <div className="space-y-1">
            {assets.map((asset) => (
              <AssetRow
                key={asset.asset_id}
                asset={asset}
                showPreview={showPreviews} // Pass the toggle state
                onSelect={() => setSelectedAsset(asset)}
                onCopy={() => addToast("URL copied to clipboard")}
              />
            ))}
          </div>
        )}

        {viewMode === "grid" && (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {assets.map((asset) => {
              const isImg = isImageFile(asset.format, asset.resource_type);
              return (
                <div
                  key={asset.asset_id}
                  onClick={() => setSelectedAsset(asset)}
                  className="group relative aspect-square cursor-pointer overflow-hidden rounded border border-zinc-800 bg-zinc-900 hover:border-zinc-500 flex items-center justify-center"
                >
                  {isImg ? (
                    <img
                      src={asset.secure_url}
                      className="h-full w-full object-cover opacity-70 transition-opacity group-hover:opacity-100"
                    />
                  ) : (
                    <div className="text-zinc-600 group-hover:text-zinc-400">
                      <FileText size={24} />
                      <span className="absolute bottom-2 right-2 text-[10px] uppercase font-bold opacity-50">
                        {asset.format}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* --- DETAIL DRAWER --- */}
      {selectedAsset && (
        <DetailDrawer
          asset={selectedAsset}
          onClose={() => setSelectedAsset(null)}
          onCopy={() => addToast("URL copied to clipboard")}
          onDelete={() =>
            handleDelete(
              selectedAsset.public_id,
              selectedAsset.resource_type || "image"
            )
          }
        />
      )}

      {/* --- TOAST CONTAINER --- */}
      <div className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 flex-col gap-2 w-full max-w-xs px-4">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="flex items-center gap-2 rounded border border-zinc-800 bg-[#09090b] px-4 py-3 text-xs font-medium text-white shadow-2xl animate-in slide-in-from-bottom-5 fade-in"
          >
            {toast.type === "success" ? (
              <CheckCircle2 size={14} className="text-orange-500" />
            ) : (
              <X size={14} className="text-red-500" />
            )}
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
}

// --- SUB COMPONENTS ---

function AssetRow({
  asset,
  showPreview,
  onSelect,
  onCopy,
}: {
  asset: CloudinaryAsset;
  showPreview: boolean;
  onSelect: () => void;
  onCopy: () => void;
}) {
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(asset.secure_url);
    onCopy();
  };

  const isImg = isImageFile(asset.format, asset.resource_type);

  return (
    <div
      onClick={onSelect}
      className="group flex items-center justify-between gap-4 rounded border border-transparent bg-[#111113] p-2 transition-all hover:border-zinc-700 hover:bg-[#161618] active:scale-[0.99] cursor-pointer"
    >
      <div className="flex items-center gap-3 overflow-hidden">
        {/* THUMBNAIL LOGIC */}
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center">
          {isImg && showPreview ? (
            // <img
            //   src={asset.secure_url}
            //   className="h-full w-full object-cover"
            //   loading="lazy"
            // />
            <Image
              src={asset.secure_url}
              alt={asset.public_id}
              width={64} // Load a small 64px version (double dense for retina)
              height={64}
              className="h-full w-full object-cover"
              unoptimized={asset.format === "gif"} // Optional: GIFs play better unoptimized
            />
          ) : (
            // <Image
            //   src={asset.secure_url}
            //   alt={asset.public_id}
            //   // width={64} // Load a small 64px version (double dense for retina)
            //   // height={64}
            //   className="h-full w-full object-cover"
            //   // unoptimized={asset.format === "gif"} // Optional: GIFs play better unoptimized
            // />
            // Show Icon if not image OR if preview is toggled off
            <div className="text-zinc-500">
              {isImg ? <FileImage size={18} /> : <FileText size={18} />}
            </div>
          )}
        </div>

        <div className="flex flex-col overflow-hidden">
          <span className="truncate text-xs font-medium text-zinc-200">
            {asset.public_id.split("/").pop()}
          </span>
          <div className="flex items-center gap-2 text-[10px] text-zinc-500">
            <span className="uppercase bg-zinc-800/50 px-1 rounded">
              {asset.format}
            </span>
            <span>{formatBytes(asset.bytes)}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
        <button
          onClick={handleCopy}
          className="rounded p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white"
        >
          <Copy size={14} />
        </button>
      </div>
    </div>
  );
}

function DetailDrawer({
  asset,
  onClose,
  onCopy,
  onDelete,
}: {
  asset: CloudinaryAsset;
  onClose: () => void;
  onCopy: () => void;
  onDelete: () => Promise<void>;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const isImg = isImageFile(asset.format, asset.resource_type);

  const handleCopy = () => {
    navigator.clipboard.writeText(asset.secure_url);
    onCopy();
  };

  const handleDeleteClick = async () => {
    if (!confirm("Are you sure you want to permanently destroy this asset?"))
      return;

    setIsDeleting(true);
    await onDelete();
    setIsDeleting(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="h-full w-full max-w-md border-l border-zinc-800 bg-[#09090b] shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 p-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Asset Inspector
          </h2>
          <button onClick={onClose} className="rounded p-1 hover:bg-zinc-800">
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Preview Area */}
          <div className="relative flex items-center justify-center rounded-lg border border-zinc-800 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-zinc-900 p-8 min-h-[200px]">
            {isImg ? (
              <img
                src={asset.secure_url}
                className="max-h-[300px] w-auto shadow-2xl rounded-sm"
              />
            ) : (
              <div className="flex flex-col items-center gap-4 text-zinc-500">
                <Box size={48} />
                <span className="text-xs uppercase font-bold tracking-widest">
                  No Preview Available
                </span>
              </div>
            )}
          </div>

          {/* Primary Actions */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleCopy}
              className="flex items-center justify-center gap-2 rounded bg-white py-2 text-xs font-bold text-black hover:bg-zinc-200"
            >
              <Copy size={14} /> COPY URL
            </button>
            <a
              href={asset.secure_url}
              target="_blank"
              download // Force download behavior if possible
              className="flex items-center justify-center gap-2 rounded border border-zinc-700 bg-transparent py-2 text-xs font-bold text-white hover:bg-zinc-800"
            >
              <Maximize2 size={14} /> OPEN / DOWNLOAD
            </a>
          </div>

          {/* Data Table */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-bold uppercase text-zinc-600">
              File Metadata
            </h3>
            <div className="divide-y divide-zinc-800/50 border-t border-b border-zinc-800/50">
              <MetaRow
                icon={<HardDrive size={12} />}
                label="File Size"
                value={formatBytes(asset.bytes)}
              />
              <MetaRow
                icon={<FileImage size={12} />}
                label="Dimensions"
                value={asset.width ? `${asset.width} x ${asset.height}` : "N/A"}
              />
              <MetaRow
                icon={<LayoutGrid size={12} />}
                label="Format"
                value={asset.format?.toUpperCase() || "UNKNOWN"}
              />
              <MetaRow
                icon={<Calendar size={12} />}
                label="Created"
                value={formatDate(asset.created_at)}
              />
            </div>
          </div>

          {/* Technical Details */}
          <div className="space-y-2">
            <h3 className="text-[10px] font-bold uppercase text-zinc-600">
              System ID
            </h3>
            <code className="block w-full break-all rounded bg-zinc-900 p-3 text-[10px] text-zinc-400 font-mono">
              {asset.public_id}
            </code>
          </div>
        </div>

        {/* DELETE ZONE */}
        <div className="border-t border-zinc-800 p-4 bg-[#09090b]">
          <button
            onClick={handleDeleteClick}
            disabled={isDeleting}
            className="flex w-full items-center justify-center gap-2 rounded border border-red-900/50 bg-red-950/10 py-3 text-xs font-bold text-red-500 hover:bg-red-950/30 hover:border-red-800 transition-all disabled:opacity-50"
          >
            {isDeleting ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Trash2 size={14} />
            )}
            {isDeleting ? "TERMINATING..." : "DELETE PERMANENTLY"}
          </button>
        </div>
      </div>
    </div>
  );
}

function MetaRow({
  icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-2 text-zinc-500">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <span className="text-xs font-medium text-zinc-200">{value}</span>
    </div>
  );
}
