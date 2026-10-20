# Content and language

Use a calm, direct voice. Name the object and the action, then supply the detail
someone needs to decide. The Content foundation in Gallery demonstrates these
rules with real shared components.

## Actions and terminology

- Use sentence case. Prefer “Save changes”, “Invite teammate”, and “Delete project”.
- Give one object one name across navigation, headings, fields, and feedback.
- Keep labels meaningful on their own. Icon-only actions need an accessible name.
- Keep essential instructions visible; placeholders disappear when someone types.
- Describe unavailable actions when the reason helps someone proceed.

## Errors, confirmation, and feedback

Explain what needs attention and how to fix it. Put field errors beside the input
and connect them with its accessible description. Preserve the person's entry.
For a failed save, explain what remains unsaved and offer a retry when supported.
Do not expose internal exception messages as product copy.

Confirm consequential actions with the affected object and the actual outcome.
“Delete Design library? Its files will be removed for everyone.” Pair that with
“Cancel” and “Delete project”. Do not claim an action is reversible unless it is.

Use polite status announcements for completion and result counts. Reserve alerts
for errors that need immediate attention. Avoid announcing an entire list again
when only a small detail changes. Empty states should explain the situation and
offer a useful next action, including clearing filters when appropriate.

## Long content

Wrap labels, errors, and primary actions. Allow cards and fields to grow with text.
Truncate only secondary content where space requires it, and provide the full
content through an accessible disclosure or detail view. A title attribute alone
is insufficient for touch and keyboard access. Keep full values in semantic markup.

## Translation and regional formatting

Keep complete sentences together, with named placeholders. Avoid building a
translated sentence from separately translated fragments. Dates, currencies,
numbers, plural forms, and reading direction are independent decisions; a currency
must come from product data, not a guess based only on the locale.

ThemeProvider supplies locale, direction, and shared messages. English and Arabic
shared-control dictionaries are included. Other locales use English shared copy
unless the consumer supplies `messages`; React Aria still handles its supported
date/number/control translations for the chosen locale. Product content is always
provided by the consuming app. See [customization](CUSTOMIZATION.md).

Test translated content with long labels, real date and currency formats, RTL,
keyboard navigation, and enlarged text. Native controls and validation can expose
browser-provided messages; explicit application error text remains the app's responsibility.
