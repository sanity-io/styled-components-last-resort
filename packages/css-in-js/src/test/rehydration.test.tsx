import { render } from '@testing-library/react';
import { SC_ATTR, SC_ATTR_VERSION } from '../constants';
import { getRenderedCSS, rehydrateTestStyles, resetStyled, seedNextClassnames } from './utils';

declare const __VERSION__: string;

/* NOTE:
   Sometimes we add an empty function interpolation into some
   styled-components to skip the static optimisation in
   ComponentStyle. This will look like this:
   ${() => ''}
   */
let styled: ReturnType<typeof resetStyled>;
let keyframes: Awaited<typeof import('../constructors/keyframes')>['default'];

describe('rehydration', () => {
  /**
   * Make sure the setup is the same for every test
   */
  beforeEach(async () => {
    keyframes = (await import('../constructors/keyframes')).default;
    styled = resetStyled();
  });

  describe('with existing styled components', () => {
    beforeEach(() => {
      document.head.innerHTML = `
        <style ${SC_ATTR} ${SC_ATTR_VERSION}="${__VERSION__}">
          .b { color: red; }/*!sc*/
          ${SC_ATTR}.g1[id="TWO"]{content: "b,"}/*!sc*/
        </style>
      `;

      rehydrateTestStyles();
    });

    it('should preserve the styles', () => {
      expect(getRenderedCSS()).toMatchInlineSnapshot(`
        ".b {
          color: red;
        }"
      `);
    });

    it('should append a new component like normal', () => {
      const Comp = styled.div.withConfig({ componentId: 'ONE' })`
        color: blue;
        ${() => ''}
      `;
      render(<Comp />);
      expect(getRenderedCSS()).toMatchInlineSnapshot(`
        ".b {
          color: red;
        }
        .a {
          color: blue;
        }"
      `);
    });

    it('should reuse a componentId', () => {
      const A = styled.div.withConfig({ componentId: 'ONE' })`
        color: blue;
        ${() => ''}
      `;
      render(<A />);
      const B = styled.div.withConfig({ componentId: 'TWO' })``;
      render(<B />);
      expect(getRenderedCSS()).toMatchInlineSnapshot(`
        ".b {
          color: red;
        }
        .a {
          color: blue;
        }"
      `);
    });

    it('should reuse a componentId and generated class', () => {
      const A = styled.div.withConfig({ componentId: 'ONE' })`
        color: blue;
        ${() => ''}
      `;
      render(<A />);
      const B = styled.div.withConfig({ componentId: 'TWO' })`
        color: red;
        ${() => ''}
      `;
      render(<B />);
      expect(getRenderedCSS()).toMatchInlineSnapshot(`
        ".b {
          color: red;
        }
        .a {
          color: blue;
        }"
      `);
    });

    it('should reuse a componentId and inject new classes', () => {
      const A = styled.div.withConfig({ componentId: 'ONE' })`
        color: blue;
        ${() => ''}
      `;
      render(<A />);
      const B = styled.div.withConfig({ componentId: 'TWO' })`
        color: ${() => 'red'};
      `;
      render(<B />);
      const C = styled.div.withConfig({ componentId: 'TWO' })`
        color: ${() => 'green'};
      `;
      render(<C />);
      expect(getRenderedCSS()).toMatchInlineSnapshot(`
        ".b {
          color: red;
        }
        .c {
          color: green;
        }
        .a {
          color: blue;
        }"
      `);
    });
  });

  describe('with styled components with props', () => {
    beforeEach(() => {
      /* Hash 1323611362 is based on name TWO and contents color: red.
       * Change either and this will break. */
      document.head.innerHTML = `
        <style ${SC_ATTR} ${SC_ATTR_VERSION}="${__VERSION__}">
          .a { color: blue; }/*!sc*/
          ${SC_ATTR}.g1[id="ONE"]{content: "a,"}/*!sc*/
          .b { color: red; }/*!sc*/
          ${SC_ATTR}.g2[id="TWO"]{content: "b,"}/*!sc*/
        </style>
      `;

      rehydrateTestStyles();
    });

    it('should preserve the styles', () => {
      expect(getRenderedCSS()).toMatchInlineSnapshot(`
        ".a {
          color: blue;
        }
        .b {
          color: red;
        }"
      `);
    });

    it('should not inject new styles for a component already rendered', () => {
      const Comp = styled.div.withConfig({ componentId: 'ONE' })`
        color: ${props => props.color};
      `;
      render(<Comp color="blue" />);
      expect(getRenderedCSS()).toMatchInlineSnapshot(`
        ".a {
          color: blue;
        }
        .b {
          color: red;
        }"
      `);
    });

    it('should inject new styles for a new computed style of a component', () => {
      seedNextClassnames(['x']);
      const Comp = styled.div.withConfig({ componentId: 'ONE' })`
        color: ${props => props.color};
      `;
      render(<Comp color="green" />);
      expect(getRenderedCSS()).toMatchInlineSnapshot(`
        ".a {
          color: blue;
        }
        .x {
          color: green;
        }
        .b {
          color: red;
        }"
      `);
    });
  });

  describe('with inline styles that werent rendered by us', () => {
    beforeEach(() => {
      /* Same css as before, but without the data attributes we ignore it */
      document.head.innerHTML = `
        <style>
          .b { color: red; }/*!sc*/
          ${SC_ATTR}.g2[id="TWO"]{content: "b,"}/*!sc*/
        </style>
      `;

      rehydrateTestStyles();
    });

    it('should leave the existing styles there', () => {
      expect(getRenderedCSS()).toMatchInlineSnapshot(`
        ".b {
          color: red;
        }
        data-styled.g2[id="TWO"] {
          content: "b,";
        }"
      `);
    });
  });

  describe('with all styles already rendered', () => {
    beforeEach(() => {
      document.head.innerHTML = `
        <style ${SC_ATTR} ${SC_ATTR_VERSION}="${__VERSION__}">
          .a { color: blue; }/*!sc*/
          ${SC_ATTR}.g1[id="ONE"]{content: "a,"}/*!sc*/
          .b { color: red; }/*!sc*/
          ${SC_ATTR}.g2[id="TWO"]{content: "b,"}/*!sc*/
        </style>
      `;

      rehydrateTestStyles();
    });

    it('should not touch existing styles', () => {
      expect(getRenderedCSS()).toMatchInlineSnapshot(`
        ".a {
          color: blue;
        }
        .b {
          color: red;
        }"
      `);
    });

    it('should not change styles if rendered in the same order they were created with', () => {
      const A = styled.div.withConfig({ componentId: 'ONE' })`
        color: blue;
      `;
      render(<A />);
      const B = styled.div.withConfig({ componentId: 'TWO' })`
        color: red;
      `;
      render(<B />);

      expect(getRenderedCSS()).toMatchInlineSnapshot(`
        ".a {
          color: blue;
        }
        .b {
          color: red;
        }"
      `);
    });

    it('should still not change styles if rendered in a different order', () => {
      seedNextClassnames(['d', 'a', 'b', 'c']);

      const B = styled.div.withConfig({ componentId: 'TWO' })`
        color: red;
      `;
      render(<B />);
      const A = styled.div.withConfig({ componentId: 'ONE' })`
        color: blue;
      `;
      render(<A />);

      expect(getRenderedCSS()).toMatchInlineSnapshot(`
        ".a {
          color: blue;
        }
        .b {
          color: red;
        }
        .d {
          color: red;
        }"
      `);
    });
  });

  describe('with keyframes', () => {
    beforeEach(() => {
      document.head.innerHTML = `
        <style ${SC_ATTR} ${SC_ATTR_VERSION}="${__VERSION__}">
          @-webkit-keyframes keyframe_880 {from {opacity: 0;}}/*!sc*/
          @keyframes keyframe_880 {from {opacity: 0;}}/*!sc*/
          ${SC_ATTR}.g1[id="sc-keyframes-keyframe_880"]{content: "keyframe_880,"}/*!sc*/
        </style>
      `;

      rehydrateTestStyles();
    });

    it('should not touch existing styles', () => {
      expect(getRenderedCSS()).toMatchInlineSnapshot(`
        "@-webkit-keyframes keyframe_880 {
          from {
            opacity: 0;
          }
        }
        @keyframes keyframe_880 {
          from {
            opacity: 0;
          }
        }"
      `);
    });

    it('should not regenerate keyframes', () => {
      seedNextClassnames(['keyframe_880']);

      const fadeIn = keyframes`
        from { opacity: 0; }
      `;

      const A = styled.div`
        animation: ${fadeIn} 1s both;
        ${() => ''}
      `;

      render(<A />);

      expect(getRenderedCSS()).toMatchInlineSnapshot(`
        "@-webkit-keyframes keyframe_880 {
          from {
            opacity: 0;
          }
        }
        @keyframes keyframe_880 {
          from {
            opacity: 0;
          }
        }
        .b {
          animation: keyframe_880 1s both;
        }"
      `);
    });

    it('should still inject new keyframes', () => {
      seedNextClassnames(['keyframe_144']);

      const fadeOut = keyframes`
        from { opacity: 1; }
      `;

      const A = styled.div`
        animation: ${fadeOut} 1s both;
        ${() => ''}
      `;

      render(<A />);

      expect(getRenderedCSS()).toMatchInlineSnapshot(`
        "@-webkit-keyframes keyframe_880 {
          from {
            opacity: 0;
          }
        }
        @keyframes keyframe_880 {
          from {
            opacity: 0;
          }
        }
        .b {
          animation: keyframe_144 1s both;
        }
        @keyframes keyframe_144 {
          from {
            opacity: 1;
          }
        }"
      `);
    });

    it('should pass the keyframes name along as well', () => {
      seedNextClassnames(['keyframe_880', 'keyframe_144']);

      const fadeIn = keyframes`
        from { opacity: 0; }
      `;
      const fadeOut = keyframes`
        from { opacity: 1; }
      `;
      const A = styled.div`
        animation: ${fadeIn} 1s both;
        ${() => ''}
      `;
      const B = styled.div`
        animation: ${fadeOut} 1s both;
        ${() => ''}
      `;

      /* Purposely rendering out of order to make sure the output looks right */
      render(<B />);
      render(<A />);

      expect(getRenderedCSS()).toMatchInlineSnapshot(`
        "@-webkit-keyframes keyframe_880 {
          from {
            opacity: 0;
          }
        }
        @keyframes keyframe_880 {
          from {
            opacity: 0;
          }
        }
        .d {
          animation: keyframe_880 1s both;
        }
        .c {
          animation: keyframe_144 1s both;
        }
        @keyframes keyframe_144 {
          from {
            opacity: 1;
          }
        }"
      `);
    });

    it('should pass the keyframes name through props along as well', () => {
      seedNextClassnames(['keyframe_880', 'keyframe_144']);

      const fadeIn = keyframes`
        from { opacity: 0; }
      `;
      const fadeOut = keyframes`
        from { opacity: 1; }
      `;
      const A = styled.div<{ $animation: typeof fadeIn }>`
        animation: ${props => props.$animation} 1s both;
      `;
      const B = styled.div<{ $animation: typeof fadeOut }>`
        animation: ${props => props.$animation} 1s both;
      `;

      /* Purposely rendering out of order to make sure the output looks right */
      render(<B $animation={fadeOut} />);
      render(<A $animation={fadeIn} />);

      expect(getRenderedCSS()).toMatchInlineSnapshot(`
        "@-webkit-keyframes keyframe_880 {
          from {
            opacity: 0;
          }
        }
        @keyframes keyframe_880 {
          from {
            opacity: 0;
          }
        }
        .d {
          animation: keyframe_880 1s both;
        }
        .c {
          animation: keyframe_144 1s both;
        }
        @keyframes keyframe_144 {
          from {
            opacity: 1;
          }
        }"
      `);
    });
  });
});
