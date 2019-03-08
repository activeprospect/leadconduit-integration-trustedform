# Change Log
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org)

## [1.9.5] - 2019-03-08
### Fixed
- Updated icon for current branding

## [1.9.2] - 2018-06-26
### Fixed
- Handle null geo data

## [1.9.1] - 2018-06-13
### Fixed
- Now fails when required text is included and snapshot is missing
- Now appends warnings array

## [1.9.0] - 2018-04-09
### Added
- Parse 404 errors returned by bad cert hashes
- Add `how_many_required_matched` appended data

## [1.8.0] - 2018-04-05
### Added
- Add error message for expiration errors (410)

## [1.7.0] - 2018-03-22
### Added
- Add support for user-provided api key

## [1.6.1] - 2018-01-31
### Added
- Changed cert URL validation (fixes #48)

## [1.6.0] - 2018-01-10
### Added
- Add support for setting custom vendor name (fixes #46)

## [1.5.1] - 2018-01-08
### Added
- Convert to JS

## [1.5.0] - 2018-01-05
### Added
- Capture duration data from TF api

## [1.4.0] - 2017-07-20
### Added
- Support scanning for multiple terms

## [1.3.2] - 2017-04-17
### Fixed
- fixed to use single cert URL when multiple provided (fixes #37)

## [1.3.0] - 2017-03-08
### Added
- added append of `share_url` (fixes #35)

### Fixed
- fix parsing error when 503 & HTML returned (fixes #30)

## [1.0.0] - 2015-01-14
### Added
- initial implementation
