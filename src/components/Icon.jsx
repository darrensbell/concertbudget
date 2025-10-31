import React from 'react';
import * as icons from './icons';

const Icon = ({ name, ...props }) => {
  const IconComponent = icons[name];

  if (!IconComponent) {
    return null; // Or return a default icon
  }

  return <IconComponent {...props} />;
};

export default Icon;
