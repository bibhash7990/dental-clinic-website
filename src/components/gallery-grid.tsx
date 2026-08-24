"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";

const galleryItems = [
  { src: "/images/hero-bg.jpg", caption: "Gentle care in every appointment" },
  { src: "/images/welcome.jpg", caption: "Our light-filled reception" },
  { src: "/images/services/smile-design.jpg", caption: "Digital smile design session" },
  { src: "/images/services/whitening.jpg", caption: "Professional whitening results" },
  { src: "/images/services/aligners.jpg", caption: "Clear aligner fitting" },
  { src: "/images/services/implants.jpg", caption: "Implant restoration" },
  { src: "/images/services/checkup.jpg", caption: "Routine check-up" },
  { src: "/images/services/pediatric.jpg", caption: "Our youngest patients" },
  { src: "/images/services/cbct.jpg", caption: "3D CBCT imaging suite" },
  { src: "/images/services/braces.jpg", caption: "Orthodontic adjustment" },
  { src: "/images/services/crowns.jpg", caption: "Same-day ceramic crowns" },
  { src: "/images/services/cosmetic.jpg", caption: "Cosmetic consultation" },
];

export function GalleryGrid() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenIndex(null);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [openIndex]);

  return (
    <>
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {galleryItems.map((item, i) => (
          <li key={item.src}>
            <button
              type="button"
              onClick={() => setOpenIndex(i)}
              className="group relative block w-full cursor-pointer overflow-hidden rounded-2xl focus-visible:outline-2 focus-visible:outline-ring"
              aria-label={`View larger: ${item.caption}`}
            >
              <div className="relative aspect-[4/3]">
                <Image
                  src={item.src}
                  alt={item.caption}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 pb-3 pt-10 text-left text-sm font-medium text-white">
                {item.caption}
              </span>
            </button>
          </li>
        ))}
      </ul>

      {openIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={galleryItems[openIndex].caption}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setOpenIndex(null)}
        >
          <div
            className="relative w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
              <Image
                src={galleryItems[openIndex].src}
                alt={galleryItems[openIndex].caption}
                fill
                sizes="(max-width: 1024px) 100vw, 896px"
                className="object-cover"
              />
            </div>
            <p className="mt-3 text-center text-sm text-white">
              {galleryItems[openIndex].caption}
            </p>
            <button
              type="button"
              onClick={() => setOpenIndex(null)}
              autoFocus
              className="absolute -top-3 -right-3 inline-flex size-11 cursor-pointer items-center justify-center rounded-full bg-background text-foreground shadow-lg focus-visible:outline-2 focus-visible:outline-ring"
              aria-label="Close image viewer"
            >
              <X className="size-5" aria-hidden />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
