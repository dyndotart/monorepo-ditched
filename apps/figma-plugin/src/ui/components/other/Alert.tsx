import clsx from 'clsx';
import React from 'react';

const Alert: React.FC<TProps> = (props) => {
  const { type, message } = props;

  return (
    <div className=" absolute bottom-4 left-0 right-0 z-50 mx-auto px-4">
      <div
        className={clsx('alert ', {
          'alert-warning': type === EAlertTypes.WARNING,
          'alert-info': type === EAlertTypes.INFO,
          'alert-success': type === EAlertTypes.SUCCESS,
        })}
      >
        {/* Icon */}
        {type === EAlertTypes.WARNING && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 shrink-0 stroke-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        )}
        {type === EAlertTypes.INFO && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="h-6 w-6 shrink-0 stroke-current"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
        )}
        {type === EAlertTypes.SUCCESS && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 shrink-0 stroke-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )}

        {/* Message */}
        <span>{message}</span>
      </div>
    </div>
  );
};

export default Alert;

type TProps = {
  type: EAlertTypes;
  message: string;
};

export enum EAlertTypes {
  WARNING = 'warning',
  SUCCESS = 'success',
  INFO = 'info',
}
