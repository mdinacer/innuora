import { nanoid } from "nanoid";

export interface SessionIdMaps {
  publicIdMap: Record<string, string>;   // publicId => sessionId
  sessionIdMap: Record<string, string>;  // sessionId => publicId (reverse lookup)
}

export function getUniquePublicId(existingPublicIds: Set<string>): string {
  let id;
  do {
    id = nanoid(6);
  } while (existingPublicIds.has(id));
  return id;
}

export function addSessionToMaps(
  maps: SessionIdMaps, 
  sessionId: string, 
  publicId?: string
): { maps: SessionIdMaps; publicId: string } {
  const finalPublicId = publicId || getUniquePublicId(new Set(Object.keys(maps.publicIdMap)));
  
  return {
    maps: {
      publicIdMap: {
        ...maps.publicIdMap,
        [finalPublicId]: sessionId,
      },
      sessionIdMap: {
        ...maps.sessionIdMap,
        [sessionId]: finalPublicId,
      },
    },
    publicId: finalPublicId,
  };
}

export function removeSessionFromMaps(maps: SessionIdMaps, sessionId: string): SessionIdMaps {
  const publicId = maps.sessionIdMap[sessionId];
  
  if (!publicId) return maps;
  
  const { [publicId]: _, ...restPublicIdMap } = maps.publicIdMap;
  const { [sessionId]: __, ...restSessionIdMap } = maps.sessionIdMap;
  
  return {
    publicIdMap: restPublicIdMap,
    sessionIdMap: restSessionIdMap,
  };
}

export function getPublicId(maps: SessionIdMaps, sessionId: string): string | undefined {
  return maps.sessionIdMap[sessionId];
}

export function getSessionId(maps: SessionIdMaps, publicId: string): string | undefined {
  return maps.publicIdMap[publicId];
}