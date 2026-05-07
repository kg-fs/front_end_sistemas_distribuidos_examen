import React from 'react';

interface ImageSkeletonProps {
  className?: string;
}

const ImageSkeleton: React.FC<ImageSkeletonProps> = ({ className = "" }) => {
  return (
    <div className={`animate-pulse bg-gradient-to-r from-gray-200 to-gray-300 ${className}`}>
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-gray-400">
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default ImageSkeleton;
