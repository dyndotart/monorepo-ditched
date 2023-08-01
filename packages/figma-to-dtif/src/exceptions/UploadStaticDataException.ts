import { extractErrorData } from '../helpers';
import { NodeException } from './NodeException';

export class UploadStaticDataException extends NodeException {
  public readonly error?: Error;

  constructor(key: string, node: SceneNode, error?: any) {
    const errorData = extractErrorData(error);
    super(
      `Failed to upload node data at the key '${key}' by error: ${errorData.message}`,
      node
    );
    this.error = errorData.error ?? undefined;
  }
}
