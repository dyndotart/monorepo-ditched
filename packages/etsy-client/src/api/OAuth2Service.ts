import axios, { AxiosInstance } from 'axios';
import crypto from 'crypto';
import { etsyConfig } from '../environment';
import {
  RefreshTokenExpiredException,
  RetrieveAccessTokenException,
} from '../exceptions';
import { logger } from '../logger';
import { TOAuth2Config } from '../types';
import { mapAxiosError } from '../utils';
import {
  TPost_OAuthToken_BodyDTO,
  TPost_OAuthToken_ResponseDTO,
} from './types';

export class OAuth2Service {
  private readonly _httpClient: AxiosInstance;

  public readonly _config: Omit<TOAuth2Config, 'refresh'>;

  private readonly _codeVerifiers: Record<string, string> = {};

  private _accessToken: string | null = null;
  private _accessTokenExpiresAt: number | null = null;
  private readonly _accessTokenBuffer = 60 * 5; // 5 min

  private _refreshToken: string | null = null; // 90 day life span
  private _refreshTokenExpiresAt: number | null = null;

  constructor(config: TOAuth2Config, httpClient: AxiosInstance = axios) {
    this._config = {
      clientId: config.clientId,
      redirectUrl: config.redirectUrl,
      scopes: config.scopes,
    };
    if (config.refresh != null) {
      const { refreshToken, expiresAt } = config.refresh;
      this._refreshToken = refreshToken;
      this._refreshTokenExpiresAt = expiresAt;
    }
    this._httpClient = httpClient;
  }

  public async getAccessToken(force = false): Promise<string> {
    if (
      this._accessToken != null &&
      this._accessTokenExpiresAt != null &&
      Date.now() < this._accessTokenExpiresAt &&
      !force
    ) {
      return this._accessToken;
    }

    // Check whether refresh token is expired
    if (
      this._refreshToken == null ||
      this._refreshTokenExpiresAt == null ||
      Date.now() > this._refreshTokenExpiresAt
    ) {
      throw new RefreshTokenExpiredException('#ERR_REFRESH_TOKEN_EXPIRED', {
        description:
          'Refresh Token expired and the access needs to be re-granted by manual authorization!',
      });
    }

    return this.retrieveAccessTokenByRefreshToken(this._refreshToken);
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
  ): Promise<string> {
    try {
      const codeVerifier = this._codeVerifiers[state];
      if (codeVerifier == null) {
        throw new RetrieveAccessTokenException(
          '#ERR_NO_MATCHING_CODE_VERIFIER',
          {
            description: `No matching code verifier found for state '${state}'!`,
          }
        );
      }

      // Prepare body
      const body: TPost_OAuthToken_BodyDTO = {
        grant_type: 'authorization_code',
        client_id: this._config.clientId,
        redirect_uri: this._config.redirectUrl,
        code,
        code_verifier: codeVerifier,
      };

      // Send request
      const response =
        await this._httpClient.post<TPost_OAuthToken_ResponseDTO>(
          etsyConfig.auth.tokenEndpoint,
          body
        );

      // Delete code verifier as the code can only be used once
      delete this._codeVerifiers[state];

      return this.handleRetrieveAccessTokenResponse(response.data);
    } catch (error) {
      throw mapAxiosError(error, RetrieveAccessTokenException);
    }
  }

  public async retrieveAccessTokenByRefreshToken(
    refreshToken: string
  ): Promise<string> {
    try {
      // Prepare body
      const body: TPost_OAuthToken_BodyDTO = {
        grant_type: 'refresh_token',
        client_id: this._config.clientId,
        refresh_token: refreshToken,
      };

      // Send request
      const response =
        await this._httpClient.post<TPost_OAuthToken_ResponseDTO>(
          etsyConfig.auth.tokenEndpoint,
          body
        );

      // Handle response
      return this.handleRetrieveAccessTokenResponse(response.data);
    } catch (error) {
      throw mapAxiosError(error, RetrieveAccessTokenException);
    }
  }

  private handleRetrieveAccessTokenResponse(
    data: TPost_OAuthToken_ResponseDTO
  ) {
    if (
      data.access_token == null ||
      data.expires_in == null ||
      data.refresh_token == null
    ) {
      throw new RetrieveAccessTokenException('#ERR_RETRIEVE_ACCESS_TOKEN', {
        description: `Invalid response DTO! Either 'access_token', 'expires_in' or 'refresh_token' is missing.`,
      });
    }

    // Update access token
    this._accessToken = data.access_token;
    this._accessTokenExpiresAt =
      Date.now() + (data.expires_in - this._accessTokenBuffer) * 1000;

    // Update refresh token
    if (data.refresh_token !== this._refreshToken) {
      this._refreshToken = data.refresh_token;
      this._refreshTokenExpiresAt = Date.now() + (90 - 5) * 24 * 60 * 60 * 1000; // 90 days - 5 days as puffer
    }

    logger.info(
      `Successfully retrieved new Etsy access token that expires at: ${new Date(
        this._accessTokenExpiresAt
      ).toLocaleTimeString()}`
    );

    return this._accessToken;
  }
}
