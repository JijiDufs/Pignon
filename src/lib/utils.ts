import { createCn } from "cn/config";

/**
 * Class merging that knows Pignon's custom font sizes. Without this, `text-ui` and `text-2xs`
 * are taken for colours and silently dropped as soon as a text colour follows them.
 */
export const cn = createCn({
  extend: { classGroups: { "font-size": [{ text: ["ui", "2xs"] }] } },
});
