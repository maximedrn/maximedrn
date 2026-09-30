import { expect, it } from "bun:test";
import { Xml } from "@test/fixtures.constants.ts";
import { attribute, parseXml } from "@test/fixtures.ts";
import { ProfileCases, ProfileExpected } from "@test/profile.constants.ts";
import type { Element } from "@xmldom/xmldom";
import { Effect } from "effect";
import { ProfileCopy } from "@/lib/profile/profile.constants.ts";
import { renderReadme } from "@/lib/readme/readme.service.ts";

it(
  ProfileCases.readme,
  (): Promise<void> =>
    Effect.runPromise(
      Effect.gen(function* () {
        const markup: string = yield* renderReadme();
        const image: Element = parseXml(markup);
        expect(image.tagName).toBe(Xml.tags.img);
        expect(attribute(image, Xml.attributes.src)).toBe(
          ProfileExpected.image,
        );
        expect(attribute(image, Xml.attributes.alt)).toContain(
          ProfileCopy.role,
        );
        expect(markup).toContain(ProfileExpected.altEscape);
      }),
    ),
);
