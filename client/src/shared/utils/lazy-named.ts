import { lazy, type ComponentType, type LazyExoticComponent } from "react";

export function lazyNamed<TProps extends object>(
  importFactory: () => Promise<Record<string, ComponentType<TProps>>>,
  exportName: string,
): LazyExoticComponent<ComponentType<TProps>> {
  return lazy(async () => {
    const namedExports = await importFactory();
    const component = namedExports[exportName];

    if (!component) {
      throw new Error(
        `lazyNamed: export "${exportName}" was not found in the loaded module`,
      );
    }

    return { default: component };
  });
}
