declare module '@babel/helper-module-imports' {
  import { NodePath, types } from '@babel/core';

  export function addDefault(
    program: NodePath,
    identifier: types.Identifier,
    options: Object
  ): types.Identifier;

  export function addNamed(
    program: NodePath,
    name: string,
    identifier: types.Identifier,
    options: Object
  ): types.Identifier;
}

declare module '@emotion/unitless' {
  export default {} as { [key: string]: boolean };
}

declare module 'babel-plugin-styled-components' {
  export default function ({ types: any }): {
    inherits: any;
    visitor: any;
  };
}
