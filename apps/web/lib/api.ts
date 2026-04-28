export type ProcessingMode = "fast" | "hd";

export async function removeImageBackground(
  file: File,
  mode: ProcessingMode,
): Promise<Blob> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("mode", mode);

  const response = await fetch("/api/remove-background", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    let message = "Background removal failed. Please try again.";

    try {
      const body = (await response.json()) as { detail?: string };
      if (body.detail) {
        message = body.detail;
      }
    } catch {
      // Keep the fallback message when the API returns a non-JSON error.
    }

    throw new Error(message);
  }

  return response.blob();
}
