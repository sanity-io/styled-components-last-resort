import { render, fireEvent, screen, act } from '@testing-library/react';

import { DISABLE_SPEEDY } from '../../constants';
import { StyleSheetManager } from '../../models/StyleSheetManager';
import ThemeProvider from '../../models/ThemeProvider';
import StyleSheet from '../../sheet';
import { getRenderedCSS, resetStyled } from '../../test/utils';
import createGlobalStyle from '../createGlobalStyle';
import keyframes from '../keyframes';
import { Component, StrictMode } from 'react';

describe(`createGlobalStyle`, () => {
  beforeEach(() => {
    resetStyled();
  });

  it(`injects global <style> when rendered`, () => {
    const Component = createGlobalStyle`[data-test-inject]{color:red;} `;
    render(<Component />);
    expect(getRenderedCSS()).toMatchInlineSnapshot(`
      "[data-test-inject] {
        color: red;
      }"
    `);
  });

  it(`supports interpolation`, () => {
    const Component = createGlobalStyle<{ color: string }>`div {color:${props => props.color};} `;
    render(<Component color="orange" />);
    expect(getRenderedCSS()).toMatchInlineSnapshot(`
      "div {
        color: orange;
      }"
    `);
  });

  it(`supports objects with a function`, () => {
    const Component = createGlobalStyle({
      'h1, h2, h3, h4, h5, h6': {
        fontFamily: ({ theme }) => theme.fonts.heading,
      },
    });
    render(<Component theme={{ fonts: { heading: 'sans-serif' } }} />);
    expect(getRenderedCSS()).toMatchInlineSnapshot(`
      "h1, h2, h3, h4, h5, h6 {
        font-family: sans-serif;
      }"
    `);
  });

  it(`supports nested objects with a function`, () => {
    const Component1 = createGlobalStyle({
      'div, span': {
        h1: {
          span: {
            fontFamily: ({ theme }) => theme.fonts.heading,
          },
        },
      },
    });
    render(<Component1 theme={{ fonts: { heading: 'sans-serif' } }} />);
    expect(getRenderedCSS()).toMatchInlineSnapshot(`
      "div h1 span, span h1 span {
        font-family: sans-serif;
      }"
    `);
  });

  it(`supports theming`, () => {
    const Component = createGlobalStyle`div {color:${props => props.theme.color};} `;
    render(
      <ThemeProvider theme={{ color: 'black' }}>
        <Component />
      </ThemeProvider>
    );
    expect(getRenderedCSS()).toMatchInlineSnapshot(`
      "div {
        color: black;
      }"
    `);
  });

  it(`updates theme correctly`, async () => {
    const TheComponent = createGlobalStyle`div {color:${props => props.theme.color};} `;
    let update: any;
    class App extends Component {
      override state = { color: 'grey' };

      constructor(props: {}) {
        super(props);
        update = (payload: {}) => {
          this.setState(payload);
        };
      }

      override render() {
        return (
          <ThemeProvider theme={{ color: this.state.color }}>
            <TheComponent />
          </ThemeProvider>
        );
      }
    }
    render(<App />);
    expect(getRenderedCSS()).toMatchInlineSnapshot(`
      "div {
        color: grey;
      }"
    `);

    await act(() => update({ color: 'red' }));
    expect(getRenderedCSS()).toMatchInlineSnapshot(`
      "div {
        color: red;
      }"
    `);
  });

  it('should work in StrictMode without warnings', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const Comp = createGlobalStyle`
      html {
        color: red;
      }
    `;

    render(
      <StrictMode>
        <Comp />
      </StrictMode>
    );

    expect(spy).not.toHaveBeenCalled();
  });

  it('should not inject twice in StrictMode', () => {
    vi.spyOn(StyleSheet, 'registerId');

    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const Comp = createGlobalStyle`
      html {
        color: red;
      }
    `;

    render(
      <StrictMode>
        <Comp />
      </StrictMode>
    );

    expect(spy).not.toHaveBeenCalled();
    expect(StyleSheet.registerId).toHaveBeenCalledTimes(1);
  });

  it(`renders to StyleSheetManager.target`, async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const Component = createGlobalStyle`[data-test-target]{color:red;} `;
    await act(() =>
      render(
        <StyleSheetManager target={container}>
          <Component />
        </StyleSheetManager>
      )
    );

    const style = container.firstElementChild!;
    expect(style.tagName).toBe('STYLE');
    expect((style as HTMLStyleElement).sheet?.cssRules[0].cssText).toContain(
      `[data-test-target] {color: red;}`
    );

    document.body.removeChild(container);
  });

  it(`adds new global rules non-destructively`, () => {
    const Color = createGlobalStyle`[data-test-add]{color:red;} `;
    const Background = createGlobalStyle`[data-test-add]{background:yellow;} `;

    render(
      <>
        <Color />
        <Background />
      </>
    );

    expect(getRenderedCSS()).toMatchInlineSnapshot(`
      "[data-test-add] {
        color: red;
      }
      [data-test-add] {
        background: yellow;
      }"
    `);
  });

  it(`stringifies multiple rules correctly`, () => {
    const Component = createGlobalStyle<{ fg: any; bg: any }>`
      div {
        color: ${props => props.fg};
        background: ${props => props.bg};
      }
    `;
    render(<Component fg="red" bg="green" />);
    expect(getRenderedCSS()).toMatchInlineSnapshot(`
      "div {
        color: red;
        background: green;
      }"
    `);
  });

  it(`injects multiple <GlobalStyle> components correctly`, () => {
    const A = createGlobalStyle`body { background: palevioletred; }`;
    const B = createGlobalStyle`body { color: white; }`;

    render(
      <>
        <A />
        <B />
      </>
    );
    expect(getRenderedCSS()).toMatchInlineSnapshot(`
      "body {
        background: palevioletred;
      }
      body {
        color: white;
      }"
    `);
  });

  it(`removes styling injected styling when unmounted`, () => {
    const ComponentA = createGlobalStyle`[data-test-remove]{color:grey;} `;
    const ComponentB = createGlobalStyle`[data-test-keep]{color:blue;} `;

    class Comp extends Component<{ insert: boolean }> {
      override render() {
        return this.props.insert ? <ComponentA /> : <ComponentB />;
      }
    }

    const { rerender } = render(<Comp insert />);

    expect(getRenderedCSS()).toMatchInlineSnapshot(`
        "[data-test-remove] {
          color: grey;
        }"
      `);

    rerender(<Comp insert={false} />);

    expect(getRenderedCSS()).toMatchInlineSnapshot(`
        "[data-test-keep] {
          color: blue;
        }"
      `);
  });

  it(`removes styling injected for multiple <GlobalStyle> components correctly`, async () => {
    const A = createGlobalStyle`body { background: palevioletred; }`;
    const B = createGlobalStyle`body { color: white; }`;

    class Comp extends Component {
      override state = {
        a: true,
        b: true,
      };

      onClick() {
        if (this.state.a === true && this.state.b === true) {
          this.setState({
            a: true,
            b: false,
          });
        } else if (this.state.a === true && this.state.b === false) {
          this.setState({
            a: false,
            b: false,
          });
        } else {
          this.setState({
            a: true,
            b: true,
          });
        }
      }

      override render() {
        return (
          <div data-testid="el" onClick={() => this.onClick()}>
            {this.state.a ? <A /> : null}
            {this.state.b ? <B /> : null}
          </div>
        );
      }
    }

    await act(() => render(<Comp />));

    expect(getRenderedCSS()).toMatchInlineSnapshot(`
      "body {
        background: palevioletred;
      }
      body {
        color: white;
      }"
    `); // should have both styles

    fireEvent.click(screen.getByTestId('el'));

    expect(getRenderedCSS()).toMatchInlineSnapshot(`
      "body {
        background: palevioletred;
      }"
    `); // should only have palevioletred

    fireEvent.click(screen.getByTestId('el'));
    expect(getRenderedCSS()).toMatchInlineSnapshot(`""`); // should be empty
  });

  it(`removes styling injected for multiple instances of same <GlobalStyle> components correctly`, () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});

    const A = createGlobalStyle<{ bgColor?: any }>`
      body { background: ${props => props.bgColor}; }
    `;

    const { rerender } = render(<A bgColor="blue" />);
    expect(getRenderedCSS()).toMatchInlineSnapshot(`
      "body {
        background: blue;
      }"
    `);

    rerender(<A bgColor="red" />);
    expect(getRenderedCSS()).toMatchInlineSnapshot(`
      "body {
        background: red;
      }"
    `);

    rerender(<A />);
    expect(getRenderedCSS()).toMatchInlineSnapshot(`""`);
  });

  it(`should warn when children are passed as props`, () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const Component = createGlobalStyle<{ fg: any; bg: any }>`
      div {
        color: ${props => props.fg};
        background: ${props => props.bg};
      }
    `;
    render(
      // @ts-expect-error children not expected
      <Component fg="red" bg="green">
        <div />
      </Component>
    );

    expect(warn.mock.calls[0][0]).toMatchInlineSnapshot(
      `"The global style component sc-global-a was given child JSX. createGlobalStyle does not render children."`
    );
  });

  it(`should warn when @import is used`, () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const Component = createGlobalStyle`
      @import url("something.css");
    `;
    render(<Component />);

    expect(warn.mock.calls[0][0]).toMatchInlineSnapshot(
      `"Please do not use @import CSS syntax in createGlobalStyle at this time, as the CSSOM APIs we use in production do not handle it well. Instead, we recommend using a library such as react-helmet to inject a typical <link> meta tag to the stylesheet, or simply embedding it manually in your index.html <head> section for a simpler app."`
    );
  });

  it('works with keyframes', () => {
    const rotate360 = keyframes`
      from {
        transform: rotate(0deg);
      }

      to {
        transform: rotate(360deg);
      }
    `;

    const GlobalStyle = createGlobalStyle`
      div {
        display: inline-block;
        animation: ${rotate360} 2s linear infinite;
        padding: 2rem 1rem;
        font-size: 1.2rem;
      }
    `;

    render(
      <div>
        <GlobalStyle />
        <div>&lt; 💅 &gt;</div>
      </div>
    );

    expect(getRenderedCSS()).toMatchInlineSnapshot(`
      "div {
        display: inline-block;
        animation: a 2s linear infinite;
        padding: 2rem 1rem;
        font-size: 1.2rem;
      }
      @keyframes a {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }"
    `);
  });

  it(`removes style tag in StyleSheetManager.target when unmounted after target detached and no other global styles`, () => {
    // This test requires speedy to be enabled
    expect(DISABLE_SPEEDY).toBe(false);

    const container = document.createElement('div');
    document.body.appendChild(container);

    const styleContainer = document.createElement('div');
    document.body.appendChild(styleContainer);

    const TheComponent = createGlobalStyle`[data-test-unmount-remove]{color:grey;} `;

    class Comp extends Component {
      override render() {
        return (
          <div>
            <StyleSheetManager target={styleContainer}>
              <TheComponent />
            </StyleSheetManager>
          </div>
        );
      }
    }

    const { unmount } = render(<Comp />, { container });

    // Check styles
    const style = styleContainer.firstElementChild as HTMLStyleElement;
    expect((style!.sheet!.cssRules[0] as CSSStyleRule).selectorText).toBe(
      '[data-test-unmount-remove]'
    );

    // detach container and unmount react component
    expect(() => {
      document.body.removeChild(container);
      document.body.removeChild(styleContainer);

      unmount();
    }).not.toThrow();
  });

  it(`injects multiple global styles in definition order, not composition order`, async () => {
    const GlobalStyleOne = createGlobalStyle`[data-test-inject]{color:red;} `;
    const GlobalStyleTwo = createGlobalStyle`[data-test-inject]{color:green;} `;
    await act(() =>
      render(
        <>
          <GlobalStyleTwo />
          <GlobalStyleOne />
        </>
      )
    );

    expect(getRenderedCSS()).toMatchInlineSnapshot(`
      "[data-test-inject] {
        color: red;
      }
      [data-test-inject] {
        color: green;
      }"
    `);
  });
});
