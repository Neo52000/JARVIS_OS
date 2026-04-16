interface Props {
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
};

export default function LoadingSpinner({ size = 'md' }: Props) {
  return (
    <div
      className={`${sizeClasses[size]} animate-spin rounded-full`}
      style={{ border: '2px solid rgba(0,240,255,0.2)', borderTopColor: '#00f0ff' }}
    />
  );
}
