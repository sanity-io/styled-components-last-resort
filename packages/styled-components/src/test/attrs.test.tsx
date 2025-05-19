import * as CSS from 'csstype';
import { render } from '@testing-library/react';
import ThemeProvider from '../models/ThemeProvider';
import { AnyComponent, DataAttributes } from '../types';
import { getRenderedCSS, resetStyled } from './utils';
import { Component } from 'react';

// Disable isStaticRules optimisation since we're not
// testing for ComponentStyle specifics here
vi.mock('../utils/isStaticRules', () => ({ default: () => false }));

let styled: ReturnType<typeof resetStyled>;

describe('attrs', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn');
    styled = resetStyled();
  });

  it('work fine with an empty object', () => {
    const Comp = styled.div.attrs({})``;
    expect(render(<Comp />).container).toMatchSnapshot();
  });

  it('work fine with a function that returns an empty object', () => {
    const Comp = styled.div.attrs(() => ({}))``;
    expect(render(<Comp />).container).toMatchSnapshot();
  });

  it('pass a simple attr via object', () => {
    const Comp = styled.button.attrs({
      type: 'button',
    })``;
    expect(render(<Comp />).container).toMatchSnapshot();
  });

  it('pass a simple attr via function with object return', () => {
    const Comp = styled.button.attrs(() => ({
      type: 'button',
    }))``;
    expect(render(<Comp />).container).toMatchSnapshot();
  });

  it('pass a React component', () => {
    class ReactComponent extends Component {
      override render() {
        return <p>React Component</p>;
      }
    }

    type ButtonProps = {
      component: AnyComponent;
    };

    const Button = ({ component: ChildComponent }: ButtonProps) => (
      <button>
        <ChildComponent />
      </button>
    );

    const Comp = styled(Button).attrs<Partial<ButtonProps>>(() => ({
      component: ReactComponent,
    }))``;

    expect(render(<Comp />).container).toMatchSnapshot();
  });

  it('should not call a function passed to attrs as an object value', () => {
    const stub = vi.fn(() => 'div');

    const Comp = styled.button.attrs<{ foo?: typeof stub }>(() => ({
      foo: stub,
    }))``;

    render(<Comp />);

    expect(stub).not.toHaveBeenCalled();
  });

  it('function form allows access to theme', () => {
    const Comp = styled.button.attrs<DataAttributes>(props => ({
      'data-color': props.theme!.color,
    }))``;

    expect(
      render(
        <ThemeProvider theme={{ color: 'red' }}>
          <Comp />
        </ThemeProvider>
      ).container
    ).toMatchInlineSnapshot(`
      <div>
        <button
          class="sc-a"
          data-color="red"
        />
      </div>
    `);
  });

  it('defaultProps are merged into what function attrs receives', () => {
    const Comp = styled.button.attrs<DataAttributes>(props => ({
      'data-color': props.theme!.color,
    }))``;

    Comp.defaultProps = {
      theme: {
        color: 'red',
      },
    };

    expect(render(<Comp />).container).toMatchInlineSnapshot(`
      <div>
        <button
          class="sc-a"
          data-color="red"
        />
      </div>
    `);
  });

  it('pass props to the attr function', () => {
    const Comp = styled.button.attrs<{ $submit?: boolean }>(p => ({
      type: p.$submit ? 'submit' : 'button',
    }))``;

    expect(render(<Comp />).container).toMatchSnapshot();
    expect(render(<Comp $submit />).container).toMatchSnapshot();
  });

  it('should replace props with attrs', () => {
    const Comp = styled.button.attrs<{ $submit?: boolean }>(p => ({
      type: p.$submit ? 'submit' : 'button',
      tabIndex: 0,
    }))``;

    expect(render(<Comp />).container).toMatchSnapshot();
    expect(render(<Comp type="reset" />).container).toMatchSnapshot();
    expect(render(<Comp type="reset" tabIndex={-1} />).container).toMatchSnapshot();
  });

  it('should merge className', () => {
    const Comp = styled.div.attrs(() => ({
      className: 'meow nya',
    }))``;

    expect(render(<Comp />).container).toMatchSnapshot();
  });

  it('should merge className from folded attrs', () => {
    const Inner = styled.div.attrs({ className: 'foo' })``;

    const Comp = styled(Inner).attrs(() => ({
      className: 'meow nya',
    }))``;

    expect(render(<Comp className="something" />).container).toMatchInlineSnapshot(`
      <div>
        <div
          class="sc-a sc-b foo meow nya something"
        />
      </div>
    `);
  });

  it('should merge className even if its a function', () => {
    const Comp = styled.div.attrs<{ $purr?: boolean }>(p => ({
      className: `meow ${p.$purr ? 'purr' : 'nya'}`,
    }))``;

    expect(render(<Comp />).container).toMatchSnapshot();
    expect(render(<Comp $purr />).container).toMatchSnapshot();
  });

  it('should merge style', () => {
    const Comp = styled.div.attrs(() => ({
      style: { color: 'red', background: 'blue' },
    }))``;

    expect(render(<Comp style={{ color: 'green', borderStyle: 'dotted' }} />).container)
      .toMatchInlineSnapshot(`
        <div>
          <div
            class="sc-a"
            style="color: red; border-style: dotted; background: blue;"
          />
        </div>
      `);
  });

  it('should work with data and aria attributes', () => {
    const Comp = styled.div.attrs<DataAttributes>(() => ({
      'data-foo': 'bar',
      'aria-label': 'A simple FooBar',
    }))``;
    expect(render(<Comp />).container).toMatchSnapshot();
  });

  it('merge attrs', () => {
    const Comp = styled.button
      .attrs(() => ({
        type: 'button',
        tabIndex: 0,
      }))
      .attrs(() => ({
        type: 'submit',
      }))``;
    expect(render(<Comp />).container).toMatchSnapshot();
  });

  it('merge attrs when inheriting SC', () => {
    const Parent = styled.button.attrs(() => ({
      type: 'button',
      tabIndex: 0,
    }))``;
    const Child = styled(Parent).attrs(() => ({
      type: 'submit',
    }))``;
    expect(render(<Child />).container).toMatchSnapshot();
  });

  it('pass attrs to style block', () => {
    /* Would be a React Router Link in real life */
    const Comp = styled.a.attrs<DataAttributes>(() => ({
      href: '#',
      'data-active-class-name': '--is-active',
    }))`
      color: blue;
      &.${props => props['data-active-class-name']} {
        color: red;
      }
    `;
    expect(render(<Comp />).container).toMatchSnapshot();
    expect(getRenderedCSS()).toMatchInlineSnapshot(`
      ".b {
        color: blue;
      }
      .b.--is-active {
        color: red;
      }"
    `);
  });

  it('should pass through children as a normal prop', () => {
    const Comp = styled.div.attrs(() => ({
      children: 'Probably a bad idea',
    }))``;
    expect(render(<Comp />).container).toMatchSnapshot();
  });

  it('should pass through complex children as well', () => {
    const Comp = styled.div.attrs(() => ({
      children: <span>Probably a bad idea</span>,
    }))``;
    expect(render(<Comp />).container).toMatchSnapshot();
  });

  it('should override children of course', () => {
    const Comp = styled.div.attrs(() => ({
      children: <span>Amazing</span>,
    }))``;
    expect(render(<Comp>Something else</Comp>).container).toMatchSnapshot();
  });

  it('should shallow merge "style" prop + attr instead of overwriting', () => {
    const Paragraph = styled.p.attrs<{ $fontScale?: number }>(p => ({
      style: {
        ...p.style,
        fontSize: `${p.$fontScale}em`,
      },
    }))<{ $fontScale: number }>`
      background: red;
    `;

    class Text extends Component<
      Partial<React.ComponentProps<typeof Paragraph>>,
      { fontScale: number }
    > {
      override state = {
        // Assume that will be changed automatically
        // according to the dimensions of the container
        fontScale: 4,
      };

      override render() {
        return (
          <Paragraph $fontScale={this.state.fontScale} {...this.props}>
            {this.props.children}
          </Paragraph>
        );
      }
    }

    const BlueText = styled(Text).attrs(() => ({
      style: {
        color: 'blue',
      },
    }))`
      background: blue;
    `;

    const rendered = render(<BlueText>Hello</BlueText>);

    expect(getRenderedCSS()).toMatchInlineSnapshot(`
      ".d {
        background: red;
      }
      .c {
        background: blue;
      }"
    `);
    expect(rendered.container).toMatchInlineSnapshot(`
      <div>
        <p
          class="sc-a d sc-b c"
          style="color: blue; font-size: 4em;"
        >
          Hello
        </p>
      </div>
    `);
  });

  it('does not pass transient props to HTML element', () => {
    type CompProps = { $textColor: CSS.Properties['color'] };

    const Comp = styled.div<CompProps>`
      color: ${props => props.$textColor};
    `;

    const StyledComp = styled(Comp).attrs<Partial<CompProps>>(() => ({
      $textColor: 'red',
    }))``;

    expect(render(<StyledComp />).container).toMatchSnapshot();
  });

  it('should apply given "as" prop to the progressive type', () => {
    const Comp = styled.div.attrs({ as: 'video' as const })``;

    expect(render(<Comp loop />).container).toMatchSnapshot();
  });

  it('aliasing an alternate theme via attrs makes it through to the child component', () => {
    const InnerComp: React.FC<{ theme: object }> = p => <div {...p} />;

    const Comp = styled(InnerComp).attrs<{ alternateTheme: object | undefined }>(p => ({
      alternateTheme: undefined,
      theme: p.alternateTheme!,
    }))``;

    expect(render(<Comp alternateTheme={{ foo: 'bar' }} />).container).toMatchSnapshot();
  });
});
