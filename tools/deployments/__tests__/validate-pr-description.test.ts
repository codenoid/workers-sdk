import { describe, expect, it } from "vitest";
import { validateDescription } from "../validate-pr-description";

describe("validateDescription()", () => {
	it("should skip validation with the `skip-pr-description-validation` label", () => {
		expect(
			validateDescription("", "", '["skip-pr-description-validation"]', "[]")
		).toHaveLength(0);
	});

	it("should show errors with default template + TODOs checked", () => {
		expect(
			validateDescription(
				"",
				`## What this PR solves / how to test

Fixes #[insert GH or internal issue number(s)].

## Author has addressed the following

- Tests
  - [ ] TODO (before merge)
  - [ ] Tests included
  - [ ] Tests not necessary because:
- E2E Tests CI Job required? (Use "e2e" label or ask maintainer to run separately)
  - [ ] I don't know
  - [ ] Required
  - [ ] Not required because:
- Public documentation
  - [x] TODO (before merge)
  - [ ] Cloudflare docs PR(s): <!--e.g. <https://github.com/cloudflare/cloudflare-docs/pull/>...-->
  - [ ] Documentation not necessary because:
`,
				"[]",
				"[]"
			)
		).toMatchInlineSnapshot(`
			[
			  "All TODO checkboxes in your PR description must be unchecked before merging",
			  "Your PR must include tests, or provide justification for why no tests are required",
			  "Your PR must run E2E tests, or provide justification for why running them is not required",
			  "Your PR doesn't include a changeset. Either include one (following the instructions in CONTRIBUTING.md) or add the 'no-changeset-required' label to bypass this check. Most PRs should have a changeset, so only bypass this check if your change should not cause a release of any packages.",
			  "Your PR must include documentation (in the form of a link to a Cloudflare Docs issue or PR), or provide justification for why no documentation is required",
			]
		`);
	});

	it("should bypass changesets check with label", () => {
		expect(
			validateDescription(
				"",
				`## What this PR solves / how to test

Fixes #[insert GH or internal issue number(s)].

## Author has addressed the following

- Tests
  - [ ] TODO (before merge)
  - [x] Tests included
  - [ ] Tests not necessary because:
- E2E Tests CI Job required? (Use "e2e" label or ask maintainer to run separately)
  - [ ] I don't know
  - [ ] Required
  - [x] Not required because: test
- Public documentation
  - [ ] TODO (before merge)
  - [ ] Cloudflare docs PR(s): <!--e.g. <https://github.com/cloudflare/cloudflare-docs/pull/>...-->
  - [x] Documentation not necessary because: test
`,
				'["no-changeset-required"]',
				"[]"
			)
		).toHaveLength(0);
	});

	it("should accept everything included", () => {
		expect(
			validateDescription(
				"",
				`## What this PR solves / how to test

Fixes [AA-000](https://jira.cfdata.org/browse/AA-000).

## Author has addressed the following

- Tests
  - [ ] TODO (before merge)
  - [x] Tests included
  - [ ] Tests not necessary because:
- E2E Tests CI Job required? (Use "e2e" label or ask maintainer to run separately)
  - [ ] I don't know
  - [ ] Required
  - [x] Not required because: test
- Changeset ([Changeset guidelines](https://github.com/cloudflare/workers-sdk/blob/main/CONTRIBUTING.md#changesets))
  - [ ] TODO (before merge)
  - [x] Changeset included
  - [ ] Changeset not necessary because:
- Public documentation
  - [ ] TODO (before merge)
  - [x] Cloudflare docs PR(s): https://github.com/cloudflare/cloudflare-docs/pull/123
  - [ ] Documentation not necessary because:
`,
				"[]",
				'[".changeset/hello-world.md"]'
			)
		).toHaveLength(0);
	});

	it("should not accept e2e unknown", () => {
		expect(
			validateDescription(
				"",
				`## What this PR solves / how to test

Fixes [AA-000](https://jira.cfdata.org/browse/AA-000).

## Author has addressed the following

- Tests
  - [ ] TODO (before merge)
  - [x] Tests included
  - [ ] Tests not necessary because:
- E2E Tests CI Job required? (Use "e2e" label or ask maintainer to run separately)
  - [x] I don't know
  - [ ] Required
  - [ ] Not required because: test
- Changeset ([Changeset guidelines](https://github.com/cloudflare/workers-sdk/blob/main/CONTRIBUTING.md#changesets))
  - [ ] TODO (before merge)
  - [x] Changeset included
  - [ ] Changeset not necessary because:
- Public documentation
  - [ ] TODO (before merge)
  - [x] Cloudflare docs PR(s): https://github.com/cloudflare/cloudflare-docs/pull/123
  - [ ] Documentation not necessary because:
`,
				"[]",
				'[".changeset/hello-world.md"]'
			)
		).toMatchInlineSnapshot(`
			[
			  "Your PR cannot be merged with a status of \`I don't know\` for e2e tests. When your PR is reviewed by the Wrangler team they'll decide whether e2e tests need to be run",
			  "Your PR must run E2E tests, or provide justification for why running them is not required",
			]
		`);
	});

	it("should not accept e2e without e2e label", () => {
		expect(
			validateDescription(
				"",
				`## What this PR solves / how to test

Fixes [AA-000](https://jira.cfdata.org/browse/AA-000).

## Author has addressed the following

- Tests
  - [ ] TODO (before merge)
  - [x] Tests included
  - [ ] Tests not necessary because:
- E2E Tests CI Job required? (Use "e2e" label or ask maintainer to run separately)
  - [ ] I don't know
  - [x] Required
  - [ ] Not required because: test
- Changeset ([Changeset guidelines](https://github.com/cloudflare/workers-sdk/blob/main/CONTRIBUTING.md#changesets))
  - [ ] TODO (before merge)
  - [x] Changeset included
  - [ ] Changeset not necessary because:
- Public documentation
  - [ ] TODO (before merge)
  - [x] Cloudflare docs PR(s): https://github.com/cloudflare/cloudflare-docs/pull/123
  - [ ] Documentation not necessary because:
`,
				"[]",
				'[".changeset/hello-world.md"]'
			)
		).toMatchInlineSnapshot(`
			[
			  "Since your PR requires E2E tests to be run, it needs to have the \`e2e\` label applied on GitHub",
			]
		`);
	});

	it("should accept e2e with e2e label", () => {
		expect(
			validateDescription(
				"",
				`## What this PR solves / how to test

Fixes [AA-000](https://jira.cfdata.org/browse/AA-000).

## Author has addressed the following

- Tests
  - [ ] TODO (before merge)
  - [x] Tests included
  - [ ] Tests not necessary because:
- E2E Tests CI Job required? (Use "e2e" label or ask maintainer to run separately)
  - [ ] I don't know
  - [x] Required
  - [ ] Not required because: test
- Changeset ([Changeset guidelines](https://github.com/cloudflare/workers-sdk/blob/main/CONTRIBUTING.md#changesets))
  - [ ] TODO (before merge)
  - [x] Changeset included
  - [ ] Changeset not necessary because:
- Public documentation
  - [ ] TODO (before merge)
  - [x] Cloudflare docs PR(s): https://github.com/cloudflare/cloudflare-docs/pull/123
  - [ ] Documentation not necessary because:
`,
				'["e2e"]',
				'[".changeset/hello-world.md"]'
			)
		).toHaveLength(0);
	});

	it("should accept e2e with e2e label - uppercase X", () => {
		expect(
			validateDescription(
				"",
				`## What this PR solves / how to test

Fixes [AA-000](https://jira.cfdata.org/browse/AA-000).

## Author has addressed the following

- Tests
  - [ ] TODO (before merge)
  - [X] Tests included
  - [ ] Tests not necessary because:
- E2E Tests CI Job required? (Use "e2e" label or ask maintainer to run separately)
  - [ ] I don't know
  - [X] Required
  - [ ] Not required because: test
- Changeset ([Changeset guidelines](https://github.com/cloudflare/workers-sdk/blob/main/CONTRIBUTING.md#changesets))
  - [ ] TODO (before merge)
  - [X] Changeset included
  - [ ] Changeset not necessary because:
- Public documentation
  - [ ] TODO (before merge)
  - [X] Cloudflare docs PR(s): https://github.com/cloudflare/cloudflare-docs/pull/123
  - [ ] Documentation not necessary because:
`,
				'["e2e"]',
				'[".changeset/hello-world.md"]'
			)
		).toHaveLength(0);
	});
});
