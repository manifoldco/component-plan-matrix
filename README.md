# @manifoldco/manifold-plan-table

![Built With Stencil](https://img.shields.io/badge/-Built%20With%20Stencil-16161d.svg?logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE5LjIuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1MTIgNTEyOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI%2BCjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI%2BCgkuc3Qwe2ZpbGw6I0ZGRkZGRjt9Cjwvc3R5bGU%2BCjxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik00MjQuNywzNzMuOWMwLDM3LjYtNTUuMSw2OC42LTkyLjcsNjguNkgxODAuNGMtMzcuOSwwLTkyLjctMzAuNy05Mi43LTY4LjZ2LTMuNmgzMzYuOVYzNzMuOXoiLz4KPHBhdGggY2xhc3M9InN0MCIgZD0iTTQyNC43LDI5Mi4xSDE4MC40Yy0zNy42LDAtOTIuNy0zMS05Mi43LTY4LjZ2LTMuNkgzMzJjMzcuNiwwLDkyLjcsMzEsOTIuNyw2OC42VjI5Mi4xeiIvPgo8cGF0aCBjbGFzcz0ic3QwIiBkPSJNNDI0LjcsMTQxLjdIODcuN3YtMy42YzAtMzcuNiw1NC44LTY4LjYsOTIuNy02OC42SDMzMmMzNy45LDAsOTIuNywzMC43LDkyLjcsNjguNlYxNDEuN3oiLz4KPC9zdmc%2BCg%3D%3D&colorA=16161d&style=flat-square)

## Getting Started

Place the following HTML where you’d like the component to appear (this works in any JS framework,
or even no framework!):

```html
<manifold-init client-id="[my client ID]"></manifold-init>
<manifold-plan-table product-id="[my product ID]" client-id="[my client ID]"></manifold-plan-table>
```

Note that the [`<manifold-init>`][manifold-init] component is required **once per page** for any
other Manifold Web Components you embed.

### Option 1: Manifold CDN

Place the following at the very beginning of the `<body>` tag:

```html
<!-- modern browsers -->
<script async type="module" src="https://js.cdn.manifold.co/@manifoldco/manifold-init/dist/manifold-init/manifold-init.esm.js" ></script>
<script async type="module" src="https://js.cdn.manifold.co/@manifoldco/manifold-plan-table/dist/manifold-plan-table/manifold-plan-table.esm.js" ></script>

<!-- legacy browsers -->
<script nomodule src="https://js.cdn.manifold.co/@manifoldco/manifold-init/dist/manifold-init/manifold-init.js" ></script>
<script nomodule src="https://js.cdn.manifold.co/@manifoldco/manifold-plan-table/dist/manifold-plan-table.js" ></script>
```

Place this component’s CSS in your `<head>` tag (optional if you want to write your own styles):

```html
<link rel="stylesheet" href="https://js.cdn.manifold.co/@manifoldco/manifold-plan-table/dist/manifold-plan-table/manifold-plan-table.css" />
```

### Option 2: npm

Alternately, if you build your site with npm using webpack, create-react-app, etc., run:

```bash
npm install @manifoldco/manifold-init @manifoldco/manifold-plan-table
```

And add the following code to your application, ideally to your entry file so it’s loaded as early
as possible:

```js
import('@manifoldco/manifold-init/loader').then(({ defineCustomElements }) => defineCustomElements(window));
import('@manifoldco/manifold-plan-table/loader').then(({ defineCustomElements }) => defineCustomElements(window));
```

Also import the CSS file in a way that works for your setup (for example, webpack):

```js
import '@manifoldco/manifold-plan-table/dist/manifold-plan-table/manifold-plan-table.css';
```

This libary is built using [Stencil][stencil]. For more information about integrating with your
site, please refer to the latest [framework docs][stencil-framework].

## Options

Options are passed to the component in the form of HTML Attributes:

| Name         | Required | Description                                                                                                     | Example                                                             |
| :----------- | :------: | :-------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------ |
| `product-id` |    Y     | Your Product’s identifier                                                                                       | `<manifold-plan-table product-id="234qkjvrptpy3thna4qttwt7m2nf6">` |
| `client-id`  |    Y     | Your Account identifier (this helps us associate analytics to your account)                                     | `<manifold-plan-table client-id="284ablb7scfm8oxwz9wrxpt2q0jii">`  |
| `base-url`   |          | The URL the buttons link to (plan ID & user selection will be appended to the end of the URL in a query string) | `<manifold-plan-table base-url="/checkout">`                       |
| `cta-text`   |          | Change the ”Getting Started” default text.                                                                      | `<manifold-plan-table cta-text="Buy Now!">`                        |

## Using in TypeScript + JSX

This Web Component works in all frameworks & environments, but if you’re using within a React &
TypeScript setup, you’ll also need the following config.

Create a `custom-elements.d.ts` file anywhere in your project that’s within `tsconfig.json`’s
[includes][tsconfig-includes] property:

```ts
import { Components, JSX as LocalJSX } from '@manifoldco/manifold-plan-table/loader';
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

[manifold-init]: https://github.com/manifoldco/manifold-init
[stencil-framework]: https://stenciljs.com/docs/overview
[stencil]: https://stenciljs.com/docs/introduction
[tsconfig-includes]: https://www.typescriptlang.org/docs/handbook/tsconfig-json.html#examples
