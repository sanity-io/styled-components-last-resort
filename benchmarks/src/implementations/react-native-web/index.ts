import { View } from 'react-native';
import type { ImplementationComponents } from '../../types';
import { Box } from './Box';
import { Dot } from './Dot';

export default {
  Box,
  Dot,
  // @ts-expect-error - fix later
  Provider: View,
  // @ts-expect-error - fix later
  View,
} satisfies ImplementationComponents;
