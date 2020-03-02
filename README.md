# @manifoldco/component-plan-matrix

![Built With Stencil](https://img.shields.io/badge/-Built%20With%20Stencil-16161d.svg?logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE5LjIuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1MTIgNTEyOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI%2BCjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI%2BCgkuc3Qwe2ZpbGw6I0ZGRkZGRjt9Cjwvc3R5bGU%2BCjxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik00MjQuNywzNzMuOWMwLDM3LjYtNTUuMSw2OC42LTkyLjcsNjguNkgxODAuNGMtMzcuOSwwLTkyLjctMzAuNy05Mi43LTY4LjZ2LTMuNmgzMzYuOVYzNzMuOXoiLz4KPHBhdGggY2xhc3M9InN0MCIgZD0iTTQyNC43LDI5Mi4xSDE4MC40Yy0zNy42LDAtOTIuNy0zMS05Mi43LTY4LjZ2LTMuNkgzMzJjMzcuNiwwLDkyLjcsMzEsOTIuNyw2OC42VjI5Mi4xeiIvPgo8cGF0aCBjbGFzcz0ic3QwIiBkPSJNNDI0LjcsMTQxLjdIODcuN3YtMy42YzAtMzcuNiw1NC44LTY4LjYsOTIuNy02OC42SDMzMmMzNy45LDAsOTIuNywzMC43LDkyLjcsNjguNlYxNDEuN3oiLz4KPC9zdmc%2BCg%3D%3D&colorA=16161d&style=flat-square)

## Getting Started

Place the following HTML where you’d like the component to appear (this works in any JS framework,
or even no framework!):

```html
<manifold-plan-matrix></manifold-plan-matrix>
```

### Option 1: Manifold CDN

Next place the following at the very beginning of the `<body>` tag:

```html
<!-- modern browsers -->
<script type="module">
  import(
    'https://js.cdn.manifold.co/@manifoldco/component-plan-matrix/loader/index.mjs'
  ).then(({ defineCustomElements }) => defineCustomElements(window));
</script>
<!-- legacy browsers -->
<script
  nomodule
  src="https://js.cdn.manifold.co/@manifoldco/component-plan-matrix/dist/manifold-plan-matrix.js"
></script>
```

### Option 2: npm

Alternately, if you build your site with npm using webpack, create-react-app, etc., run:

```bash
npm install @manifoldco/component-plan-matrix
```

And add the following code to your application, ideally to your entry file so it’s loadded as early
as possible:

```js
import('@manifoldco/component-plan-matrix/loader').then(({ defineCustomElements }) =>
  defineCustomElements(window)
);
```

This libary is built using [Stencil][stencil]. For more information about integrating with your
site, please refer to the latest [framework docs][stencil-framework].

## Using in TypeScript + JSX

This Web Component works in all frameworks & environments, but if you’re using within a React &
TypeScript setup, you’ll also need the following config.

Create a `custom-elements.d.ts` file anywhere in your project that’s within `tsconfig.json`’s
[includes][tsconfig-includes] property:

```ts
import { Components, JSX as LocalJSX } from '@manifoldco/component-plan-matrix/loader';
import { DetailedHTMLProps, HTMLAttributes } from 'react';

type StencilProps<T> = {
  [P in keyof T]?: Omit<T[P], 'ref'>;
};

type ReactProps<T> = {
  [P in keyof T]?: DetailedHTMLProps<HTMLAttributes<T[P]>, T[P]>;
};

type StencilToReact<T = LocalJSX.IntrinsicElements, U = HTMLElementTagNameMap> = StencilProps<T> &
  ReactProps<U>;

declare global {
  export namespace JSX {
    interface IntrinsicElements extends StencilToReact {}
  }
}
```

[stencil]: https://stenciljs.com/docs/introduction
[stencil-framework]: https://stenciljs.com/docs/overview
[tsconfig-includes]: https://www.typescriptlang.org/docs/handbook/tsconfig-json.html#examples
