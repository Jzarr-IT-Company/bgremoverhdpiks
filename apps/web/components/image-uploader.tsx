"use client";

import { ChangeEvent, DragEvent, useEffect, useRef, useState } from "react";
import {
  Download,
  ImagePlus,
  Loader2,
  Plus,
  Minimize2,
  Sparkles,
  UploadCloud,
  Wand2,
} from "lucide-react";

import { ProcessingMode, removeImageBackground } from "@/lib/api";
import { validateImageFile } from "@/lib/validation";
import { ResultPreview } from "@/components/result-preview";

type ResultBackground = "transparent" | "white" | "black" | "gray" | "custom";
type ToastTone = "info" | "success" | "error";
type Toast = {
  id: number;
  tone: ToastTone;
  message: string;
};
type HistoryItem = {
  id: string;
  file: File;
  originalUrl: string;
  resultUrl: string | null;
  resultBlob: Blob | null;
  mode: ProcessingMode;
  status: "processing" | "ready" | "error";
};

const RESULT_BACKGROUNDS: Array<{
  id: ResultBackground;
  label: string;
  value: string | null;
}> = [
  { id: "transparent", label: "Transparent", value: null },
  { id: "white", label: "White", value: "#ffffff" },
  { id: "black", label: "Black", value: "#111827" },
  { id: "gray", label: "Gray", value: "#f3f4f6" },
  { id: "custom", label: "Custom", value: null },
];

