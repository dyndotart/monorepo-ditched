/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 */

export interface paths {
  '/webfonts': {
    /** Retrieve the list of fonts */
    get: {
      parameters: {
        query: {
          /** @description Your developer API Key. */
          key: string;
          /** @description Name of a font family. */
          family?: string;
          /** @description Name of a font subset. */
          subset?: string;
          /** @description VF | WOFF2. */
          capability?: 'VF' | 'WOFF2';
          /** @description alpha | date | popularity | style | trending. */
          sort?: 'alpha' | 'date' | 'popularity' | 'style' | 'trending';
        };
      };
      responses: {
        /** @description A list of fonts */
        200: {
          content: {
            'application/json': {
              /** @description The kind of object, a webfont object. */
              kind?: string;
              items?: {
                /** @description The name of the family. */
                family?: string;
                /** @description A list of scripts supported by the family. */
                subsets?: string[];
                /** @description A url to the family subset covering only the name of the family. */
                menu?: string;
                /** @description The different styles available for the family. */
                variants?: string[];
                /** @description The font family version. */
                version?: string;
                /**
                 * Format: date
                 * @description The date (format "yyyy-MM-dd") the font family was modified for the last time.
                 */
                lastModified?: string;
                /** @description The font family files (with all supported scripts) for each one of the available variants. */
                files?: {
                  [key: string]: string | undefined;
                };
                /** @description Category of the font (ex: sans-serif, monospace). */
                category?: string;
                /** @description The kind of object, a webfont object. */
                kind?: string;
                axes?: {
                  /** @description Tag of the variable font axis. */
                  tag?: string;
                  /**
                   * Format: float
                   * @description Start of the range of the variable font axis.
                   */
                  start?: number;
                  /**
                   * Format: float
                   * @description End of the range of the variable font axis.
                   */
                  end?: number;
                }[];
              }[];
            };
          };
        };
      };
    };
  };
}

export type webhooks = Record<string, never>;

export type components = Record<string, never>;

export type external = Record<string, never>;

export type operations = Record<string, never>;
