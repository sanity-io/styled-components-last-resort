import { Button, Card, Container, Heading, Inline, Stack, Text } from '@sanity/ui';
import { AddIcon, EditIcon, PublishIcon } from '@sanity/icons';
import { useCallback, useSyncExternalStore } from 'react';

export default function Index() {
  const hydrating = useSyncExternalStore(
    useCallback(() => () => {}, []),
    () => false,
    () => true
  );
  return (
    <>
      <Container paddingY={6} paddingX={[3, 4, 5]} sizing="border">
        <Card padding={4}>
          <Heading>Welcome to Sanity UI</Heading>
        </Card>

        <Card padding={4} style={{ textAlign: 'center' }}>
          <Inline space={[3, 3, 4]}>
            <Button
              fontSize={[2, 2, 3]}
              icon={AddIcon}
              mode="ghost"
              padding={[3, 3, 4]}
              text="Create"
              loading={hydrating}
            />
            <Button
              fontSize={[2, 2, 3]}
              icon={PublishIcon}
              padding={[3, 3, 4]}
              text="Publish"
              tone="primary"
              loading={hydrating}
            />
            <Button
              fontSize={[2, 2, 3]}
              iconRight={EditIcon}
              padding={[3, 3, 4]}
              radius="full"
              text="Edit"
              tone="caution"
              loading={hydrating}
            />
          </Inline>
        </Card>

        <Card padding={4}>
          <Stack space={[3, 3, 4]}>
            <Card padding={[3, 3, 4]} radius={2} shadow={1}>
              <Text align="center" size={[2, 2, 3]}>
                Text in a card with <a href="#">link</a>
              </Text>
            </Card>

            <Card padding={[3, 3, 4]} radius={2} shadow={1} tone="primary">
              <Text align="center" size={[2, 2, 3]}>
                Text in a card with <a href="#">link</a>
              </Text>
            </Card>

            <Card padding={[3, 3, 4]} radius={2} shadow={1} tone="positive">
              <Text align="center" size={[2, 2, 3]}>
                Text in a card with <a href="#">link</a>
              </Text>
            </Card>

            <Card padding={[3, 3, 4]} radius={2} shadow={1} tone="caution">
              <Text align="center" size={[2, 2, 3]}>
                Text in a card with <a href="#">link</a>
              </Text>
            </Card>

            <Card padding={[3, 3, 4]} radius={2} shadow={1} tone="critical">
              <Text align="center" size={[2, 2, 3]}>
                Text in a card with <a href="#">link</a>
              </Text>
            </Card>
          </Stack>
        </Card>
      </Container>
    </>
  );
}
