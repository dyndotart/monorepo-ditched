import S3 from '@pda/s3';
import s3Config from '../../../environment/config/s3.config';

export const s3 = new S3({
  bucket: s3Config.bucket,
  client: {
    forcePathStyle: false,
    endpoint: s3Config.endpoint,
    region: s3Config.region,
    credentials: {
      accessKeyId: s3Config.credentials.accessKeyId,
      secretAccessKey: s3Config.credentials.secretAccessKey,
    },
  },
});