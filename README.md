# ⚠️ Performance-focused styled-components forks

> **Important**: [Sanity](https://www.sanity.io) is not actively maintaining these packages long-term. We're transitioning away from CSS-in-JS solutions to [vanilla-extract](https://vanilla-extract.style/). These forks exist to help the community during the transition period after styled-components [ceased active maintenance](https://opencollective.com/styled-components/updates/thank-you).

**Looking to maintain this?** See our [maintainer opportunity section](#-looking-for-a-maintainer) below.

## Why use these forks?

Following styled-components' end of maintenance, we created **drop-in replacement** forks that solve critical issues:

- **🔥 Significant performance improvements**: [Linear](https://linear.app) saw **40% performance gains** in their Electron app
- **⚡ React 19 streaming SSR support**: Unblocks [React 19 streaming scenarios](https://github.com/styled-components/styled-components/issues/3658) that were broken in the original
- **🔄 True drop-in replacement**: Change your import and you're done - no API changes needed
- **🚀 Modern React compatibility**: Leverages `useInsertionEffect` and React 19 features

## 🚨 Migration path expectation

**These packages are meant to be a bridge, not a destination.** 

While we'll address critical bugs and security issues, you should plan to migrate to a long-term CSS-in-JS solution like:
- [vanilla-extract](https://vanilla-extract.style/) (our choice)
- [Tailwind CSS](https://tailwindcss.com/)
- [Linaria](https://linaria.dev/)
- [StyleX](https://stylexjs.com/)
- [Panda CSS](https://panda-css.com/)
- [React Strict DOM](https://facebook.github.io/react-strict-dom/)

## Which package should I use?

### `@sanity/styled-components`
**For React 18+ apps needing immediate performance gains**

- ✅ Drop-in replacement for `styled-components`
- ✅ Applies `useInsertionEffect` [performance patch](https://github.com/styled-components/styled-components/pull/4332)
- ✅ Compatible with React 18 and 19
- ❌ No `styled-components/native` support
- ❌ Uses legacy SSR techniques
- ❌ `ServerStyleSheet` does not have the `interleaveWithStream` [as it's broken](https://github.com/styled-components/styled-components/issues/3658).

### `@sanity/css-in-js`
**For React 19+ apps, as it leverages new React 19 APIs to further improve performance, and fully  support streaming SSR**

- ✅ Built for React 19's streaming SSR with native `<style href precedence>` [API support for inline stylesheets.](https://react.dev/reference/react-dom/components/style#rendering-an-inline-css-stylesheet)
- ✅ No `sheet.collectStyles` or `ServerStyleSheet` complexity since React 19 natively supports inserting and re-ordering `<style>` tags during streaming SSR, and APIs like `renderToString` knows how to handle inline stylesheets.
- ❌ Requires React 19+
- ❌ No `styled-components/native` support  
- ❌ `createGlobalStyle` can only be used after hydration when using `hydrateRoot`, or with `createRoot`. This is because React 19 [never unmounts CSS it inserts in the new `href precedence` mode](https://react.dev/reference/react-dom/components/style#rendering-an-inline-css-stylesheet). Alternatively you can use `<styled.html>` instead, if you render your app with `createRoot(document, <App />)` and use React to render `<html>`, `<body>` and `<head>` like Next.js App Router.
- Still requires `'use client'` directives in your code.

## Installation

Since the convention for `style-components` libraries are to always declare `"peerDependencies": {"styled-components": "^6"}` we strongly recommend you use `pnpm`, [as pnpm is the only package manager where peer dependency resolution isn't broken](https://bsky.app/profile/kitten.sh/post/3lx7xyzkilc2s).

### Install the drop-in with an npm alias

React 18:
```bash
pnpm add --save-exact styled-components@npm:@sanity/styled-components
```

## Usage

Using the above overrides method there's no need to change any import statements or update tooling like `babel-plugin-styled-components`, this is what it means to be a "drop-in" replacement after all.

For the React 19 version though it doesn't need, or have, `<ServerStyleSheet>` anymore with its `.collectStyles` pattern. 

### Next.js App Router SSR

You no longer need to follow the steps outlined here: https://nextjs.org/docs/app/guides/css-in-js#styled-components

You can delete the `lib/registry.ts` file in your app and its `StyleSheetManager`, `ServerStyleSheet` usage.
No more `<StyledComponentsRegistry>` wrappers.

### Render to string

It's the same story here, you no longer need `ServerStyleSheet`, your string will have the needed `<style>` tags in the string `renderToString` gives you:

```diff
-import {styled, ServerStyleSheet} from 'styled-components'
+import {styled} from 'styled-components'
import {renderToString} from 'react-dom/server'

const H1 = styled.h1`font-size: 2rem;`
-const sheet = new ServerStyleSheet()
-const element = renderToString(sheet.collectStyles(<H1>Hi!</H1>))
+const element = renderToString(<H1>Hi!</H1>)
-const styleTags = sheet.getStyleTags()
-return `${styleTags}${element}`.trim()
+return element.trim()
```

## Performance benchmarks

View live performance comparisons at [css-in-js-benchmarks.sanity.dev](https://css-in-js-benchmarks.sanity.dev/)

## Versioning

We follow `major.minor.patch-release` versioning:
- `major.minor.patch` matches the upstream styled-components version
- `release` increments with our iterations

Example: `@sanity/styled-components@6.1.19-0` contains all changes from `styled-components@6.1.19`

## Contributing & Maintenance

### 🤝 Looking for a maintainer?

If you or your organization would benefit from long-term maintenance of these packages and want to become the primary maintainer, please [create an issue with the title "Interested in becoming primary maintainer"](../../issues/new?title=Interested%20in%20becoming%20primary%20maintainer).

We're happy to:

- Add capable maintainers to the project
- Provide context on the codebase and performance optimizations

### Current maintenance policy

We will:

- ✅ Fix critical security vulnerabilities
- ✅ Address blocking bugs that prevent basic functionality
- ✅ Keep dependencies reasonably up to date

We will not:

- ❌ Add new features beyond the styled-components API
- ❌ Support React Native
- ❌ Provide extensive support for edge cases

## License

MIT - see [LICENSE](LICENSE) file.

---

**Questions?** Check our [benchmarks](https://css-in-js-benchmarks.sanity.dev/) and browse [issues](../../issues).
