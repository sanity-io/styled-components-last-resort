// @vitest-environment node
import ReactDOMServer from 'react-dom/server'
import createGlobalStyle from '../createGlobalStyle'

describe(`createGlobalStyle`, () => {
  let context: ReturnType<typeof setup>

  function setup() {
    return {
      renderToString(comp: React.JSX.Element) {
        return ReactDOMServer.renderToString(comp)
      },
    }
  }

  beforeEach(() => {
    context = setup()
  })

  it(`throws when rendered to string`, () => {
    const Component = createGlobalStyle`[data-test-inject]{color:red;} `
    expect(() => context.renderToString(<Component />)).toThrowErrorMatchingInlineSnapshot(
      `[TypeError: createGlobalStyle does not support SSR, use hydration check to detect it]`,
    )
  })
})
