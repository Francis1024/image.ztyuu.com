interface CheckerboardBackgroundProps {
  className?: string;
}

const CheckerboardBackground: React.FC<CheckerboardBackgroundProps> = ({
  className,
}) => {
  return (
    <div
      className={`absolute inset-0 bg-checkerboard opacity-50 ${className}`}
    />
  );
};

export { CheckerboardBackground };
