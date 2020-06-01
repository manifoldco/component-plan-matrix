# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added
- `preview` mode for loading mocked data

### Fixed
- `deepmerge` dependency missing which caused errors
- Default Button styling improved
- Input width made consistent
- Loading state styling improved
- Redirect to `base-url` on CTA click if one is specified.

## [0.4.0] - 2020-05-15
### Added
- Adds `init` and `update` event hooks for users

### Changed
- Updates Mercury design system

## [0.3.0] - 2020-04-17
### Changed
- Firing a CTAClick event when CTA is clicked
- Add version attribute to get latest product and plan versions (currently only works with "latest"
  value).

## [0.2.0] - 2020-04-01
### Changed
- Improved CSS delivery
- Better namespaced CSS with BEM `.mp-*` ➡️ `.ManifoldPlanTable__*`
- Now styles auto-update with the [Manifold Design System](https://github.com/manifoldco/mercury)

### Fixed
- Fixes `<select>` element alignment in Chrome

## [0.0.16] - 2020-03-30
### Changed
- Improved pricing tier display for metered features

### Fixed
- Fixed pricing tier overlapping numbers (e.g. for 0–100, 100—∞, `100` shouldn’t appear twice)

## 0.0.1 - 2020-03-18
### Added
- Initial release

[Unreleased]: https://github.com/manifoldco/manifold-plan-table/compare/v0.4.0...HEAD
[0.4.0]: https://github.com/manifoldco/manifold-plan-table/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/manifoldco/manifold-plan-table/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/manifoldco/manifold-plan-table/compare/v0.0.16...v0.2.0
[0.0.16]: https://github.com/manifoldco/manifold-plan-table/compare/v0.0.1...v0.0.16
