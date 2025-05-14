# We're moving away from styled-components

Following the news that styled-components is [no longer maintained](https://opencollective.com/styled-components/updates/thank-you), we're in the process of finding a replacement.

Once we decide on where to move to, we still have a long way abead of us.
The purpose of this repo is to buy us time, by improving the performance of the current version, while also unblocking on [React 19 streaming SSR scenarios](https://github.com/styled-components/styled-components/issues/3658).

# Which fork should I use?

- `@sanity/styled-components`
  - Applies `useInsertionEffect` [patch](https://github.com/styled-components/styled-components/pull/4332).
  - Mostly drop-in compatible with `styled-components`.
  - The version scheme is `major.minor.patch-release`, the `major`, `minor` and `patch` matches the `styled-components` the fork is last synced with, while `release` is a number that increments with each iteration we do. In other words `@sanity/styled-components@6.1.18-0` and `@sanity/styled-components@6.1.18-42` both contain the changes from `styled-components@6.1.18`.
  - Doesn't include `styled-components/native`.
  - Requires React 18 or newer.
- `@sanity/css-in-js`
  - Requires React 19 or newer.
  - Built to solve problems with streaming server rendering by natively supporting React 19 `<style>` APIs with the new `href` and `precedence` attributes, replacing `sheet.collectStyles` and `ServerStyleSheet` techniques.
  - Does not have `styled-components/native`.
  - Does not have `createGlobalStyle`, use `<styled.html>` instead.
