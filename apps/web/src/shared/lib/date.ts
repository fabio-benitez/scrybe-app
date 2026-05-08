import type { TFunction } from "i18next"

export function formatRelativeDate(
  value: string,
  locale: string,
  t: TFunction,
) {
  const date = new Date(value)
  const elapsedMs = Date.now() - date.getTime()
  const minuteMs = 60 * 1000
  const hourMs = 60 * minuteMs
  const dayMs = 24 * hourMs

  if (elapsedMs < minuteMs) {
    return t("dates.updatedAt.justNow")
  }

  if (elapsedMs > 7 * dayMs) {
    return t("dates.updatedAt.date", {
      date: new Intl.DateTimeFormat(locale, {
        dateStyle: "medium",
      }).format(date),
    })
  }

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "always" })
  let relativeTime: string

  if (elapsedMs < hourMs) {
    relativeTime = rtf.format(-Math.floor(elapsedMs / minuteMs), "minute")
  } else if (elapsedMs < dayMs) {
    relativeTime = rtf.format(-Math.floor(elapsedMs / hourMs), "hour")
  } else {
    relativeTime = rtf.format(-Math.floor(elapsedMs / dayMs), "day")
  }

  return t("dates.updatedAt.relative", { time: relativeTime })
}