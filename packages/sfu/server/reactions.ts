import { extname } from "path";
import { allowedAssetExtensions } from "./constants.js";

export const isValidReactionAssetPath = (value: string): boolean => {
  if (!value.startsWith("/reactions/") || value.includes("..")) {
    return false;
  }

  let decoded = value;
  try {
    decoded = decodeURIComponent(value);
  } catch (_error) {
    return false;
  }

  const extension = extname(decoded).toLowerCase();
  return allowedAssetExtensions.has(extension);
};
