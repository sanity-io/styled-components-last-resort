import type { ImplementationComponents } from '../../types';
import { Box } from './Box';
import { Dot } from './Dot';
import { View } from './View';

export default {
  Box,
  Dot,
  Provider: View,
  View,
} satisfies ImplementationComponents;
