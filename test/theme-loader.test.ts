import { describe, expect, it } from "bun:test";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { Encoding } from "@test/fixtures.constants.ts";
import { temporaryDirectory } from "@test/fixtures.ts";
import {
  LoaderCases,
  LoaderFiles,
  LoaderModule,
  ThemeCss,
} from "@test/theme.constants.ts";
import { type Cause, Effect } from "effect";
import themeLoader from "@/lib/theme/theme.loader.ts";
import type { ThemeLoaderContext } from "@/lib/theme/theme.types.ts";

interface StylesheetModule {
  readonly stylesheet: string;
}

const evaluateModule = (source: string): Promise<StylesheetModule> =>
  import(
    `${LoaderModule.dataPrefix}${Buffer.from(source).toString(Encoding.base64)}`
  );

describe(LoaderCases.suite, (): void => {
  it(
    LoaderCases.reload,
    (): Promise<void> =>
      Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const directory: string = yield* temporaryDirectory;
            const css: string = join(directory, LoaderFiles.css);
            yield* Effect.promise(() =>
              mkdir(dirname(css), { recursive: true }),
            );
            yield* Effect.promise(
              (): Promise<void> => writeFile(css, ThemeCss.valid),
            );
            const dependencies: string[] = [];
            const context: ThemeLoaderContext = {
              addDependency: (file: string): void => {
                dependencies.push(file);
              },
              resourcePath: join(directory, LoaderFiles.source),
            };
            const first: StylesheetModule = yield* Effect.promise(() =>
              evaluateModule(themeLoader.call(context)),
            );
            expect(first.stylesheet).toBe(ThemeCss.valid);
            expect(dependencies).toContain(css);
            yield* Effect.promise(
              (): Promise<void> => writeFile(css, ThemeCss.cascade),
            );
            const changed: StylesheetModule = yield* Effect.promise(() =>
              evaluateModule(themeLoader.call(context)),
            );
            expect(changed.stylesheet).toBe(ThemeCss.cascade);
          }),
        ),
      ),
  );
  it(
    LoaderCases.missing,
    (): Promise<void> =>
      Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const directory: string = yield* temporaryDirectory;
            const context: ThemeLoaderContext = {
              addDependency: (): void => undefined,
              resourcePath: join(directory, LoaderFiles.source),
            };
            const failure: Cause.UnknownException = yield* Effect.flip(
              Effect.try((): string => themeLoader.call(context)),
            );
            expect(failure.cause).toBeInstanceOf(Error);
          }),
        ),
      ),
  );
});
