import {
  OpenAPIFetchClient,
  ServiceException,
  isStatusCode,
} from '@dyn/openapi-fetch';
import { paths } from '../gen/v3';
import { logger } from '../logger';

export class EtsyService {
  public readonly etsyClient: OpenAPIFetchClient<paths>;

  private _userId: number;
  private _shopId: number;

  constructor(etsyClient: OpenAPIFetchClient<paths>) {
    this.etsyClient = etsyClient;
  }

  public async ping() {
    const response = await this.etsyClient.get('/v3/application/openapi-ping', {
      middlewareProps: { noAuth: true },
    });
    if (response.isError) {
      logger.error(response.error.message);
      return false;
    } else {
      return true;
    }
  }

  public async getMe(
    force = true
  ): Promise<{ shop_id: number; user_id: number } | null> {
    // If user isn't cached fetch it from Etsy API
    if (this._userId == null || this._shopId == null || force) {
      const response = await this.etsyClient.get(
        '/v3/application/users/me',
        {}
      );
      if (response.isError && isStatusCode(response.error, 404)) {
        return null;
      } else if (response.isError) {
        logger.error(response.error.message);
        throw response.error;
      } else {
        this._userId = response.data.user_id as number;
        this._shopId = response.data.shop_id as number;
      }
    }

    return {
      user_id: this._userId,
      shop_id: this._shopId,
    };
  }

  public async getShopReceipts(
    options: paths['/v3/application/shops/{shop_id}/receipts']['get']['parameters']['query'] = {}
  ) {
    // Retrieve me
    const me = await this.getMe();
    if (me == null) {
      throw new ServiceException('#ERR_GET_ME', {
        description: 'Failed to retrieve me object!',
      });
    }

    // Send request
    const response = await this.etsyClient.get(
      '/v3/application/shops/{shop_id}/receipts',
      {
        pathParams: {
          shop_id: me.shop_id,
        },
        queryParams: options,
      }
    );

    // Handle request response
    if (response.isError && isStatusCode(response.error, 404)) {
      return null;
    } else if (response.isError) {
      logger.error(response.error.message);
      throw response.error;
    } else {
      return response.data;
    }
  }
}
