-- Keep the Swiss lakes guide introduction concise and tool-focused.
UPDATE "Article"
SET
  "excerpt" = 'Un guide vérifié pour distinguer les lacs autorisés, les secteurs réglementés et les interdictions de kitesurf en Suisse.',
  "updatedAt" = CURRENT_TIMESTAMP
WHERE "slug" = 'kitesurf-lacs-suisses-autorise-interdit';
