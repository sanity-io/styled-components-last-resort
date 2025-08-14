import { JSX } from 'react';
import { SC_ATTR, SC_ATTR_VERSION, SC_VERSION } from '../constants';
import StyleSheet from '../sheet';
import styledError from '../utils/error';
import { joinStringArray } from '../utils/joinStrings';
import getNonce from '../utils/nonce';
import { StyleSheetManager } from './StyleSheetManager';

export default class ServerStyleSheet {
  instance: StyleSheet;
  sealed: boolean;

  constructor() {
    this.instance = new StyleSheet({ isServer: true });
    this.sealed = false;
  }

  _emitSheetCSS = (): string => {
    const css = this.instance.toString();
    if (!css) return '';
    const nonce = getNonce();
    const attrs = [
      nonce && `nonce="${nonce}"`,
      `${SC_ATTR}="true"`,
      `${SC_ATTR_VERSION}="${SC_VERSION}"`,
    ];
    const htmlAttr = joinStringArray(attrs.filter(Boolean) as string[], ' ');

    return `<style ${htmlAttr}>${css}</style>`;
  };

  collectStyles(children: any): JSX.Element {
    if (this.sealed) {
      throw styledError(2);
    }

    return <StyleSheetManager sheet={this.instance}>{children}</StyleSheetManager>;
  }

  getStyleTags = (): string => {
    if (this.sealed) {
      throw styledError(2);
    }

    return this._emitSheetCSS();
  };

  getStyleElement = () => {
    if (this.sealed) {
      throw styledError(2);
    }

    const css = this.instance.toString();
    if (!css) return [];

    const props = {
      [SC_ATTR]: '',
      [SC_ATTR_VERSION]: SC_VERSION,
      dangerouslySetInnerHTML: {
        __html: css,
      },
    };

    const nonce = getNonce();
    if (nonce) {
      (props as any).nonce = nonce;
    }

    // v4 returned an array for this fn, so we'll do the same for v5 for backward compat
    return [<style {...props} key="sc-0-0" />];
  };

  seal = (): void => {
    this.sealed = true;
  };
}
