import {
  ClickScrollPlugin,
  OverlayScrollbars,
  type OverflowBehavior,
  type PartialOptions,
  type ScrollbarsAutoHideBehavior,
} from "overlayscrollbars";

export type ScrollAxis = "y" | "x" | "both";

let pluginsRegistered = false;

export function ensureOverlayScrollbarsPlugins(): void {
  if (typeof window === "undefined" || pluginsRegistered) return;
  OverlayScrollbars.plugin(ClickScrollPlugin);
  pluginsRegistered = true;
}

const AXIS_OVERFLOW: Record<ScrollAxis, { x: OverflowBehavior; y: OverflowBehavior }> = {
  y: { x: "hidden", y: "scroll" },
  x: { x: "scroll", y: "visible-hidden" },
  both: { x: "scroll", y: "scroll" },
};

export function createScrollbarOptions(
  axis: ScrollAxis = "y",
  autoHide: ScrollbarsAutoHideBehavior = "leave"
): PartialOptions {
  return {
    paddingAbsolute: false,
    showNativeOverlaidScrollbars: false,
    overflow: AXIS_OVERFLOW[axis],
    scrollbars: {
      theme: "os-theme-portal",
      visibility: "auto",
      autoHide,
      autoHideDelay: 500,
      autoHideSuspend: false,
      dragScroll: true,
      clickScroll: true,
      pointers: ["mouse", "touch", "pen"],
    },
  };
}

export const BODY_SCROLLBAR_OPTIONS: PartialOptions = createScrollbarOptions("y", "scroll");
