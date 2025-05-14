'use client';

import { AddIcon, EditIcon, PublishIcon } from '@sanity/icons';
import { Button, Card, Inline } from '@sanity/ui';
import { useCallback, useSyncExternalStore } from 'react';
import { styled } from 'styled-components';

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

  return (
    <Card padding={4} style={{ textAlign: 'center' }}>
      <Inline space={[3, 3, 4]}>
        <StyledButton icon={AddIcon} mode="ghost" text="Create" loading={hydrating} />
        <StyledButton icon={PublishIcon} text="Publish" tone="primary" loading={hydrating} />
        <StyledButton
          iconRight={EditIcon}
          radius="full"
          text="Edit"
          tone="caution"
          loading={hydrating}
        />
      </Inline>
    </Card>
  );
}
