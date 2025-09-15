import z from "zod";

export type EncryptedData = {
  encryptedData: Uint8Array<ArrayBufferLike>; // Uint8Array converted to array
  iv: Uint8Array<ArrayBufferLike>;
  authTag: Uint8Array<ArrayBufferLike>;
  encAlg: string;
};

// Used for data transfer to server (Uint8Array  => array)
export type EncryptedDataPayload = {
  encryptedData: number[];
  iv: number[];
  authTag: number[];
  encAlg: string;
};

export const encryptedDataToPayload = (result: EncryptedData): EncryptedDataPayload => ({
  encryptedData: Array.from(result.encryptedData),
  iv: Array.from(result.iv),
  authTag: Array.from(result.authTag).slice(0, 16),
  encAlg: result.encAlg,
});

export const EncryptedDataSchema = z.object({
  encryptedData: z.instanceof(Uint8Array<ArrayBufferLike>),
  iv: z.instanceof(Uint8Array<ArrayBufferLike>),
  authTag: z.instanceof(Uint8Array<ArrayBufferLike>),
  encAlg: z.string(),
});
