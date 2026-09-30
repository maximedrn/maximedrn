import { PortraitInput } from "@test/portrait.constants.ts";
import { Effect } from "effect";
import Sharp from "sharp";

const coloredImage: Effect.Effect<Buffer> = Effect.promise(
  (): Promise<Buffer> =>
    Sharp(Buffer.from(PortraitInput.pixels), {
      raw: { ...PortraitInput.small, channels: PortraitInput.channels },
    })
      .png()
      .toBuffer(),
);

export { coloredImage };
