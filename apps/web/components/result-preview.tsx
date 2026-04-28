import Image from "next/image";
import type { ReactNode } from "react";

type ResultPreviewProps = {
  label: string;
  src: string | null;
  checkerboard?: boolean;
  backgroundColor?: string;
  isProcessing?: boolean;
  processingLabel?: string;
  actions?: ReactNode;
};

export function ResultPreview({
  label,
  src,
  checkerboard = false,
  backgroundColor,
  isProcessing = false,
  processingLabel = "Processing image",
  actions,
}: ResultPreviewProps) {
  return (
    <section className="flex min-h-[320px] flex-col rounded-lg border border-line bg-white shadow-soft">
      <div className="flex min-h-14 items-center justify-between gap-3 border-b border-line px-4 py-3">
        <h2 className="text-sm font-semibold">{label}</h2>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>
      <div
        className={`relative flex flex-1 items-center justify-center overflow-hidden rounded-b-lg p-4 ${
          checkerboard ? "checkerboard" : "bg-panel"
        }`}
        style={backgroundColor ? { backgroundColor } : undefined}
      >
        {src ? (
          <>
            <Image
              src={src}
              alt={label}
              fill
              className={`object-contain p-4 transition duration-500 ${
                isProcessing ? "scale-[1.01] opacity-80" : "scale-100 opacity-100"
              }`}
              unoptimized
            />
            {isProcessing ? (
              <div className="pointer-events-none absolute inset-0">
                <div className="scan-line" />
                <div className="absolute inset-x-6 bottom-5 rounded-md border border-white/70 bg-white/90 px-3 py-2 text-xs font-semibold text-ink shadow-soft backdrop-blur">
                  {processingLabel}
                </div>
              </div>
            ) : null}
          </>
        ) : (
          <div className="relative flex min-h-[220px] w-full items-center justify-center">
            {isProcessing ? (
              <div className="processing-orb" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
            ) : null}
            <div className="text-center text-sm text-gray-500">
              {isProcessing ? processingLabel : "Preview appears here"}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
