/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 */


export interface paths {
  "/v1/auth/etsy/ping": {
    /**
     * Etsy ping 
     * @description Ping Etsy API.
     */
    get: operations["getPing"];
  };
  "/v1/auth/etsy/oauth/challenge": {
    /**
     * Get OAuth challenge 
     * @description Retrieve a PKCE Code Challenge.
     */
    get: operations["getOAuthChallenge"];
  };
  "/v1/auth/etsy/oauth/redirect": {
    /**
     * Handle OAuth redirect 
     * @description Handle the redirect from Etsy after user authorization, and retrieve the access token.
     */
    get: operations["handleOAuthRedirect"];
  };
  "/v1/media/pre-signed-upload-url": {
    /**
     * Get pre-signed upload URL 
     * @description Get a pre-signed URL for uploading files.
     */
    get: operations["getPreSignedUploadUrl"];
  };
  "/v1/media/pre-signed-download-url/{key}": {
    /**
     * Get pre-signed download URL 
     * @description Get a pre-signed URL for downloading files.
     */
    get: operations["getPreSignedDownloadUrl"];
  };
  "/v1/media/download-url/{key}": {
    /**
     * Get download URL 
     * @description Get URL for downloading files.
     */
    get: operations["getDownloadUrl"];
  };
  "/v1/media/font/source": {
    /**
     * Get Font file 
     * @description Get a specific font source file based on family, fontWeight, and style.
     */
    get: operations["getFontSource"];
  };
  "/v1/ping": {
    /**
     * API Ping 
     * @description Ping the API to check if it's working.
     */
    get: operations["getPingAPI"];
    /**
     * API Ping 
     * @description Ping the API to check if it's working.
     */
    post: operations["postPingAPI"];
  };
}

export type webhooks = Record<string, never>;

export interface components {
  schemas: {
    /**
     * @description Error Response 
     * @example {
     *   "error_code": "400",
     *   "error_description": "Bad Request",
     *   "error_uri": null,
     *   "additional_errors": []
     * }
     */
    ServerError: {
      /** @description Error code */
      error_code?: string;
      /** @description Error description */
      error_description?: string | null;
      /** @description Error URI */
      error_uri?: string | null;
      additional_errors?: (Record<string, never>)[];
    };
  };
  responses: {
    /** @description Bad Request */
    BadRequest: {
      content: {
        "application/json": components["schemas"]["ServerError"];
      };
    };
    /** @description Server Error */
    ServerError: {
      content: {
        "application/json": components["schemas"]["ServerError"];
      };
    };
    /** @description Not Found */
    NotFound: {
      content: {
        "application/json": components["schemas"]["ServerError"];
      };
    };
  };
  parameters: never;
  requestBodies: never;
  headers: never;
  pathItems: never;
}

export type external = Record<string, never>;

export interface operations {

  /**
   * Etsy ping 
   * @description Ping Etsy API.
   */
  getPing: {
    responses: {
      /** @description Success */
      200: {
        content: {
          "application/json": boolean;
        };
      };
    };
  };
  /**
   * Get OAuth challenge 
   * @description Retrieve a PKCE Code Challenge.
   */
  getOAuthChallenge: {
    responses: {
      /** @description Success */
      200: {
        content: {
          "application/json": {
            challenge: string;
          };
        };
      };
      500: components["responses"]["ServerError"];
    };
  };
  /**
   * Handle OAuth redirect 
   * @description Handle the redirect from Etsy after user authorization, and retrieve the access token.
   */
  handleOAuthRedirect: {
    parameters: {
      query?: {
        code?: string;
        state?: string;
        error?: string;
        error_description?: string;
      };
    };
    responses: {
      /** @description Success */
      200: {
        content: {
          "application/json": {
            access_token: string;
            refresh_token: string;
            refresh_token_expires_at: number;
          };
        };
      };
      400: components["responses"]["BadRequest"];
      500: components["responses"]["ServerError"];
    };
  };
  /**
   * Get pre-signed upload URL 
   * @description Get a pre-signed URL for uploading files.
   */
  getPreSignedUploadUrl: {
    parameters: {
      query?: {
        content_type?: string;
        key?: string;
        scope?: string;
        overwrite?: boolean;
      };
    };
    responses: {
      /** @description Success */
      200: {
        content: {
          "application/json": {
            upload_url: string;
            key: string;
          };
        };
      };
    };
  };
  /**
   * Get pre-signed download URL 
   * @description Get a pre-signed URL for downloading files.
   */
  getPreSignedDownloadUrl: {
    parameters: {
      path: {
        key: string;
      };
    };
    responses: {
      /** @description Success */
      200: {
        content: {
          "application/json": {
            download_url?: string;
            key?: string;
          };
        };
      };
      404: components["responses"]["NotFound"];
    };
  };
  /**
   * Get download URL 
   * @description Get URL for downloading files.
   */
  getDownloadUrl: {
    parameters: {
      path: {
        key: string;
      };
    };
    responses: {
      /** @description Success */
      200: {
        content: {
          "application/json": {
            download_url?: string;
            key?: string;
          };
        };
      };
      404: components["responses"]["NotFound"];
    };
  };
  /**
   * Get Font file 
   * @description Get a specific font source file based on family, fontWeight, and style.
   */
  getFontSource: {
    parameters: {
      query: {
        /** @description Name of the font family. */
        family: string;
        /** @description Name of the font weight. */
        font_weight?: number;
        /** @description Name of the font style. */
        style?: "italic" | "regular";
      };
    };
    responses: {
      /** @description Success */
      200: {
        content: {
          "application/octet-stream": string;
        };
      };
      404: components["responses"]["NotFound"];
    };
  };
  /**
   * API Ping 
   * @description Ping the API to check if it's working.
   */
  getPingAPI: {
    responses: {
      /** @description Success */
      200: {
        content: {
          "application/json": boolean;
        };
      };
    };
  };
  /**
   * API Ping 
   * @description Ping the API to check if it's working.
   */
  postPingAPI: {
    /** @description Request body */
    requestBody: {
      content: {
        /**
         * @example {
         *   "hello": "Jeff"
         * }
         */
        "application/json": {
          hello: string;
        };
      };
    };
    responses: {
      /** @description Success */
      200: {
        content: {
          "application/json": string;
        };
      };
    };
  };
}
