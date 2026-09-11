<!--
Sync Impact Report
- Version change: (template, unversioned) → 1.0.0
- Modified principles: n/a (initial ratification, no prior concrete principles existed)
- Added sections:
  - Core Principles: I. Code Quality, II. Testing Standards (NON-NEGOTIABLE),
    III. User Experience Consistency, IV. Performance Requirements
  - Quality Gates
  - Development Workflow
  - Governance
- Removed sections: Principle V slot (template default of 5 principles reduced to the
  4 explicitly requested — code quality, testing standards, UX consistency, performance)
- Templates requiring follow-up: none blocking. Dependent templates
  (.specify/templates/plan-template.md, spec-template.md, tasks-template.md) are read at
  runtime and were not modified by this command per the scope guard; review them next time
  they are used to confirm their Constitution Check / gate sections still line up with the
  principles below.
- Deferred placeholders / TODOs:
  - TODO(TEST_COVERAGE_TARGET): no numeric coverage baseline exists yet (project has no
    code at time of ratification). Set an explicit minimum once a baseline is measured.
  - TODO(PERFORMANCE_BUDGETS): no concrete latency/throughput/resource budgets exist yet.
    Define per-feature budgets in each plan.md until product-wide budgets are established.
-->

# HelloWorld Constitution
<!-- Project name inferred from the repository path (helloworld.valdir.dev.br/helloworld);
     update this heading directly if a different project name should be used. -->

## Core Principles

### I. Code Quality
All code MUST pass linting and static analysis before merge; suppressing a warning or rule
requires an inline comment explaining why. Every function or module MUST have a single, clear
responsibility — if a change requires a comment to explain *what* the code does, the code MUST
be restructured or better named instead. At least one other person MUST review a change before
it merges to the main branch; when working solo, the author MUST review the diff against a
checklist (correctness, readability, no dead code, no unjustified complexity) before merging.
Naming, formatting, and file/module structure MUST follow the conventions already established
elsewhere in the codebase — consistency beats local preference.

**Rationale**: Unreviewed, inconsistent, or unexplained code accumulates hidden defects and
slows every future change; a small, enforced bar at merge time is cheaper than debugging
production issues later.

### II. Testing Standards (NON-NEGOTIABLE)
New functionality MUST ship with automated tests covering its happy path and its known critical
edge cases; a feature without a test is not considered done. Every bug fix MUST include a
regression test that fails against the old code and passes against the fix. The full automated
test suite MUST run in CI and MUST be green before a merge is allowed — a failing or skipped
test blocks the merge, it does not get overridden. Test coverage MUST NOT decrease from its
current level on any merge (a ratchet, not a fixed target) until an explicit numeric minimum is
adopted (see TODO(TEST_COVERAGE_TARGET) above).

**Rationale**: Tests are the only mechanism that lets the project change code quickly without
re-verifying everything by hand; a red or shrinking suite is a silent authorization to ship
regressions.

### III. User Experience Consistency
User-facing terminology, interaction patterns, and visual components MUST be reused across the
product; a new feature MUST NOT introduce a new pattern for something an existing pattern
already solves without explicit justification recorded in the feature's plan. Error messages
shown to users MUST be clear, actionable, and consistent in tone and format with existing
messages. Any UI work MUST respect basic accessibility (keyboard operability, sufficient color
contrast, semantic markup) — this is not optional polish. Changing an established user-facing
flow in a breaking way MUST include a stated rationale and, where feasible, a migration or
communication path for existing users.

**Rationale**: Users build muscle memory and trust from consistency; unannounced or gratuitous
UX divergence is a support and retention cost that is easy to avoid up front and expensive to
fix after the fact.

### IV. Performance Requirements
Any feature that is user-facing or sits on a hot path MUST state its expected performance
budget (response time, throughput, or resource usage) before implementation begins, recorded in
the feature's plan (see TODO(PERFORMANCE_BUDGETS) above for the current lack of product-wide
defaults). Changes to performance-sensitive code MUST be measured — benchmarked or profiled —
before and after the change; a measured regression MUST be either justified in the plan's
Complexity Tracking section or reverted before merge. Optimization work MUST be driven by
measurement, not speculation — do not add complexity for a performance gain that has not been
demonstrated to matter.

**Rationale**: Performance problems are far cheaper to prevent with a stated budget and a
measurement habit than to diagnose after users notice degradation in production.

## Quality Gates

The four principles above are enforced through concrete, automatic gates rather than good
intentions: continuous integration MUST run linting, the full test suite, and any defined
performance checks on every change before it can merge; a required human review MUST approve
the change; and none of these gates may be bypassed without an explicit, recorded exception
(who approved it, and why) in the pull request or plan.

## Development Workflow

Feature work follows the Spec Kit flow: specify → clarify (as needed) → plan → tasks →
implement. Each artifact (`spec.md`, `plan.md`, `tasks.md`) MUST reflect the principles in this
constitution — for example, a plan MUST name its testing approach and, where Principle IV
applies, its performance budget. Any deviation from a principle MUST be written down and
justified in the plan's Complexity Tracking (or equivalent) section rather than silently
dropped; an unjustified deviation is a defect in the plan, not an acceptable shortcut.

## Governance

This constitution supersedes any informal or undocumented practice; where the two conflict, the
constitution wins unless it is formally amended. Amending it requires: (1) a written rationale
for the change, (2) a version bump following semantic versioning — MAJOR for a backward
incompatible principle removal or redefinition, MINOR for a new principle or materially
expanded guidance, PATCH for wording/clarification fixes — and (3) a check of whether dependent
templates (plan, spec, tasks, checklist) need updating to stay consistent, performed the next
time those templates are used. Every pull request and code review MUST verify compliance with
these principles; a non-compliant change MUST either be fixed before merge or carry an explicit,
recorded exception with a reason. Complexity that cannot be justified against these principles
MUST be simplified rather than merged.

**Version**: 1.0.0 | **Ratified**: 2026-09-10 | **Last Amended**: 2026-09-10
