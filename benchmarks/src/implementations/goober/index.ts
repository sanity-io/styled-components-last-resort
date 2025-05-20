import { setup } from 'goober';
import React from 'react';

import type { ImplementationComponents } from '../../types';
import { Box } from './Box';
import { Dot } from './Dot';
import { View } from './View';

setup(React.createElement);

export default {
  Box,
  Dot,
  Provider: View,
  View,
} satisfies ImplementationComponents;
