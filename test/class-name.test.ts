import { describe, expect, it } from "bun:test";
import { ClassNameCases, ClassNameSuite } from "@test/class-name.constants.ts";
import { Effect } from "effect";
import { cn } from "@/lib/class-name.ts";

describe(ClassNameSuite, (): void => {
  for (const scenario of ClassNameCases) {
    it(
      scenario.name,
      (): Promise<void> =>
        Effect.runPromise(
          Effect.gen(function* () {
            const classes: string = yield* Effect.sync((): string =>
              cn(...scenario.inputs),
            );
            expect(classes).toBe(scenario.expected);
          }),
        ),
    );
  }
});
