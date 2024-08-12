# Change Log
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org)

## [2.4.2] - 2024-08-12
### Added
- added "|" to be the default scan delimeter for TF version 4

## [2.4.0] - 2024-04-10
### Added
- v4 integration now supports optional api key mapping

## [2.3.6] - 2024-03-12
### Fixed
- v4 integration now appends `masked_cert_url` when present

## [2.3.5] - 2024-02-22
### Fixed
- fixed the loading screen an issue causing perpetual loading screens for old TF integrations ([sc-68876](https://app.shortcut.com/active-prospect/story/68876/leadconduit-trustedform-consent-integration-ui-issue))

## [2.3.4] - 2024-02-13
### Fixed
- fixed broken links in the RUI

## [2.3.3] - 2024-02-05
### Added
- added `amount_required_matched` field to v4 integration for requests with required scans ([sc-65371](https://app.shortcut.com/active-prospect/story/65371/trustedform-v4-page-scan-rule-improvements))
- PageScan required/forbidden text configuration screen. ([sc-65261](https://app.shortcut.com/active-prospect/story/65261/trustedform-v4-insights-add-on-ui-should-prompt-for-required-and-forbidden-scan-text))
- Add notice when account has no TF products available ([sc-67604](https://app.shortcut.com/active-prospect/story/67604/trustedform-v4-fix-add-on-ui-to-handle-no-products))

## [2.3.2] - 2024-01-19
### Fixed
- improvements to v4 UI styling ([sc-59650](https://app.shortcut.com/active-prospect/story/59650/trustedform-v4-improve-rich-ui-styling))

## [2.3.1] - 2024-01-10
### Fixed
- v4 `validate` function will properly handle missing `insights` vars ([sc-65226](https://app.shortcut.com/active-prospect/story/65226/trustedform-v4-insights-add-on-with-no-field-mappings-errors-in-validation))

## [2.3.0] - 2023-11-20
### Fixed
- Re-add fixed TrustedForm v4 Verify Add-On ([#105](https://github.com/activeprospect/leadconduit-integration-trustedform/pull/105), [sc-63442](https://app.shortcut.com/active-prospect/story/63442/trustedform-v4-add-verify-to-add-on))

## [2.2.2] - 2023-11-17
### Fixed
- Revert [#102](https://github.com/activeprospect/leadconduit-integration-trustedform/pull/102)

## [2.2.1] - 2023-11-17
### Fixed
- Page scan variables are now typed as arrays ([#103](https://github.com/activeprospect/leadconduit-integration-trustedform/pull/103))

## [2.2.0] - 2023-11-15
### Added
- TrustedForm v4 Verify Add-On ([sc-63442](https://app.shortcut.com/active-prospect/story/63442/trustedform-v4-add-verify-to-add-on))

## [2.1.1] - 2023-07-14
### Fixed
- Updated "Age" and "Age in Seconds" description for TF Inisights and TF Consent + Insights ([sc-48650](https://app.shortcut.com/active-prospect/story/48650/incorrect-description-for-age-in-the-trustedform-enhancements))

## [2.1.0] - 2023-06-20
### Added
- TrustedForm v4 Integration ([sc-50245](https://app.shortcut.com/active-prospect/story/50245/trustedform-v4-new-integration-trustedform))

## [2.0.3] - 2023-02-21
### Fixed
- `domain` data is now appended if returned as part of insights data

## [2.0.2] - 2023-01-05
### Fixed
- Revert previous change; make insights set `billable` again ([sc-47859](https://app.shortcut.com/active-prospect/story/47859/include-tf-insights-in-usages-results))

## [2.0.1] - 2022-12-14
### Fixed
- Issue with billable being set in insights ([sc-47158](https://app.shortcut.com/active-prospect/story/47158/tf-insights-missing-from-usages-exclusion-list))

## [2.0.0] - 2022-11-09
### Remove
- Remove Data Service after migration ([sc-38895](https://app.shortcut.com/active-prospect/story/38895/rename-trustedform-data-service-to-trustedform-insights-integration))

## [1.20.1] - 2022-11-02
### Fixed
- Name overlap with old Data Service and Insights pre-migration ([sc-38895](https://app.shortcut.com/active-prospect/story/38895/rename-trustedform-data-service-to-trustedform-insights-integration))

## [1.20.0] - 2022-10-27
### Changed
- Rename TrustedForm Data Service to TrustedForm Insights Integration ([sc-38895](https://app.shortcut.com/active-prospect/story/38895/rename-trustedform-data-service-to-trustedform-insights-integration))

## [1.19.0] - 2022-10-25
### Changed
- Rename TrustedForm Consent + Data Integration to TrustedForm Consent + Insights ([sc-41611](https://app.shortcut.com/active-prospect/story/41611/rename-trustedform-consent-data-integration-to-trustedform-consent-insights))

## [1.18.2] - 2022-03-23
### Fixed
- Allow TF staging ping URL in Data Service ([sc-37183](https://app.shortcut.com/active-prospect/story/sc-37183/allow-a-trustedform-ping-url-to-be-passed)) 

## [1.18.1] - 2022-03-12
### Fixed
- Changed Data Service integration to allow TF ping URL passed via `trustedform_cert_url` (& removed `trustedform_ping_url`; [sc-37183](https://app.shortcut.com/active-prospect/story/sc-37183/allow-a-trustedform-ping-url-to-be-passed)) 

## [1.18.0] - 2022-03-02
### Added
- Added support for `trustedform_ping_url` to the Data Service integration

## [1.17.3] - 2022-02-11
### Fixed
- Fixed to use new boolean field names (`is_masked` vs. `masked`, plus `is_mobile` & `is_framed`; [sc-35791](https://app.shortcut.com/active-prospect/story/35791/update-trustedform-consent-consent-data-expected-boolean-response-properties))

## [1.17.2] - 2021-12-21
### Added
- Added support for `scan_delimiter` parameter ([sc-34085](https://app.shortcut.com/active-prospect/story/34085/add-field-mapping-for-scan-delimiter-to-trustedform-integrations))

## [1.17.2] - 2021-12-21
### Fixed
- Fixed to use returned `reason` on 40x responses ([sc-33842](https://app.shortcut.com/active-prospect/story/33842/trustedform-consent-consent-data-return-incorrect-reason))

## [1.17.1] - 2021-12-10
### Fixed
- Fixed to ensure `consent` doesn't append cert data, even when present in the response

## [1.17.0] - 2021-12-10
### Added
- Added new integrations: [consent](https://app.shortcut.com/active-prospect/story/32490/trustedform-consent-integration) & [consent_plus_data](https://app.shortcut.com/active-prospect/story/32491/trustedform-consent-data-integration)

## [1.16.3] - 2021-11-18
### Fixed
- Rename Data Service field `masked` to `is_masked` ([sc-32622](https://app.shortcut.com/active-prospect/story/32622/change-trustedform-data-service-integration-to-return-is-masked-instead-of-masked))

## [1.16.2] - 2021-11-12
### Fixed
- Fixed to report the same reason on 500 server errors it did before TrustedForm's API change ([sc-25816](https://app.shortcut.com/active-prospect/story/25816/lc-trustedform-integration-is-returning-a-different-error-when-encountering-a-500-system-error))

### Added
- Added support for mobile cert URL format (40 or 80 alphanumeric, plus dash `-` and underscore `_`) ([sc-30234](https://app.shortcut.com/active-prospect/story/30234/mobile-tf-certs-are-skipped-by-claim-integration))

## [1.16.1] - 2021-10-06
### Fixed
- Fixed to not append `consented_at` at all if not returned by TrustedForm (LC UI shows "Invalid date")

## [1.16.0] - 2021-09-28
### Added
- Added Data Service attributes:
  - `form_input_method` ([sc-27130](https://app.shortcut.com/active-prospect/story/27130/update-trustedform-data-service-add-support-for-form-input-method)) 
  - `has_consented` & `consented_at` ([sc-29812](https://app.shortcut.com/active-prospect/story/29812/update-trustedform-data-service-add-support-for-consented-at))

## [1.15.1] - 2021-07-21
### Fixed
- Claim now appends `expires_at` field

## [1.15.0] - 2021-05-10
### Added
- Added aliases for `data_service`: `decision_service_ping` and `decision_service_post` ([ch23031](https://app.clubhouse.io/active-prospect/story/23031/integration-wrappers-for-tfds-in-ac-vc-pricing))

## Fixed
- Added validation of TrustedForm Data Service token environment variable
- Fixed validation of certificates to skip on > 40 character IDs ([ch22713](https://app.clubhouse.io/active-prospect/story/22713/update-trustedform-integration-to-more-accurately-validate-cert-urls))

## [1.14.2] - 2021-04-14
### Fixed
- Added additional error handling to Claim integration 
- Fixed an incorrectly typed field in the Data Service integration

## [1.14.1] - 2021-03-25
### Added
- Added the ability to customize `reference` field in Claim integration

## [1.13.1] - 2020-11-04
### Fixed
- Added `billable` property to Data Service integration

## [1.13.0] - 2020-11-02
### Added
- Added new integration TrustedForm Data Service

## [1.12.7] - 2020-09-08
## Fixed
- Staging now accepts staging certificates

## [1.12.6] - 2020-07-14
### Fixed
- Now includes the reference parameter when claiming a certificate

## [1.12.5] - 2020-07-01
### Fixed
- Now accepts HTTP cert_urls, but makes them into HTTPS

## [1.12.4] - 2020-06-25
### Fixed
- Now appends the correct certificate token

## [1.12.2] - 2020-05-27
### Added
- Now appends certificate ID

## [1.12.1] - 2020-03-26
### Changed
- Now uses the TF node library

## [1.12.0] - 2019-10-02
### Added
- Ensure cert url is valid [CH #1101](https://app.clubhouse.io/active-prospect/story/1101/invalid-trustedform-cert-url-is-not-invalidated-before-sending-a-claim-request-to-trustedform)

## [1.11.0] - 2019-10-02
### Added
- Capture all URL collation data [CH #1862](https://app.clubhouse.io/active-prospect/story/1862/trustedform-integration-provide-all-url-location-data)

## [1.10.0] - 2019-05-09
### Added
- Added support for fingerprint results, per [TP #8409](https://activeprospect.tpondemand.com/entity/8409-trustedform-append-fingerprinting)

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
