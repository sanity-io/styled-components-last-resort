// @vitest-environment node

import {resetStyled} from './utils'

import {renderToString} from 'react-dom/server'
import stylisRTLPlugin from 'stylis-plugin-rtl'
import {StyleSheetManager} from '../models/StyleSheetManager'

vi.mock('../utils/nonce')

let styled: ReturnType<typeof resetStyled>

describe('ssr', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})

    styled = resetStyled(true)
  })

  it('should extract the CSS in a simple case', () => {
    const Heading = styled.h1`
      color: red;
    `

    const html = renderToString(<Heading>Hello SSR!</Heading>)

    expect(html).toMatchSnapshot()
  })

  it('should emit nothing when no styles were generated', () => {
    // oxlint-disable-next-line no-unused-expressions
    styled.h1`
      color: red;
    `

    const html = renderToString(<div />)

    expect(html).not.toContain('red')
  })

  it('should not spill ServerStyleSheets into each other', () => {
    const A = styled.h1`
      color: red;
    `
    const B = styled.h1`
      color: green;
    `

    const htmlA = renderToString(<A />)
    const htmlB = renderToString(<B />)

    expect(htmlA).toContain('red')
    expect(htmlA).not.toContain('green')
    expect(htmlB).not.toContain('red')
    expect(htmlB).toContain('green')
  })

  it('should render CSS in the order the components were defined, not rendered', () => {
    const ONE = styled.h1.withConfig({componentId: 'ONE'})`
      color: red;
    `
    const TWO = styled.h2.withConfig({componentId: 'TWO'})`
      color: blue;
    `

    const html = renderToString(
      <div>
        <TWO />
        <ONE />
      </div>,
    )

    expect(html).toMatchSnapshot()
  })

  it('should return a generated React style element', () => {
    const Heading = styled.h1`
      color: red;
    `

    const html = renderToString(
      <>
        <Heading>Hello SSR!</Heading>
      </>,
    )

    expect(html).toContain('style')
    expect(html).toMatchSnapshot()
  })

  it('should work with stylesheet manager and passed stylis plugins', () => {
    const Heading = styled.h1`
      padding-left: 5px;
    `

    const html = renderToString(
      <StyleSheetManager stylisPlugins={[stylisRTLPlugin]}>
        <Heading>Hello SSR!</Heading>
      </StyleSheetManager>,
    )

    expect(html).toMatchInlineSnapshot(`
      "<style data-precedence="sc" data-href="ahokr8">.b{padding-right:5px;}/*!sc*/
      </style><h1 class="sc-a b">Hello SSR!</h1>"
    `)
    expect(html).toContain('padding-right')
    expect(html).not.toContain('padding-left')
  })
})
