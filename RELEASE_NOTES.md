RAG-image-expert Release Notes

Date: 2025-12-03T17:35:28.672Z

Summary
-------
Standardized and annotated Git tags to follow semantic versioning and provide clear release metadata. Lightweight tags v0.4 and v0.5 were replaced with annotated tags v0.4.0 and v0.5.0, old tags removed locally and from origin, and the new tags pushed to the remote repository.

Tag mapping and SHAs
--------------------
- v0.1.0  47324bb7d27b24a209eb80c2da09601fa64bcfb8
  - v0.1: Original efficient baseline (6 docs, 2,205 lines)

- v0.2.0  2ed92770bc3f50287c1df5087fe194971658f316
  - v0.2: Expanded with Instagram & multi-model (8 docs, 4,168 lines)

- v0.3.0  6d27c6671537e6a3b113800360e1a0d2adaf503a
  - v0.3: Production release - unified system (10 docs, 5,983 lines)

- v0.4.0  fefea38fa332f6be544cdeb5eaf2a8be60908035
  - Created from lightweight tag v0.4 (commit c891b52c69620891b960deea7e143b26fe0a894c)
  - Message: "Release v0.4.0: standardized semantic versioning; created from tag v0.4"

- v0.5.0  1346415fff8a4df77561f6989d877a941c132f8c
  - Created from lightweight tag v0.5 (commit c891b52c69620891b960deea7e143b26fe0a894c)
  - Message: "Release v0.5.0: standardized semantic versioning; created from tag v0.5"

Notes and rationale
-------------------
- Reason: Semantic versioning (MAJOR.MINOR.PATCH) is clearer for users and release tooling; annotated tags include release notes for auditing and automation.
- Both v0.4 and v0.5 were lightweight tags pointing at internal commits; creating annotated v0.4.0 and v0.5.0 provides context and consistent format.

Actions performed
-----------------
1. Created annotated tags v0.4.0 and v0.5.0 from the commits referenced by the old tags.
2. Deleted lightweight tags v0.4 and v0.5 locally.
3. Deleted lightweight tags v0.4 and v0.5 on origin (remote).
4. Pushed annotated tags v0.4.0 and v0.5.0 to origin.

Verification
------------
To verify locally:
- git fetch --tags
- git tag -n

To verify on remote (GitHub):
- Visit the repository tags page: https://github.com/ROI-DANINO/RAG-image-expert/tags

Next steps
----------
- Consider adding short CHANGELOG entries per release (for v0.4.0 and v0.5.0) summarizing user-visible changes.
- If the project uses CI/CD or package releases tied to tags, update pipelines to rely on annotated tags where appropriate.

Contact
-------
If anything looks incorrect (wrong commits or tag messages), contact the maintainer to revert or re-create tags.

v0.5.0 Release
--------------
Date: 2025-12-03T17:36:29.060Z

Summary
-------
- Tag v0.5.0 was created and pushed to origin to standardize semantic versioning.

Details
-------
- Tag: v0.5.0
- SHA: 1346415fff8a4df77561f6989d877a941c132f8c

Suggested changelog
-------------------
Please add user-facing change bullets here (features, fixes, breaking changes) so downstream users can see what changed in v0.5.0.

Verification
------------
- git fetch --tags && git tag -n | grep v0.5.0

