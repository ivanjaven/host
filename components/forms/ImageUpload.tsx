// components/forms/ImageUpload.tsx
import Image from "next/image";

interface ImageUploadProps {
  label: string;
  required?: boolean;
  multiple?: boolean;
  preview?: string;
  nextImage?: boolean;
  onChange: (files: FileList | null) => void;
}

export function ImageUpload({
  label,
  required,
  multiple,
  preview,
  nextImage,
  onChange,
}: ImageUploadProps) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type="file"
        accept="image/*"
        required={required}
        multiple={multiple}
        onChange={(e) => onChange(e.target.files)}
        className="w-full px-3 py-2 text-xs text-gray-900 font-medium bg-white border border-gray-200 rounded-lg
          focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary
          file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0
          file:text-xs file:font-medium file:bg-primary file:text-white
          hover:file:bg-primary/90"
      />
      {preview && nextImage && (
        <div className="mt-3 relative aspect-square w-full">
          <Image
            src={preview}
            alt="Preview"
            fill
            className="rounded-lg object-cover"
          />
        </div>
      )}
      {preview && !nextImage && (
        <div className="mt-3">
          <Image
            src={preview}
            alt="Preview"
            className="w-full h-auto rounded-lg"
          />
        </div>
      )}
    </div>
  );
}