export function ImageUploader() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusText, setStatusText] = useState("Waiting for image");
  const [processingMode, setProcessingMode] = useState<ProcessingMode>("fast");
  const [resultBackground, setResultBackground] =
    useState<ResultBackground>("transparent");
  const [customBackground, setCustomBackground] = useState("#e0f2fe");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const requestIdRef = useRef(0);
  const toastIdRef = useRef(0);
  const objectUrlsRef = useRef<string[]>([]);

  const selectedBackground =
    resultBackground === "custom"
      ? customBackground
      : RESULT_BACKGROUNDS.find((item) => item.id === resultBackground)?.value;

  useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  useEffect(() => {
    if (!isProcessing) return;

    const timers = [
      window.setTimeout(() => setStatusText("Loading AI cutout model"), 6000),
      window.setTimeout(
        () =>
          setStatusText(
            processingMode === "hd"
              ? "Refining HD transparent edges"
              : "Preparing transparent edges",
          ),
        14000,
      ),
      window.setTimeout(
        () => setStatusText("First run can take longer while the model warms up"),
        26000,
      ),
    ];

    return () => {
      timers.forEach(window.clearTimeout);
    };
  }, [isProcessing, processingMode]);

  function resetWorkspace() {
    requestIdRef.current += 1;
    setSelectedFile(null);
    setOriginalUrl(null);
    setResultUrl(null);
    setResultBlob(null);
    setActiveItemId(null);
    setError(null);
    setStatusText("Waiting for image");
    setIsProcessing(false);
  }

  function notify(message: string, tone: ToastTone = "info") {
    const id = toastIdRef.current + 1;
    toastIdRef.current = id;
    setToasts((current) => [...current.slice(-2), { id, tone, message }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 4200);
  }

  function trackObjectUrl(url: string) {
    objectUrlsRef.current.push(url);
    return url;
  }

  function resetResult(itemId = activeItemId) {
    setResultUrl(null);
    setResultBlob(null);
    if (itemId) {
      setHistoryItems((current) =>
        current.map((item) =>
          item.id === itemId
            ? { ...item, resultUrl: null, resultBlob: null, status: "processing" }
            : item,
        ),
      );
    }
  }

  function selectFile(file: File) {
    const validationError = validateImageFile(file);

    if (validationError) {
      setError(validationError);
      setStatusText("Upload needs attention");
      notify(validationError, "error");
      return;
    }

    const id = crypto.randomUUID();
    const newOriginalUrl = trackObjectUrl(URL.createObjectURL(file));

    resetResult(id);
    setError(null);
    setSelectedFile(file);
    setOriginalUrl(newOriginalUrl);
    setActiveItemId(id);
    setHistoryItems((current) => [
      {
        id,
        file,
        originalUrl: newOriginalUrl,
        resultUrl: null,
        resultBlob: null,
        mode: processingMode,
        status: "processing",
      },
      ...current,
    ]);
    notify("Fast mode started. This creates a quick transparent PNG.", "info");
    void processImage(file, processingMode, id);
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) selectFile(file);
    event.target.value = "";
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];
    if (file) selectFile(file);
  }

  async function processImage(
    fileToProcess = selectedFile,
    modeToUse = processingMode,
    itemId = activeItemId,
  ) {
    if (!fileToProcess) {
      setError("Please choose an image first.");
      return;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setIsProcessing(true);
    setError(null);
    setStatusText(
      modeToUse === "hd" ? "Analyzing image in HD mode" : "Analyzing subject edges",
    );
    resetResult(itemId);

    try {
      const resultBlob = await removeImageBackground(fileToProcess, modeToUse);
      if (requestId !== requestIdRef.current) return;
      const newResultUrl = trackObjectUrl(URL.createObjectURL(resultBlob));
      setStatusText("Transparent PNG ready");
      setHistoryItems((current) =>
        current.map((item) =>
          item.id === itemId
            ? {
                ...item,
                resultBlob,
                resultUrl: newResultUrl,
                mode: modeToUse,
                status: "ready",
              }
            : item,
        ),
      );
      setResultBlob(resultBlob);
      setResultUrl(newResultUrl);
      notify(
        modeToUse === "hd"  
          ? "HD background removal complete. Edges were refined for quality."
          : "Background removed in Fast mode. Transparent PNG is ready.",
        "success",
      );
    } catch (caughtError) {
      if (requestId !== requestIdRef.current) return;
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Background removal failed. Please try again.";
      setError(message);
      setStatusText("Processing failed");
      if (itemId) {
        setHistoryItems((current) =>
          current.map((item) =>
            item.id === itemId ? { ...item, status: "error" } : item,
          ),
        );
      }
      notify(message, "error");
    } finally {
      if (requestId === requestIdRef.current) {
        setIsProcessing(false);
      }
    }
  }

  function downloadResult() {
    if (!resultUrl) return;

    const link = document.createElement("a");
    const originalName = selectedFile?.name.replace(/\.[^.]+$/, "") || "image";
    link.href = resultUrl;
    link.download = `${originalName}-bg-removed.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    notify("Transparent PNG download started.", "success");
  }

  function retryMode(mode: ProcessingMode) {
    setProcessingMode(mode);
    if (selectedFile) {
      notify(
        mode === "hd"
          ? "HD mode started. This can take longer on CPU."
          : "Fast mode started.",
        "info",
      );
      void processImage(selectedFile, mode, activeItemId);
    }
  }

  function activateHistoryItem(item: HistoryItem) {
    if (isProcessing) return;
    setActiveItemId(item.id);
    setSelectedFile(item.file);
    setOriginalUrl(item.originalUrl);
    setResultUrl(item.resultUrl);
    setResultBlob(item.resultBlob);
    setProcessingMode(item.mode);
    setError(null);
    setStatusText(
      item.status === "ready"
        ? "Transparent PNG ready"
        : item.status === "error"
          ? "Processing failed"
          : "Processing image",
    );
  }

  async function compressResult() {
    if (!resultUrl || !resultBlob) {
      notify("Remove the background first, then compress the result.", "error");
      return;
    }

    try {
      const image = new Image();
      image.crossOrigin = "anonymous";
      const loaded = new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error("Could not load result for compression."));
      });
      image.src = resultUrl;
      await loaded;

      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error("Compression is not available in this browser.");
      }

      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0);

      const compressedBlob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error("Could not create compressed WebP."));
          },
          "image/webp",
          0.86,
        );
      });

      if (compressedBlob.size >= resultBlob.size) {
        notify(
          `Already optimized. PNG is ${formatBytes(
            resultBlob.size,
          )}; WebP would be ${formatBytes(compressedBlob.size)}.`,
          "info",
        );
        return;
      }

      const compressedUrl = URL.createObjectURL(compressedBlob);
      const link = document.createElement("a");
      const originalName = selectedFile?.name.replace(/\.[^.]+$/, "") || "image";
      link.href = compressedUrl;
      link.download = `${originalName}-bg-removed-compressed.webp`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(compressedUrl);

      notify(
        `Compressed from ${formatBytes(resultBlob.size)} to ${formatBytes(
          compressedBlob.size,
        )}. WebP download started.`,
        "success",
      );
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Compression failed. Please try again.";
      notify(message, "error");
    }
  }

  function formatBytes(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
      <div className="fixed right-4 top-20 z-50 flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`rounded-lg border px-4 py-3 text-sm font-medium shadow-soft ${
              toast.tone === "success"
                ? "border-green-200 bg-green-50 text-green-800"
                : toast.tone === "error"
                  ? "border-red-200 bg-red-50 text-red-700"
                  : "border-line bg-white text-ink"
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>

      <section className="rounded-lg border border-line bg-white p-4 shadow-soft">
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          className="hidden"
          onChange={handleInputChange}
        />

        <div
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`flex min-h-[260px] flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center transition ${
            isDragging
              ? "border-mint bg-green-50"
              : isProcessing
                ? "border-mint bg-green-50"
                : "border-line bg-panel hover:border-mint"
          }`}
        >
          <div className="relative mb-4 flex size-12 items-center justify-center rounded-full bg-white shadow-sm">
            {isProcessing ? (
              <span className="absolute inset-0 rounded-full border-2 border-mint/30 animate-ping" />
            ) : null}
            <UploadCloud className="size-6 text-mint" aria-hidden="true" />
          </div>
          <h2 className="text-lg font-semibold">
            {isProcessing ? "Removing background" : "Upload image"}
          </h2>
          <p className="mt-2 max-w-xs text-sm leading-6 text-gray-600">
            {isProcessing
              ? "Your image is being processed automatically."
              : "Drag and drop an image here, or choose a file from your device."}
          </p>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isProcessing}
            className="mt-5 inline-flex h-11 items-center gap-2 rounded-md bg-ink px-4 text-sm font-semibold text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-ink focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {isProcessing ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <ImagePlus className="size-4" aria-hidden="true" />
            )}
            {isProcessing ? "Processing" : "Choose file"}
          </button>
        </div>

        {error ? (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="mt-4 flex items-center justify-center">
          <div className="flex max-w-full items-center gap-3 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={isProcessing}
              className="inline-flex size-14 shrink-0 items-center justify-center rounded-lg border border-line bg-panel text-ink transition hover:bg-white disabled:cursor-not-allowed disabled:text-gray-400"
              aria-label="Upload another image"
              title="Upload another image"
            >
              <Plus className="size-5" aria-hidden="true" />
            </button>

            {historyItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => activateHistoryItem(item)}
                disabled={isProcessing}
                className={`relative size-14 shrink-0 overflow-hidden rounded-lg border-2 bg-panel transition ${
                  activeItemId === item.id
                    ? "border-blue-500 shadow-soft"
                    : "border-transparent hover:border-line"
                } disabled:cursor-not-allowed`}
                aria-label={`Open ${item.file.name}`}
                title={item.file.name}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.originalUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
                {item.status === "processing" ? (
                  <span className="absolute inset-0 grid place-items-center bg-white/70">
                    <Loader2 className="size-4 animate-spin text-mint" />
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </div>

      </section>

      <section className="rounded-lg border border-line bg-white p-4 shadow-soft">
        <div className="mb-4 flex flex-col gap-3 border-b border-line pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold">Result editor</h2>
            <p className="mt-1 text-sm text-gray-500">
              Preview the cutout, retry quality modes, and export PNG.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={compressResult}
              disabled={!resultUrl || isProcessing}
              className="inline-flex h-10 items-center gap-2 rounded-md border border-line bg-white px-3 text-sm font-semibold transition hover:bg-panel disabled:cursor-not-allowed disabled:text-gray-400"
            >
              <Minimize2 className="size-4" aria-hidden="true" />
              Compress
            </button>
            <button
              type="button"
              onClick={() => retryMode("hd")}
              disabled={!selectedFile || isProcessing}
              className="inline-flex h-10 items-center gap-2 rounded-md bg-ink px-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              <Sparkles className="size-4" aria-hidden="true" />
              Try HD
            </button>
            <button
              type="button"
              onClick={downloadResult}
              disabled={!resultUrl}
              className="inline-flex h-10 items-center gap-2 rounded-md bg-mint px-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              <Download className="size-4" aria-hidden="true" />
              Download
            </button>
          </div>
        </div>

        <div className="mb-4 rounded-lg border border-line bg-panel p-3">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold">Background</div>
              <div className="text-xs text-gray-500">Preview background only</div>
            </div>
            {resultBackground === "custom" ? (
              <input
                type="color"
                value={customBackground}
                onChange={(event) => setCustomBackground(event.target.value)}
                className="h-9 w-12 cursor-pointer rounded-md border border-line bg-white p-1"
                aria-label="Custom result background"
              />
            ) : null}
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {RESULT_BACKGROUNDS.map((background) => {
              const isSelected = resultBackground === background.id;
              const swatchColor =
                background.id === "custom" ? customBackground : background.value;

              return (
                <button
                  key={background.id}
                  type="button"
                  onClick={() => setResultBackground(background.id)}
                  className={`flex h-10 items-center justify-center gap-2 rounded-md border px-2 text-xs font-semibold transition ${
                    isSelected
                      ? "border-ink bg-white text-ink"
                      : "border-line bg-white text-gray-600 hover:border-gray-400"
                  }`}
                >
                  <span
                    className={`size-4 rounded border border-line ${
                      background.id === "transparent" ? "checkerboard" : ""
                    }`}
                    style={swatchColor ? { backgroundColor: swatchColor } : undefined}
                    aria-hidden="true"
                  />
                  {background.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <ResultPreview
            label="Original"
            src={originalUrl}
            isProcessing={isProcessing}
            processingLabel="Scanning subject"
          />
          <ResultPreview
            label="Transparent result"
            src={resultUrl}
            checkerboard={resultBackground === "transparent"}
            backgroundColor={selectedBackground || undefined}
            isProcessing={isProcessing && !resultUrl}
            processingLabel="Building transparent cutout"
            actions={
              resultUrl ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-xs font-semibold text-mint">
                  <Wand2 className="size-3" aria-hidden="true" />
                  Ready
                </span>
              ) : null
            }
          />
        </div>
      </section>
    </div>
  );
}
