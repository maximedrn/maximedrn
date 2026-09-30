import type { RenderableComponent } from "@maximedrn/react-to-svg";
import { TailwindFixture } from "@test/tailwind.constants.ts";
import type { ReactNode } from "react";

const TailwindPanel: RenderableComponent = (): ReactNode => (
  <div className={TailwindFixture.classes.root}>
    <div
      className={TailwindFixture.classes.child}
      style={TailwindFixture.style}
    />
    <div
      className={TailwindFixture.classes.child}
      style={TailwindFixture.style}
    />
  </div>
);

export { TailwindPanel };
