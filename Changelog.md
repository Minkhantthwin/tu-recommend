# Changelog

## Unreleased

### Added

- Add an application-flow check covering program eligibility and duplicate comparison choices.
- Add full backend and client system documentation covering architecture, flows, APIs, data model, setup, security, and current integration gaps.
- Add a thesis-focused plan for a database-grounded DeepSeek recommendation chatbot, with pgvector deferred until unstructured document search is needed.

### Changed

- Restrict recommendations and application choices to active programs that meet all matriculation requirements.
- Require complete profile and matriculation data before submission, and prevent matriculation changes while an application is active.
- Validate route parameters, recommendation queries, choice uniqueness, and interest uniqueness.

### Fixed

- Preserve combined application filters, validate final program choices during updates and submission, and generate collision-resistant application numbers.
- Enforce valid review transitions, active-program quotas, and consistent accepted-program and rejection data.
- Replace user interests atomically and return response bodies with successful interest updates.
- Treat missing biology scores as ineligible when programs require biology.
