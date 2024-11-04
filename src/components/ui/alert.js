import React from 'react';

const Alert = ({
  variant = 'default',
  className = '',
  children,
  ...props
}) => {
  let variantStyles = '';

  switch (variant) {
    case 'default':
      variantStyles = 'bg-gray-100 text-gray-900';
      break;
    case 'destructive':
      variantStyles = 'bg-red-100 text-red-900';
      break;
    case 'success':
      variantStyles = 'bg-green-100 text-green-900';
      break;
    case 'warning':
      variantStyles = 'bg-yellow-100 text-yellow-900';
      break;
    default:
      variantStyles = 'bg-gray-100 text-gray-900';
  }

  return (
    <div
      className={`rounded-md p-4 ${variantStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

const AlertTitle = ({ children, ...props }) => {
  return (
    <h4 className="mb-1 font-medium" {...props}>
      {children}
    </h4>
  );
};

const AlertDescription = ({ children, ...props }) => {
  return <p className="text-sm" {...props}>{children}</p>;
};

const AlertDialog = ({ children, ...props }) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      {...props}
    >
      <div className="bg-white rounded-md shadow-lg p-6 max-w-md w-full">
        {children}
      </div>
    </div>
  );
};

const AlertDialogAction = ({ children, ...props }) => {
  return (
    <div className="flex justify-end mt-4" {...props}>
      {children}
    </div>
  );
};

export { Alert, AlertTitle, AlertDescription, AlertDialog, AlertDialogAction };