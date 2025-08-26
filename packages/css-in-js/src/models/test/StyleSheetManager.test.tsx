import { Component } from 'react';
import { render, act } from '@testing-library/react';
import Frame, { FrameContextConsumer } from 'react-frame-component';
import stylisRTLPlugin from 'stylis-plugin-rtl';
import { getRenderedCSS, resetStyled } from '../../test/utils';
import { StyleSheetManager } from '../StyleSheetManager';

let styled: ReturnType<typeof resetStyled>;

describe('StyleSheetManager', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    document.head.innerHTML = '';

    styled = resetStyled(true);

    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  it('should render its child', () => {
    const target = document.head;

    const Title = styled.h1`
      color: palevioletred;
    `;
    const { getByTestId } = render(
      <StyleSheetManager target={target}>
        <Title data-testid="title" />
      </StyleSheetManager>
    );

    expect(getByTestId('title')).toMatchInlineSnapshot(`
      <h1
        class="sc-a b"
        data-testid="title"
      />
    `);
  });

  it('should append style to given target', () => {
    const target = document.body;
    const Title = styled.h1`
      color: palevioletred;
    `;
    class Child extends Component {
      override render() {
        return <Title />;
      }
    }

    expect(document.body.querySelectorAll('style')).toHaveLength(0);

    render(
      <StyleSheetManager target={target}>
        <Child />
      </StyleSheetManager>
    );

    const styles = target.querySelector('style') as HTMLStyleElement;

    expect(styles?.sheet?.cssRules[0].cssText.includes(`palevioletred`)).toEqual(true);
  });

  it('should append style to given target in iframe', () => {
    const iframe = document.createElement('iframe');
    const app = document.createElement('div');

    document.body.appendChild(iframe);
    iframe.contentDocument!.body.appendChild(app);

    const target = iframe.contentDocument!.head;
    const Title = styled.h1`
      color: palevioletred;
    `;

    class Child extends Component {
      override render() {
        return <Title />;
      }
    }

    render(
      <StyleSheetManager target={target}>
        <Child />
      </StyleSheetManager>,
      { container: app }
    );

    const styles = target.querySelector('style') as HTMLStyleElement;

    expect(styles?.sheet?.cssRules[0].cssText.includes(`palevioletred`)).toEqual(true);
  });

  it('should apply styles to appropriate targets for nested StyleSheetManagers', () => {
    const ONE = styled.h1`
      color: red;
    `;
    const TWO = styled.h2`
      color: blue;
    `;
    const THREE = styled.h3`
      color: green;
    `;

    render(
      <div>
        <ONE />
        <StyleSheetManager target={document.head}>
          <div>
            <TWO />
            <StyleSheetManager target={document.body}>
              <THREE />
            </StyleSheetManager>
          </div>
        </StyleSheetManager>
      </div>
    );

    expect(document.head.innerHTML).toMatchSnapshot();
    expect(document.body.innerHTML).toMatchSnapshot();
    expect(getRenderedCSS()).toMatchSnapshot();
  });

  // https://github.com/styled-components/styled-components/issues/1634
  it.skip('should inject styles into two parallel contexts', async () => {
    const Title = styled.h1`
      color: palevioletred;
    `;

    // Injects the stylesheet into the document available via context
    const SheetInjector = ({ children, target }: any) => (
      <StyleSheetManager target={target}>{children}</StyleSheetManager>
    );

    class Child extends Component<{ document: Document; resolve: Function }> {
      override componentDidMount() {
        const style = this.props.document.querySelector('style') as HTMLStyleElement;

        expect(style?.sheet?.cssRules[0].cssText.includes(`palevioletred`)).toEqual(true);

        this.props.resolve();
      }

      override render() {
        return <Title />;
      }
    }

    const div = document.body.appendChild(document.createElement('div'));

    let promiseB;

    const promiseA = new Promise((resolveA, reject) => {
      promiseB = new Promise(resolveB => {
        try {
          // Render two iframes. each iframe should have the styles for the child injected into their head
          render(
            <div>
              <Frame>
                <FrameContextConsumer>
                  {({ document }) => (
                    <SheetInjector target={document!.head}>
                      <Child document={document!} resolve={resolveA} />
                    </SheetInjector>
                  )}
                </FrameContextConsumer>
              </Frame>
              <Frame>
                <FrameContextConsumer>
                  {({ document }) => (
                    <SheetInjector target={document!.head}>
                      <Child document={document!} resolve={resolveB} />
                    </SheetInjector>
                  )}
                </FrameContextConsumer>
              </Frame>
            </div>,
            { container: div }
          );
        } catch (e) {
          reject(e);
          div.parentElement!.removeChild(div);
        }
      });
    });
    await Promise.all([promiseA, promiseB]);
    div.parentElement!.removeChild(div);
  });

  // https://github.com/styled-components/styled-components/issues/2973
  it('should inject common styles into both the main document and a child frame', async () => {
    expect.hasAssertions();

    const CommonTitle = styled.h1`
      color: palevioletred;
    `;

    // Injects the stylesheet into the document available via context
    const SheetInjector = ({ children, target }: any) => (
      <StyleSheetManager target={target}>{children}</StyleSheetManager>
    );

    class Main extends Component<{ children: React.ReactNode; document: Document }> {
      override componentDidMount() {
        const style = this.props.document.querySelector('style') as HTMLStyleElement;

        expect(style?.sheet?.cssRules[0].cssText.includes(`palevioletred`)).toEqual(true);
      }

      override render() {
        return this.props.children;
      }
    }

    class Child extends Component<{ document: Document }> {
      override componentDidMount() {
        const style = this.props.document.querySelector('style') as HTMLStyleElement;

        expect(style?.sheet?.cssRules[0].cssText.includes(`palevioletred`)).toEqual(true);
      }

      override render() {
        return <CommonTitle />;
      }
    }

    const div = document.body.appendChild(document.createElement('div'));

    render(
      <Main document={document}>
        <div>
          <CommonTitle />
          <Frame>
            <FrameContextConsumer>
              {({ document }) => (
                <SheetInjector target={document!.head}>
                  <Child document={document!} />
                </SheetInjector>
              )}
            </FrameContextConsumer>
          </Frame>
        </div>
      </Main>,
      { container: div }
    );

    div.parentElement!.removeChild(div);
  });

  it('passing `enableVendorPrefixes` to StyleSheetManager works', () => {
    const Test = styled.div`
      display: flex;
    `;

    render(
      <StyleSheetManager enableVendorPrefixes>
        <Test>Foo</Test>
      </StyleSheetManager>
    );

    expect(getRenderedCSS()).toMatchInlineSnapshot(
      `
      ".b {
        display: flex;
      }"
    `
    );
  });

  it('passing default shouldForwardProp via StyleSheetManager works', () => {
    const Test = styled.div<{ foo?: boolean; bar?: boolean }>`
      padding-left: 5px;
    `;

    const { container } = render(
      <StyleSheetManager shouldForwardProp={p => (p === 'foo' ? false : true)}>
        <Test foo bar>
          Foo
        </Test>
      </StyleSheetManager>
    );

    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="sc-a b"
        >
          Foo
        </div>
      </div>
    `);
  });

  it('passing stylis plugins via StyleSheetManager works', () => {
    const Test = styled.div`
      padding-left: 5px;
    `;

    render(
      <StyleSheetManager stylisPlugins={[stylisRTLPlugin]}>
        <Test>Foo</Test>
      </StyleSheetManager>
    );

    expect(getRenderedCSS()).toMatchInlineSnapshot(`
      ".b {
        padding-right: 5px;
      }"
    `);
  });

  it('an error is emitted if unnamed stylis plugins are provided', () => {
    const Test = styled.div`
      padding-left: 5px;
    `;

    const cachedName = stylisRTLPlugin.name;
    Object.defineProperty(stylisRTLPlugin, 'name', { value: undefined });

    expect(() =>
      render(
        <StyleSheetManager stylisPlugins={[stylisRTLPlugin]}>
          <Test>Foo</Test>
        </StyleSheetManager>
      )
    ).toThrowError();

    Object.defineProperty(stylisRTLPlugin, 'name', { value: cachedName });
  });

  it('changing stylis plugins via StyleSheetManager works', async () => {
    const Test = styled.div`
      padding-left: 5px;
    `;

    const { container, rerender } = render(
      <StyleSheetManager stylisPlugins={[stylisRTLPlugin]}>
        <Test>Foo</Test>
      </StyleSheetManager>
    );

    expect(document.head.innerHTML).toMatchInlineSnapshot(
      `"<style data-styled="active" data-styled-version="JEST_MOCK_VERSION"></style>"`
    );
    expect(getRenderedCSS()).toMatchInlineSnapshot(`
      ".b {
        padding-right: 5px;
      }"
    `);

    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="sc-a b"
        >
          Foo
        </div>
      </div>
    `);

    await act(() =>
      rerender(
        <StyleSheetManager>
          <Test>Foo</Test>
        </StyleSheetManager>
      )
    );

    // note that the old styles are not removed since the condition may appear where they're used again
    expect(getRenderedCSS()).toMatchInlineSnapshot(
      `
      ".b {
        padding-right: 5px;
      }
      .c {
        padding-left: 5px;
      }"
    `
    );

    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="sc-a c"
        >
          Foo
        </div>
      </div>
    `);

    await act(() =>
      rerender(
        <StyleSheetManager stylisPlugins={[stylisRTLPlugin]}>
          <Test>Foo</Test>
        </StyleSheetManager>
      )
    );

    // no new dynamic classes are added, reusing the prior one
    expect(getRenderedCSS()).toMatchInlineSnapshot(`
      ".b {
        padding-right: 5px;
      }
      .c {
        padding-left: 5px;
      }"
    `);

    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="sc-a b"
        >
          Foo
        </div>
      </div>
    `);
  });

  it('subtrees with different stylis configs should not conflict', () => {
    const Test = styled.div`
      padding-left: 5px;
    `;

    const { container } = render(
      <div>
        <Test>Bar</Test>
        <StyleSheetManager stylisPlugins={[stylisRTLPlugin]}>
          <Test>Foo</Test>
        </StyleSheetManager>
      </div>
    );

    expect(getRenderedCSS()).toMatchInlineSnapshot(`
      ".b {
        padding-left: 5px;
      }
      .c {
        padding-right: 5px;
      }"
    `);

    expect(container).toMatchInlineSnapshot(`
      <div>
        <div>
          <div
            class="sc-a b"
          >
            Bar
          </div>
          <div
            class="sc-a c"
          >
            Foo
          </div>
        </div>
      </div>
    `);
  });

  it('passing a namespace to StyleSheetManager works', () => {
    const Test = styled.div`
      display: flex;
    `;

    render(
      <StyleSheetManager namespace="#foo">
        <Test>Foo</Test>
      </StyleSheetManager>
    );

    expect(getRenderedCSS()).toMatchInlineSnapshot(`
      "#foo .b {
        display: flex;
      }"
    `);
  });

  it('nested StyleSheetManager with different namespaces works', () => {
    const Test = styled.div`
      padding-left: 5px;
    `;

    const Test2 = styled.div`
      background: red;
    `;

    render(
      <StyleSheetManager namespace="#foo">
        <div>
          <Test>Foo</Test>
          <StyleSheetManager namespace="#bar">
            <Test2>Bar</Test2>
          </StyleSheetManager>
        </div>
      </StyleSheetManager>
    );

    expect(getRenderedCSS()).toMatchInlineSnapshot(`
      "#foo .c {
        padding-left: 5px;
      }
      #bar .d {
        background: red;
      }"
    `);
  });

  it('namespaced StyleSheetManager works with ampersand selector', () => {
    const Test = styled.div`
      padding-top: 5px;
      .child & {
        padding-top: 10px;
      }
    `;

    render(
      <StyleSheetManager namespace=".parent">
        <div>
          <Test>Foo</Test>
          <div className="child">
            <Test>Foo Bar</Test>
          </div>
        </div>
      </StyleSheetManager>
    );

    expect(getRenderedCSS()).toMatchInlineSnapshot(`
      ".parent .b {
        padding-top: 5px;
      }
      .parent .child .b {
        padding-top: 10px;
      }"
    `);
  });

  it('namespaced StyleSheetManager works with ampersand selector (complex)', () => {
    const Test = styled.div`
      color: red;
      .child2 &,
      .child & {
        color: green;
      }
    `;

    render(
      <StyleSheetManager namespace=".parent">
        <div>
          <Test>Foo</Test>
          <div className="child">
            <Test>Foo Bar</Test>
          </div>
          <div className="child2">
            <Test>Foo Bar</Test>
          </div>
        </div>
      </StyleSheetManager>
    );

    expect(getRenderedCSS()).toMatchInlineSnapshot(`
      ".parent .b {
        color: red;
      }
      .parent .child2 .b, .parent .child .b {
        color: green;
      }"
    `);
  });

  it('namespaced StyleSheetManager works with ampersand selector and media queries', () => {
    const Test = styled.div`
      color: red;
      .child2 &,
      .child & {
        color: green;
      }
      @media (min-width: 768px) {
        color: blue;
        .child2 &,
        .child & {
          color: cyan;
        }
      }
    `;

    render(
      <StyleSheetManager namespace=".parent">
        <div>
          <Test>Foo</Test>
          <div className="child">
            <Test>Foo Bar</Test>
          </div>
          <div className="child2">
            <Test>Foo Bar</Test>
          </div>
        </div>
      </StyleSheetManager>
    );

    expect(getRenderedCSS()).toMatchInlineSnapshot(`
      ".parent .b {
        color: red;
      }
      .parent .child2 .b, .parent .child .b {
        color: green;
      }
      @media (min-width:768px) {
        .parent .b {
          color: blue;
        }
        .parent .child2 .b, .parent .child .b {
          color: cyan;
        }
      }"
    `);
  });
});
