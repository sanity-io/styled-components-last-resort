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
- [Emotion](https://emotion.sh/)

## Which package should I use?

### `@sanity/styled-components`
**For React 18+ apps needing immediate performance gains**

- ✅ Drop-in replacement for `styled-components`
- ✅ Applies `useInsertionEffect` [performance patch](https://github.com/styled-components/styled-components/pull/4332)
- ✅ Compatible with React 18 and 19
- ❌ No `styled-components/native` support
- ❌ Uses legacy SSR techniques

### `@sanity/css-in-js`
**For React 19+ apps with streaming SSR**

- ✅ Built for React 19's streaming SSR with native `<style>` API support
- ✅ Uses `href` and `precedence` attributes for optimal performance
- ✅ No `sheet.collectStyles` or `ServerStyleSheet` complexity
- ❌ Requires React 19+
- ❌ No `styled-components/native` support  
- ❌ No `createGlobalStyle` (use `<styled.html>` instead)

## Installation

```bash
# For React 18+
npm install @sanity/styled-components

# For React 19+ with streaming SSR
npm install @sanity/css-in-js
```

## Usage

### Basic usage (both packages)

```jsx
import styled from '@sanity/styled-components'
// or
import styled from '@sanity/css-in-js'

const Button = styled.button`
  background: blue;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
`
```

### Server-side rendering

#### `@sanity/styled-components` (React 18+)
```jsx
import { ServerStyleSheet } from '@sanity/styled-components'

// Use existing styled-components SSR patterns
const sheet = new ServerStyleSheet()
// ... rest of your SSR setup
```

#### `@sanity/css-in-js` (React 19+)
```jsx
// No special setup needed! 
// Styles are automatically handled by React 19's streaming SSR
function App() {
  return (
    <html>
      <head>
        {/* React 19 handles style injection automatically */}
      </head>
      <body>
        <YourStyledComponents />
      </body>
    </html>
  )
}
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