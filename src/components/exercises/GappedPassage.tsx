import type { ReactNode } from "react";

/**
 * Renders a passage containing "(1)___" style gap markers, splitting on
 * paragraph breaks ("\n\n") and replacing each marker with whatever
 * `renderGap` returns for that gap number.
 */
export function GappedPassage({
  passage,
  renderGap,
}: {
  passage: string;
  renderGap: (gapNumber: number) => ReactNode;
}) {
  const paragraphs = passage.split("\n\n");
  const gapPattern = /\((\d+)\)___/g;

  return (
    <div className="flex flex-col gap-4 text-[15px] leading-7">
      {paragraphs.map((paragraph, pIndex) => {
        const parts: ReactNode[] = [];
        let lastIndex = 0;
        let match: RegExpExecArray | null;
        gapPattern.lastIndex = 0;
        while ((match = gapPattern.exec(paragraph))) {
          if (match.index > lastIndex) {
            parts.push(paragraph.slice(lastIndex, match.index));
          }
          const num = Number(match[1]);
          parts.push(
            <span key={`gap-${num}`} className="inline-block">
              {renderGap(num)}
            </span>
          );
          lastIndex = match.index + match[0].length;
        }
        if (lastIndex < paragraph.length) {
          parts.push(paragraph.slice(lastIndex));
        }
        return <p key={pIndex}>{parts}</p>;
      })}
    </div>
  );
}
