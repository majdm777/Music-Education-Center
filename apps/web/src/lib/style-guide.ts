export interface StyleGuideEnv {
  NODE_ENV?: string;
  STYLE_GUIDE_ENABLED?: string;
}

/**
 * Reports whether the development-only style guide is served. Local
 * development always has it; every other environment must opt in explicitly
 * with `STYLE_GUIDE_ENABLED=true`, so a production build never serves the
 * catalogue by accident.
 */
export function isStyleGuideEnabled(env: StyleGuideEnv): boolean {
  return env.NODE_ENV === 'development' || env.STYLE_GUIDE_ENABLED === 'true';
}
