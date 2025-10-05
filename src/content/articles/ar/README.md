# Arabic Content (محتوى عربي)

This directory contains Arabic translations of educational articles.

## Directory Structure

```
ar/
├── anxiety-management/
├── cognitive-behavioral-therapy/
├── depression-support/
├── mindfulness-techniques/
├── mood-tracking/
├── relationship-patterns/
├── self-compassion/
└── stress-management/
```

## Adding Translated Content

1. Create the category directory if it doesn't exist
2. Copy the English markdown file from `/en/[category]/[slug].md`
3. Translate the content while keeping the frontmatter structure
4. Save as `ar/[category]/[slug].md`

## Frontmatter Requirements

Keep the same frontmatter as the English version:

```yaml
---
title: "Translated Title"
description: "Translated description"
slug: "same-slug-as-english"
category: "same-category"
contentType: "article"
intent: "informational"
keywords: ["keyword1", "keyword2"]
readingTime: 8
draft: false
# ... other fields
---
```

## Translation Guidelines

- Maintain the same slug as the English version
- Translate all content including headings and examples
- Keep markdown formatting consistent
- Preserve therapeutic terminology accuracy
- Use culturally appropriate examples when possible
