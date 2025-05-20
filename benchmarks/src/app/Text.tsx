import React, { createContext, use } from 'react';
import { Text as NativeText, StyleSheet, type StyleProp, type TextStyle } from 'react-native';
import { colors } from './theme';

const styles = StyleSheet.create({
  baseText: {
    color: colors.textBlack,
    // @ts-expect-error - fix later
    fontSize: '1rem',
    // @ts-expect-error - fix later
    lineHeight: '1.3125em',
  },
});

const IsAParentTextContext = createContext(false);

export function Text(props: {
  children: React.ReactNode;
  numberOfLines?: number;
  style?: StyleProp<TextStyle>;
  testID?: string;
}) {
  const { children, style, numberOfLines, testID } = props;
  const isInAParentText = use(IsAParentTextContext);
  return (
    <IsAParentTextContext value={true}>
      <NativeText
        numberOfLines={numberOfLines}
        style={[!isInAParentText && styles.baseText, style]}
        testID={testID}
      >
        {children}
      </NativeText>
    </IsAParentTextContext>
  );
}

Text.displayName = '@app/Text';
