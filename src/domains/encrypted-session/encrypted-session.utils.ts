import { nanoid } from "nanoid";

export function getUniqueId(existingMap: Record<string, string>) {
  let id;
  do {
    id = nanoid(6);
  } while (existingMap[id]);
  return id;
}
