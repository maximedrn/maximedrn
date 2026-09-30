import "server-only";
import type { RenderError } from "@maximedrn/react-to-svg";
import { Effect } from "effect";
import {
  PreviewErrors,
  PreviewMetrics,
} from "@/lib/preview/preview.constants.ts";
import {
  type PreviewState,
  PreviewStatus,
} from "@/lib/preview/preview.types.ts";
import { ProfileAssets } from "@/lib/profile/profile.constants.ts";
import { renderProfile } from "@/lib/profile/profile.service";

/**
 * Loads the preview state by rendering the profile SVG and returning the
 * appropriate status and message.
 *
 * @returns {Effect.Effect<PreviewState>} An effect that resolves to the
 *   preview state, either ready with the SVG source or error with a message.
 */
const loadPreview = (): Effect.Effect<PreviewState> =>
  renderProfile(ProfileAssets.source).pipe(
    Effect.tapError(Effect.logError),
    Effect.match({
      onFailure: (error: Error | RenderError): PreviewState => ({
        message: PreviewErrors.render(error.message),
        status: PreviewStatus.error,
      }),
      onSuccess: (svg: string): PreviewState => ({
        source: `${PreviewMetrics.mediaType}${Buffer.from(svg).toString("base64")}`,
        status: PreviewStatus.ready,
      }),
    }),
  );

export { loadPreview };
