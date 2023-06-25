export type TErrorJsonResponseDto = {
  error: string;
  error_description: string | null;
  error_uri: string | null;
  additional_errors: Array<any>;
};
