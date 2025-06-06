'use client';

import { AddIcon, EditIcon, PublishIcon } from '@sanity/icons';
import { Button, Card, Inline } from '@sanity/ui';
import { startTransition, use, useCallback, useSyncExternalStore } from 'react';
import { styled } from 'styled-components';
import { SchemeContextSetState } from './scheme.client';

export {
  Card,
  Container,
  TextSkeleton,
  Heading,
  Stack,
  Text,
  Skeleton,
  type CardTone,
} from '@sanity/ui';

const StyledButton = styled(Button).attrs({ fontSize: [2, 2, 3], padding: [3, 3, 4] })``;

export function Buttons() {
  const hydrating = useSyncExternalStore(
    useCallback(() => () => {}, []),
    () => false,
    () => true
  );
  const setScheme = use(SchemeContextSetState);

  return (
    <Card padding={4} style={{ textAlign: 'center' }}>
      <Inline space={[3, 3, 4]}>
        <StyledButton
          icon={AddIcon}
          mode="ghost"
          text="Create"
          loading={hydrating}
          onClick={() =>
            startTransition(() => setScheme(scheme => (scheme === 'dark' ? 'light' : 'dark')))
          }
        />
        <StyledButton
          icon={PublishIcon}
          text="Publish"
          tone="primary"
          loading={hydrating}
          onClick={() =>
            startTransition(() => setScheme(scheme => (scheme === 'dark' ? 'light' : 'dark')))
          }
        />
        <StyledButton
          iconRight={EditIcon}
          radius="full"
          text="Edit"
          tone="caution"
          loading={hydrating}
          onClick={() =>
            startTransition(() => setScheme(scheme => (scheme === 'dark' ? 'light' : 'dark')))
          }
        />
      </Inline>
    </Card>
  );
}
