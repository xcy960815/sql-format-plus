declare function describe(name: string, fn: () => void): void

declare function it(name: string, fn: () => void): void

declare module 'assert' {
  type Assert = {
    equal(actual: unknown, expected: unknown, message?: string): void
    throws(block: () => unknown, error?: Error): void
  }

  const assert: Assert

  export = assert
}
