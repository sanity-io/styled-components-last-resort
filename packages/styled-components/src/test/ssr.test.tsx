// @vitest-environment node

import {resetStyled} from './utils'

import {renderToString} from 'react-dom/server'
import stylisRTLPlugin from 'stylis-plugin-rtl'
import createGlobalStyle from '../constructors/createGlobalStyle'
import ServerStyleSheet from '../models/ServerStyleSheet'
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

    const sheet = new ServerStyleSheet()
    const html = renderToString(sheet.collectStyles(<Heading>Hello SSR!</Heading>))
    const css = sheet.getStyleTags()

    expect(html).toMatchSnapshot()
    expect(css).toMatchSnapshot()
  })

  it('should extract both global and local CSS', () => {
    const Component = createGlobalStyle`
      body { background: papayawhip; }
    `
    const Heading = styled.h1`
      color: red;
    `

    const sheet = new ServerStyleSheet()
    const html = renderToString(
      sheet.collectStyles(
        <>
          <Component />
          <Heading>Hello SSR!</Heading>
        </>,
      ),
    )
    const css = sheet.getStyleTags()

    expect(html).toMatchSnapshot()
    expect(css).toMatchSnapshot()
  })

  it('should emit nothing when no styles were generated', () => {
    styled.h1`
      color: red;
    `

    const sheet = new ServerStyleSheet()
    renderToString(sheet.collectStyles(<div />))

    const cssTags = sheet.getStyleTags()
    expect(cssTags).toBe('')

    const cssElements = sheet.getStyleElement()
    expect(cssElements).toEqual([])
  })

  it('should emit global styles without any other components', () => {
    const Component = createGlobalStyle`
      body { background: papayawhip; }
    `

    const sheet = new ServerStyleSheet()
    renderToString(sheet.collectStyles(<Component />))

    const cssTags = sheet.getStyleTags()
    expect(cssTags).toMatchSnapshot()

    const cssElements = sheet.getStyleElement()
    expect(<>{cssElements}</>).toMatchSnapshot()
  })

  it('should not spill ServerStyleSheets into each other', () => {
    const A = styled.h1`
      color: red;
    `
    const B = styled.h1`
      color: green;
    `

    const sheetA = new ServerStyleSheet()
    renderToString(sheetA.collectStyles(<A />))
    const cssA = sheetA.getStyleTags()

    const sheetB = new ServerStyleSheet()
    renderToString(sheetB.collectStyles(<B />))
    const cssB = sheetB.getStyleTags()

    expect(cssA).toContain('red')
    expect(cssA).not.toContain('green')
    expect(cssB).not.toContain('red')
    expect(cssB).toContain('green')
  })

  it('should render CSS in the order the components were defined, not rendered', () => {
    const ONE = styled.h1.withConfig({componentId: 'ONE'})`
      color: red;
    `
    const TWO = styled.h2.withConfig({componentId: 'TWO'})`
      color: blue;
    `

    const sheet = new ServerStyleSheet()
    const html = renderToString(
      sheet.collectStyles(
        <div>
          <TWO />
          <ONE />
        </div>,
      ),
    )
    const css = sheet.getStyleTags()

    expect(html).toMatchSnapshot()
    expect(css).toMatchSnapshot()
  })

  it('should return a generated React style element', () => {
    const Component = createGlobalStyle`
      body { background: papayawhip; }
    `
    const Heading = styled.h1`
      color: red;
    `

    const sheet = new ServerStyleSheet()

    renderToString(
      sheet.collectStyles(
        <>
          <Component />
          <Heading>Hello SSR!</Heading>
        </>,
      ),
    )

    const [element] = sheet.getStyleElement()

    expect(element.props.dangerouslySetInnerHTML).toBeDefined()
    expect(element.props.children).not.toBeDefined()
    expect(element.props).toMatchSnapshot()
  })

  it('should work with stylesheet manager and passed stylis plugins', () => {
    const Heading = styled.h1`
      padding-left: 5px;
    `

    const sheet = new ServerStyleSheet()
    const html = renderToString(
      sheet.collectStyles(
        <StyleSheetManager stylisPlugins={[stylisRTLPlugin]}>
          <Heading>Hello SSR!</Heading>
        </StyleSheetManager>,
      ),
    )
    const css = sheet.getStyleTags()

    expect(html).toMatchInlineSnapshot(`"<h1 class="sc-a b">Hello SSR!</h1>"`)
    expect(css).toMatchInlineSnapshot(`
      "<style data-styled="true" data-styled-version="JEST_MOCK_VERSION">.b{padding-right:5px;}/*!sc*/
      data-styled.g1[id="sc-a"]{content:"b,"}/*!sc*/
      </style>"
    `)
  })
})
