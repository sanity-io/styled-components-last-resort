# styled-components-last-resort

> **📖 Full Story**: [How we made styled-components 40% faster and why Linear loves it](https://www.sanity.io/blog/cut-styled-components-into-pieces-this-is-our-last-resort)
> 
> TL;DR: styled-components never implemented React 18's useInsertionEffect. We fixed that, plus streaming SSR. Linear saw 40% faster renders on first render.

Last resort forks for styled-components which include significant performance gains when used with React 18+.

This repository contains two forks, currently considered a last resort for existing applications deeply invested in styled-components. They provide a drop-in replacement with performance improvements while you plan a migration to a modern styling solution.

## ⚠️ Important: Not a long-term solution

We do **not** recommend styled-components for new projects. Both its maintainer and the React team recommend exploring modern alternatives that better align with React's current architecture. This fork exists solely to improve performance for existing applications while teams plan their migration strategy.

**[Why we built this and what you should do next →](https://www.sanity.io/blog/cut-styled-components-into-pieces-this-is-our-last-resort#your-three-stage-treatment-plan)**

<img width="642" height="643" alt="Four simple illustrations showing how to put on and secure a life vest, ending with a playful depiction where the vest looks like a jetpack." src="https://github.com/user-attachments/assets/f1633a66-c3c8-4eb1-9e6a-ff80656d72f3" />

## What's Fixed

- ✅ React 18's `useInsertionEffect` for [faster first renders](https://www.sanity.io/blog/cut-styled-components-into-pieces-this-is-our-last-resort#the-40-performance-gap)
- ✅ Streaming SSR for React 19 support
- ✅ Modern JS output (ES2020 vs ES5)
- ✅ Next.js App Router without boilerplate
- ✅ Flattened component arrays for better performance
- ✅ Optimized hash function with Math.imul

## Why use these forks?

Following styled-components' end of maintenance, we created **drop-in replacement** forks that solve critical issues:

- **🔥 Significant performance improvements**: [Linear](https://linear.app) saw **up to 40% performance increase** on initial component rendering
- **⚡ React 19 streaming SSR support**: Unblocks [React 19 streaming scenarios](https://github.com/styled-components/styled-components/issues/3658) that were broken in the original
- **🔄 True drop-in replacement**: Change your import and you're done - no API changes needed
- **🚀 Modern React compatibility**: Leverages `useInsertionEffect` and React 19 features

<img width="600" height="600" alt="A black background graphic with the Linear logo and a testimonial: “Linear now renders first page visits up to 40% faster thanks to your hard work! Thank you so much. Been a pleasure with such a quick turnaround.” At the bottom is a black-and-white headshot of Kenneth Skovhus, Software Engineer at Linear." src="https://github.com/user-attachments/assets/12f4ec79-4f47-44ac-a983-0d472d25f918" />


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

**For React 19+ apps, as it leverages new React 19 APIs to further improve performance, and fully support streaming SSR**

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

React 19:

```bash
pnpm add --save-exact styled-components@npm:@sanity/css-in-js
```

### The alias isn't fully working, my app now has both `styled-components` and `@sanity/styled-components`/`@sanity/css-in-js`

This can happen if one of your dependencies have a direct dependency on `styled-components`, instead of declaring it in `peerDependencies`. Using `pnpm` you can force all packages to use the fork in these ways in your `package.json`:

React 18:

```json
{
  "pnpm": {
    "overrides": {
      "styled-components": "npm:@sanity/styled-components@^6.1.19"
    }
  }
}
```

React 19:

```json
{
  "pnpm": {
    "overrides": {
      "styled-components": "npm:@sanity/css-in-js@^6.1.19"
    }
  }
}
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

Our forks are strictly a subset of `styled-components@6.1.18`. There are features we've removed, which can be breaking in some ways. But we're not adding new exports and features that would make it difficult to move away from the fork and back to the official `styled-components` library.
Initially we had a version scheme that reflected this: `major.minor.patch-release`, where `@sanity/styled-components@6.1.18-30` meant it matches `styled-components@6.1.18`, and it's the 30th release on that shared API.

Since we want to be compatible with libraries that have styled components v6 as a peer dependency we use pragmatic versioning instead:

```json
{
  "peerDependencies": {
    "styled-components": "^6.1"
  }
}
```

We now try to stay within the same `major.minor` as the baseline of the fork. The consequence of this is that our `patch` versions may have breaking changes in them.


## FAQ

### Why not contribute upstream?

We did! We opened [PR #4332](https://github.com/styled-components/styled-components/pull/4332) in July 2024. With styled-components now in maintenance mode and the maintainer recommending against new adoption, we've made our optimizations available as this fork.

### Will you maintain this long-term?

No. This is explicitly a temporary solution. We're actively migrating away from styled-components ourselves. This fork exists to buy teams time for proper migration while maintaining performance.

### What about security updates?

We'll apply critical security patches if they arise, but no new features will be added.

### Can I help maintain this?

If you want to become the long-term maintainer of a styled-components fork, please reach out. We'd be happy to transfer ownership to someone committed to its future.

### What should I migrate to?

While we'll address critical bugs and security issues, you should plan to migrate to a long-term CSS-in-JS solution like:

- [vanilla-extract](https://vanilla-extract.style/) (our choice)
- [Tailwind CSS](https://tailwindcss.com/)
- [Linaria](https://linaria.dev/)
- [StyleX](https://stylexjs.com/)
- [Panda CSS](https://panda-css.com/)
- [React Strict DOM](https://facebook.github.io/react-strict-dom/)

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
