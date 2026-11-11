declare module "mocha" {
  export function describe(title: string, fn: () => void): void;
  export function it(title: string, fn: () => void | Promise<unknown>): void;
  export function before(fn: () => void | Promise<unknown>): void;
  export function beforeEach(fn: () => void | Promise<unknown>): void;
  export function after(fn: () => void | Promise<unknown>): void;
  export function afterEach(fn: () => void | Promise<unknown>): void;
}

declare function describe(title: string, fn: () => void): void;
declare function it(title: string, fn: () => void | Promise<unknown>): void;
declare function before(fn: () => void | Promise<unknown>): void;
declare function beforeEach(fn: () => void | Promise<unknown>): void;
declare function after(fn: () => void | Promise<unknown>): void;
declare function afterEach(fn: () => void | Promise<unknown>): void;
