export const exportDataToFile = (data: object, type: "encrypted" | "decrypted", fileName: string) => {
  let blob: Blob;
  let ext: string;

  if (type === "encrypted") {
    // Convert object to JSON first, then to Uint8Array for binary
    const jsonStr = JSON.stringify(data);
    const encoder = new TextEncoder();
    const uint8Array = encoder.encode(jsonStr);

    blob = new Blob([uint8Array], { type: "application/octet-stream" });
    ext = "enc";
  } else {
    // Decrypted export as readable JSON
    const dataStr = JSON.stringify(data, null, 2);
    blob = new Blob([dataStr], { type: "application/json" });
    ext = "json";
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${fileName}_${new Date().toISOString()}.${ext}`;
  link.click();
  URL.revokeObjectURL(url);
};
