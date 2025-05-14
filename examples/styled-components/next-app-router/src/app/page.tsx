import {
  Buttons,
  Card,
  Container,
  Heading,
  Skeleton,
  Stack,
  Text,
  TextSkeleton,
  type CardTone,
} from './page.client';
import { Suspense, use } from 'react';
import { connection } from 'next/server';

function createPromise(tone: CardTone, min = 5_000, max = 10_000) {
  const timeout = Math.random() * (max - min) + min;
  return new Promise<typeof tone>(resolve => setTimeout(() => resolve(tone), timeout));
}

export default function Index() {
  connection();
  const promises = {
    default: createPromise('default'),
    primary: createPromise('primary'),
    positive: createPromise('positive'),
    caution: createPromise('caution'),
    critical: createPromise('critical'),
  } as const satisfies Partial<Record<CardTone, Promise<CardTone>>>;
  const tones: CardTone[] = ['default', 'primary', 'positive', 'caution', 'critical'];

  return (
    <>
      <Container paddingY={6} paddingX={[3, 4, 5]} sizing="border">
        <Card padding={4}>
          <Heading align="center">Welcome to Sanity UI</Heading>
        </Card>
        <Buttons />

        <Card padding={4}>
          <Stack space={[3, 3, 4]}>
            {tones.map(tone => (
              <Suspense
                key={tone}
                fallback={
                  <Skeleton animated padding={[3, 3, 4]} radius={2}>
                    <TextSkeleton animated size={[2, 2, 3]} />
                  </Skeleton>
                }
              >
                <SuspendingCard tone={createPromise(tone)} />
              </Suspense>
            ))}
          </Stack>
        </Card>
      </Container>
    </>
  );
}

async function SuspendingCard({ tone }: { tone: Promise<CardTone> }) {
  return (
    <Card padding={[3, 3, 4]} radius={2} shadow={1} tone={await tone}>
      <Text align="center" size={[2, 2, 3]}>
        Text in a card with <a href="#">link</a>
      </Text>
    </Card>
  );
}
