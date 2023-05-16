import express from 'express';
import { etsyClient } from '../../../../core/services';
import { AppError } from '../../../../middlewares';

export async function getPing(req: express.Request, res: express.Response) {
  const success = await etsyClient.ping();
  res.send(success);
}

export async function getOAuthChallenge(
  req: express.Request,
  res: express.Response
) {
  const success = await etsyClient.ping();
  if (!success) {
    throw new AppError(
      500,
      'Failed to communicate with Etsy API! Either Etsy can not be reached or the App Credentials are not valid!'
    );
  }
  const challenge = etsyClient.authService.generatePKCECodeChallengeUri();
  res.send(challenge);
}

export async function handleOAuthRedirect(
  req: express.Request,
  res: express.Response
) {
  const { code, state, error, error_description } = req.query;

  // Handle error response
  if (error != null && error_description != null) {
    res.send({
      error,
      error_description,
    });
    return;
  }

  // Validate query parameters
  if (typeof code !== 'string' || typeof state !== 'string') {
    throw new AppError(500, 'Invalid query parameters provided!');
  }

  // Token exchange
  const accessToken =
    await etsyClient.authService.retrieveAccessTokenByAuthorizationCode(
      code,
      state
    );
  const refreshTokenInfo = etsyClient.authService.getRefreshTokenInfo();

  res.send({
    accessToken,
    refreshToken: refreshTokenInfo.refreshToken,
    refreshTokenExpiresAt: refreshTokenInfo.expiresAt,
  });
}
