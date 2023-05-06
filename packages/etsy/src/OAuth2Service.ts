import axios, { AxiosInstance } from 'axios';
import crypto from 'crypto';
import { etsyConfig } from './environment';
import { TAuthResponseDto } from './types';

export class OAuth2Service {
  private readonly _httpClient: AxiosInstance;

  public readonly _config: Omit<TOAuth2Config, 'refresh'>;

  private readonly _codeVerifiers: Record<string, string> = {};

  private _accessToken: string | null = null;
  private _accessTokenExpiresAt = 0;
  private readonly _accessTokenPuffer = 60 * 5; // 5min

  private _refreshToken: string | null = null; // 90 day life span
  private _refreshTokenExpiresAt = 0;

  constructor(config: TOAuth2Config, httpClient: AxiosInstance = axios) {
    this._config = {
      clientId: config.clientId,
      redirectUrl: config.redirectUrl,
      scopes: config.scopes,
    };
    if (config.refresh != null) {
      this._refreshToken = config.refresh.refreshToken;
      this._refreshTokenExpiresAt = config.refresh.expiresAt;
    }
    this._httpClient = httpClient;
  }

  public async getAccessToken(force = false): Promise<string | null> {
    if (
      this._accessToken != null &&
      Date.now() < this._accessTokenExpiresAt &&
      !force
    ) {
      return this._accessToken;
    }

    if (
      this._refreshToken != null &&
      Date.now() < this._refreshTokenExpiresAt
    ) {
      return this.retrieveAccessTokenByRefreshToken(this._refreshToken);
    } else {
      console.error(
        'Refresh Token expired and the access needs to be regranted via manual authorization!'
      );
    }

    return null;
  }

  public getRefreshTokenInfo() {
    return {
      refreshToken: this._refreshToken,
      expiresAt: this._refreshTokenExpiresAt,
    };
  }

  // https://developers.etsy.com/documentation/tutorials/quickstart#generate-the-pkce-code-challenge
  public generatePKCECodeChallengeUri(): string {
    // Helper functions to generate the code challenge required by Etsy’s OAuth implementation
    const base64URLEncode = (buffer: Buffer): string =>
      buffer
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
    const sha256 = (value: string): Buffer =>
      crypto.createHash('sha256').update(value).digest();

    // Generate verifier to base the code challenge on
    const codeVerifier = base64URLEncode(crypto.randomBytes(32));

    // Generate the values needed for OAuth authorization grant
    const codeChallenge = base64URLEncode(sha256(codeVerifier));
    const state = Math.random().toString(36).substring(7);

    // Save verifier for a future step in the OAuth flow
    this._codeVerifiers[state] = codeVerifier;

    // Build URI
    return `${etsyConfig.auth.challengeEndpoint}
    ?response_type=code
    &redirect_uri=${this._config.redirectUrl}
    &scope=${this._config.scopes.join('%20')}
    &client_id=${this._config.clientId}
    &state=${state}
    &code_challenge=${codeChallenge}
    &code_challenge_method=S256`
      .replace(/\s+/g, '')
      .trim();
  }

  public async retrieveAccessTokenByAuthorizationCode(
    code: string,
    state: string
  ): Promise<string | null> {
    try {
      const codeVerifier = this._codeVerifiers[state];
      if (codeVerifier == null) {
        console.error('No matching code verifier found!');
        return null;
      }

      // Prepare body
      const body = {
        grant_type: 'authorization_code',
        client_id: this._config.clientId,
        redirect_uri: this._config.redirectUrl,
        code,
        code_verifier: codeVerifier,
      };

      // Send request
      const response = await this._httpClient.post<TAuthResponseDto>(
        etsyConfig.auth.tokenEndpoint,
        body
      );

      // Delete code verifier as the code can only be used once
      delete this._codeVerifiers[state];

      return this.handleRetrieveAccessTokenResponse(response.data);
    } catch (error) {
      console.error(error);
    }
    return null;
  }

  public async retrieveAccessTokenByRefreshToken(
    refreshToken: string
  ): Promise<string | null> {
    try {
      // Prepare body
      const body = {
        grant_type: 'refresh_token',
        client_id: this._config.clientId,
        refresh_token: refreshToken,
      };

      // Send request
      const response = await this._httpClient.post<TAuthResponseDto>(
        etsyConfig.auth.tokenEndpoint,
        body
      );

      return this.handleRetrieveAccessTokenResponse(response.data);
    } catch (error) {
      console.error(error);
    }
    return null;
  }

  private handleRetrieveAccessTokenResponse(data: TAuthResponseDto) {
    if (
      data.access_token == null ||
      data.expires_in == null ||
      data.refresh_token == null
    )
      return null;

    this._accessToken = data.access_token;
    this._accessTokenExpiresAt =
      Date.now() + (data.expires_in - this._accessTokenPuffer) * 1000;

    if (data.refresh_token !== this._refreshToken) {
      this._refreshToken = data.refresh_token;
      this._refreshTokenExpiresAt = Date.now() + (90 - 5) * 24 * 60 * 60 * 1000; // 90 days - 5 days as puffer
    }

    console.log(
      `Successfully retrieved new Etsy Access Token that will expire at ${new Date(
        this._accessTokenExpiresAt
      ).toLocaleTimeString()}`
    );

    return this._accessToken;
  }
}

type TOAuth2Config = {
  clientId: string;
  redirectUrl: string;
  scopes: string[];
  refresh?: {
    refreshToken: string;
    expiresAt: number;
  };
};
