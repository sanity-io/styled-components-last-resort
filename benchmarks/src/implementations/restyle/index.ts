import type { ImplementationComponents } from '../../types';
import { Box } from './Box';
import { Dot } from './Dot';
import { View } from './View';

export default {
  // @ts-expect-error - fix later
  Box,
  Dot,
  // @ts-expect-error - fix later
  Provider: View,
  // @ts-expect-error - fix later
  View,
} satisfies ImplementationComponents;
