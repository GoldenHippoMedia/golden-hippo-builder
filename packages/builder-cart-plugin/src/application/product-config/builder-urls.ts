// Deep link to a Builder.io content entry's native editor. The logged-in
// session resolves the space, so only the entry id is needed.
export const builderContentUrl = (entryId: string): string => `https://builder.io/content/${entryId}`;
