import React from 'react';
import { icons, LucideProps } from 'lucide-react';

type IconProps = LucideProps & {
  name: keyof typeof icons;
};

const Icon = ({ name, ...props }: IconProps): JSX.Element | null => {
  const LucideIcon = icons[name];

  if (!LucideIcon) {
    console.warn(`Icon not found: ${String(name)}`);
    return null;
  }

  return <LucideIcon {...props} />;
};

export default Icon;
