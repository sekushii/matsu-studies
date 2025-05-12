import { useState } from "react";
import Image from "next/image";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Upload, Trash2 } from "lucide-react";

interface ImageUploadProps {
  id: string;
  value?: string | null;
  onChange: (value: string | null) => void;
  aspectRatio?: "square" | "video";
  maxSize?: number; // in MB
  className?: string;
  previewClassName?: string;
  uploadButtonText?: string;
  showRemoveButton?: boolean;
}

export function ImageUpload({
  id,
  value,
  onChange,
  aspectRatio = "square",
  maxSize = 2,
  className = "",
  previewClassName = "",
  uploadButtonText = "Upload an image",
  showRemoveButton = true,
}: ImageUploadProps) {
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset error state
    setError(null);

    // Check if file is an image
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }

    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`Image size should be less than ${maxSize}MB`);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      onChange(reader.result as string); // Ensure the image preview is updated
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    onChange(null);
  };

  const aspectRatioClass =
    aspectRatio === "square" ? "aspect-square" : "aspect-video";

  return (
    <div className={`space-y-2 ${className}`}>
      <div
        className={`relative overflow-hidden rounded-md border ${aspectRatioClass} ${previewClassName}`}
      >
        {value ? (
          <>
            <Image
              src={value}
              alt="Uploaded image preview"
              fill
              className="object-contain"
            />
            {showRemoveButton && (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute right-2 top-2 h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </>
        ) : (
          <Label
            htmlFor={id}
            className="flex h-full w-full cursor-pointer items-center justify-center"
          >
            <Upload
              className="h-8 w-8 text-muted-foreground"
              onClick={(e) => e.stopPropagation()}
            />
            <input
              id={id}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              onClick={(e) => e.stopPropagation()}
            />
          </Label>
        )}
      </div>
      {!value && (
        <div className="flex items-center gap-2">
          <Label
            htmlFor={id}
            className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed p-2 hover:bg-muted"
          >
            <Upload className="h-4 w-4" />
            <span>
              {uploadButtonText} (max {maxSize}MB)
            </span>
          </Label>
        </div>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
