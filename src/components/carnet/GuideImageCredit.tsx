import type { LocalGuide } from "@/lib/local-guides";

export function GuideImageCredit({
  credit,
  className = "",
}: {
  credit?: LocalGuide["coverCredit"];
  className?: string;
}) {
  if (!credit) return null;
  return (
    <p className={`text-[10px] leading-5 ${className}`}>
      ©{" "}
      {credit.authorUrl ? (
        <a href={credit.authorUrl} className="underline">
          {credit.author}, {new URL(credit.authorUrl).hostname}
        </a>
      ) : (
        credit.author
      )}
      {" · "}
      <a href={credit.sourceUrl} className="underline">
        Wikimedia Commons
      </a>
      {" · "}
      <a href={credit.licenseUrl} className="underline">
        {credit.license}
      </a>
    </p>
  );
}
