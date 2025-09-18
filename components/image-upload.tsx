"use client"

import { ImagePlus, Trash } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { PuffLoader } from "react-spinners";
import { Button } from "@/components/ui/button";

interface ImageUploadProps{
  disabled?: boolean,
  onChange : (value: string) => void;
  onRemove : (value: string) => void;
  value: string[];
}

const ImageUpload = ({disabled, onChange, onRemove, value}: ImageUploadProps) => {
  const [isMounted, setIsMounted] = useState(false)
  const [isLoading, setIsloading] = useState(false)
  const [progress, setProgress] = useState<number>(0)

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if(!isMounted) {
    return null;
  }

  const onUpload = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsloading(true);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload-avatar', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error || 'Upload failed');
      }

      const data = await res.json();
      onChange(data.url);
      setProgress(100);
    } catch (err: any) {
      toast.error(err?.message || 'Upload failed');
    } finally {
      setIsloading(false);
    }
  };

  const onDelete = (url : string) => {
    onRemove(url)
    toast.success("Image removed")
  };

  return (
    <div>
      {value && value.length > 0 ? (
        <>
          <div className="mb-4 flex items-center gap-4">
            {value.map(url => (
              <div className="relative w-52 h-52 rounded-md overflow-hidden" key={url}>
                <Image fill className="object-cover" alt="uploaded image" src={url}/>
                <div className="absolute z10 top-2 right-2">
                  <Button type="button" onClick={() => onDelete(url)} variant="destructive" size="icon">
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="w-52 h-52 rounded-md overflow-hidden border border-dashed border-gray-200 flex items-center justify-center flex-col gap-3">
          {isLoading ? (
            <>
              <PuffLoader size={30} color="#555"/>
              <p>{`${progress.toFixed(2)}%`}</p>
            </>
          ) : (
            <>
              <label>
                <div className="w-full h-full flex flex-col gap-2 items-center justify-center cursor-pointer">
                  <ImagePlus className="h-4 w-4"/>
                  <p>Upload Image</p>
                </div>
                <input type="file" onChange={onUpload} accept="image/*" className="w-0 h-0" />
              </label>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default ImageUpload;