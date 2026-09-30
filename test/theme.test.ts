import { describe, expect, it } from "bun:test";
import { ThemeCases, ThemeCss, ThemeExpected } from "@test/theme.constants.ts";
import { Effect } from "effect";
import { CssSyntaxError } from "postcss";
import { parseTheme } from "@/lib/theme/theme.service.ts";
import type { ThemePalettes } from "@/lib/theme/theme.types.ts";

describe(ThemeCases.suite, (): void => {
  it(
    ThemeCases.colors,
    (): Promise<void> =>
      Effect.runPromise(
        Effect.gen(function* () {
          const palettes: ThemePalettes = yield* parseTheme(ThemeCss.valid);
          expect(palettes.light).toEqual(ThemeExpected.light);
          expect(palettes.dark).toMatchObject(ThemeExpected.dark);
        }),
      ),
  );
  it(
    ThemeCases.cascade,
    (): Promise<void> =>
      Effect.runPromise(
        Effect.gen(function* () {
          const palettes: ThemePalettes = yield* parseTheme(
            ThemeCss.valid + ThemeCss.cascade,
          );
          expect(palettes.light.primary).toBe(ThemeExpected.override);
          expect(palettes.dark.primary).toBe(ThemeExpected.override);
          expect(palettes.dark.background).toBe(ThemeExpected.dark.background);
        }),
      ),
  );
  it(
    ThemeCases.incomplete,
    (): Promise<void> =>
      Effect.runPromise(
        Effect.gen(function* () {
          const failure: Error = yield* Effect.flip(
            parseTheme(ThemeCss.incomplete),
          );
          expect(failure.cause).toBeInstanceOf(Error);
        }),
      ),
  );
  it(
    ThemeCases.invalid,
    (): Promise<void> =>
      Effect.runPromise(
        Effect.gen(function* () {
          const failure: Error = yield* Effect.flip(
            parseTheme(ThemeCss.invalid),
          );
          expect(failure.cause).toBeInstanceOf(CssSyntaxError);
        }),
      ),
  );
});
