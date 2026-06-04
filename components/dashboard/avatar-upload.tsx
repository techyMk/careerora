"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Loader2, Trash2, Check } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";

/**
 * Center-crops + resizes an image to a square JPEG data URL.
 * Keeps server payload modest (~30-60KB at quality 0.85).
 */
async function fileToSquareJpeg(file: File, size = 256): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = reject;
    i.src = dataUrl;
  });

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No canvas context");

  const side = Math.min(img.naturalWidth, img.naturalHeight);
  const sx = (img.naturalWidth - side) / 2;
  const sy = (img.naturalHeight - side) / 2;
  ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);
  return canvas.toDataURL("image/jpeg", 0.85);
}

const MAX_INPUT_BYTES = 8 * 1024 * 1024; // 8 MB raw

export function AvatarUpload({
  src,
  name,
  email,
}: {
  src?: string | null;
  name?: string | null;
  email?: string | null;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const persist = async (value: string | null) => {
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ avatar: value }),
    });
    return res.ok;
  };

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-uploading the same file later
    if (!file) return;
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("Please pick an image file.");
      return;
    }
    if (file.size > MAX_INPUT_BYTES) {
      setError("Image is too large (max 8 MB before resizing).");
      return;
    }
    setUploading(true);
    try {
      const jpeg = await fileToSquareJpeg(file);
      if (jpeg.length > 200_000) {
        setError("Compressed image is still too large. Try a smaller picture.");
        return;
      }
      const ok = await persist(jpeg);
      if (!ok) {
        setError("Couldn't save. Please try again.");
        return;
      }
      setSavedAt(Date.now());
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("Couldn't read that file.");
    } finally {
      setUploading(false);
    }
  };

  const onRemove = async () => {
    if (!confirm("Remove your profile photo?")) return;
    setRemoving(true);
    try {
      const ok = await persist(null);
      if (ok) {
        setSavedAt(Date.now());
        router.refresh();
      }
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <Avatar src={src} name={name} email={email} size={72} />
        {uploading && (
          <div className="absolute inset-0 rounded-full bg-ink-950/70 flex items-center justify-center">
            <Loader2 className="size-5 animate-spin text-white" />
          </div>
        )}
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <button
            onClick={() => inputRef.current?.click()}
            disabled={uploading || removing}
            className="inline-flex items-center gap-1.5 text-xs px-3 h-8 rounded-full glass hover:bg-white/10 disabled:opacity-50"
          >
            <Camera className="size-3" />
            {src ? "Change photo" : "Upload photo"}
          </button>
          {src && (
            <button
              onClick={onRemove}
              disabled={uploading || removing}
              className="inline-flex items-center gap-1.5 text-xs px-3 h-8 rounded-full text-rose-300 bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 disabled:opacity-50"
            >
              {removing ? <Loader2 className="size-3 animate-spin" /> : <Trash2 className="size-3" />}
              Remove
            </button>
          )}
          {savedAt && Date.now() - savedAt < 2500 && (
            <span className="text-[11px] text-emerald-300 inline-flex items-center gap-1">
              <Check className="size-3" />
              Saved
            </span>
          )}
        </div>
        <p className="text-[11px] text-white/45">
          Square JPEG, auto-cropped to 256×256.
        </p>
        {error && (
          <p className="text-[11px] text-rose-300">{error}</p>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onPick}
      />
    </div>
  );
}
