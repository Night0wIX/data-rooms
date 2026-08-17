export const shareKeys = {
  all: ["shares"] as const,
  list: (resourceType: string, resourceId: string) =>
    [...shareKeys.all, "list", resourceType, resourceId] as const,
};
