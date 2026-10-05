# CI/CD status

Audience: automation/release engineers. Last inspected: 2026-09-13.

FACT: no active CI configuration was found in the current root, Chat or Meet trees. Root .gitlab-ci.yml and infrastructure workflow files are already deleted in the working tree. Do not restore the removed application's pipelines or describe GitLab hosting as proof that pipelines run.

Current automation is limited to package scripts, Dockerfile build steps and VPS deploy scripts. Meet Docker build runs typecheck/tests/build. Chat Docker generates Prisma and runs migrations on startup; it does not run unit tests during image build.

PROPOSED: independent Chat/Meet pipelines with lockfile install, typecheck, tests, dependency audit, image build, immutable artifact upload, and separately authorized environment deployment. Runner capabilities, protected branches, secret storage, registry, triggers, approvals and rollback ownership are NEEDS HUMAN DECISION. No release publishing or package-publishing job is implemented.

Related: [testing](testing.md), [dependencies](dependencies.md), [release](release.md).
