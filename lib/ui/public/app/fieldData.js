module.exports = {
  age: {
    description: 'The amount of time, in seconds, since the TrustedForm certificate was created. Serves as an approximation of lead age.',
    use: 'Some buyers might choose to only accept leads that meet their minimum requirement for lead age.'
  },
  browser: {
    description: 'The browser name and version',
    use: 'A buyer may use browser type information to infer attributes about a consumer, and accept or reject a lead accordingly.'
  },
  created_at: {
    description: 'Timestamp of the creation of the TrustedForm certificate, in ISO 8601 format.',
    use: 'Some buyers might choose to only accept leads that are less than x hours old, to maximize the likelihood of conversion.'
  },
  device: {
    description: 'Mobile device type, if applicable.',
    use: 'A buyer may use device type information to infer attributes about a consumer, and accept or reject a lead accordingly.'
  },
  event_duration: {
    description: 'The amount of time, in seconds, that the consumer spent on the page filling out the form.',
    use: 'Longer time on page might indicate a more thoughtful conversion event. Some buyers may choose to reject leads where a minimum duration was not met.'
  },
  expires_at: {
    description: 'Timestamp indicating when the claim period for the TrustedForm certificate expires.',
    use: 'Some buyers may choose to reject leads where the TrustedForm certificate has expired and can no longer be claimed for protection against TCPA complaints.'
  },
  framed: {
    description: 'Whether or not the page_url was in an iframe.',
    use: ''
  },
  city: {
    description: 'The city that the consumer was located in when they filled out the form, based on IP address. ',
    use: 'Some buyers may choose to only accept leads within a specific geographic area.'
  },
  country_code: {
    description: 'The country that the consumer was located in when they filled out the form, based on IP address.',
    use: 'Some buyers may choose to only accept leads within a specific geographic area.'
  },
  lat: {
    description: 'The location (latitude) of the consumer when they filled out the form, based on IP address.',
    use: 'Some buyers may choose to only accept leads within a specific geographic area.'
  },
  lon: {
    description: 'The location (longitude) of the consumer when they filled out the form, based on IP address.',
    use: 'Some buyers may choose to only accept leads within a specific geographic area.'
  },
  postal_code: {
    description: 'The postal code that the consumer was located in when they filled out the form, based on IP address.',
    use: 'Some buyers may choose to only accept leads within a specific geographic area.'
  },
  state: {
    description: 'The state that the consumer was in when they filled out the form, based on IP address.',
    use: 'Some buyers may choose to only accept leads within a specific geographic area.'
  },
  time_zone: {
    description: 'The time zone that the consumer was in when they filled out the form, based on IP address.',
    use: 'Some buyers may choose to only accept leads within a specific geographic area.'
  },
  ip: {
    description: 'The IP address of the consumer.',
    use: ''
  },
  wpm: {
    description: 'The consumer’s typing speed on the form, in words per minute.',
    use: 'A buyer may use typing speed information to infer attributes about a consumer. A buyer might reject leads that don’t fall within a desired range.'
  },
  kpm: {
    description: 'The consumer’s typing speed on the form, in keystrokes per minute.',
    use: 'A kpm that is greater than wpm indicates the use of the delete key and/or spacebar. This might suggest a lower likelihood of bot activity and a lower probability that a lead is fraudulent.'
  },
  page_url: {
    description: 'The URL of the page on which the consumer filled out the form.',
    use: ''
  },
  operating_system: {
    description: 'The operating system for the device from which the consumer filled out the form.',
    use: 'A buyer may use operating system information to infer attributes about a consumer, and accept or reject a lead accordingly.'
  },
  parent_page_url: {
    description: 'The URL of the page on which the consumer filled out the form. The value will be “null” unless framed=true (see above).',
    use: ''
  },
  cert_id: {
    description: 'The TrustedForm certificate ID.',
    use: ''
  },
  user_agent: {
    description: 'The browser and operating system for the device on which the consumer filled out the form.',
    use: 'A buyer may use user agent information to infer attributes about a consumer, and accept or reject a lead accordingly.'
  },
  matching: {
    description: 'Matching fingerprints that were found on the TrustedForm certificate. Learn more about fingerprinting here.',
    use: 'A buyer may choose to accept a lead where there is a fingerprint match.'
  },
  non_matching: {
    description: 'Non-matching fingerprints that were found on the TrustedForm certificate. Learn more about fingerprinting here.',
    use: 'A buyer may choose to reject a lead where there is not a fingerprint match.'
  },
  masked: {
    description: 'Whether or not the TrustedForm certificate is masked.',
    use: 'A buyer may choose to route leads with masked certificates to a different system.'
  },
  found: {
    description: 'Language that was found through the use of page scanning. Learn more about page scanning here.',
    use: 'A buyer may choose to accept a lead where desired language was found on the page through the use of page scanning.'
  },
  not_found: {
    description: 'Language that was not found through the use of page scanning. Learn more about page scanning here.',
    use: 'A buyer may choose to reject a lead where page scanning indicates that desired language was not found on the page.'
  },
  warnings: {
    description: 'Any warnings present about the content of the form, specific to page scanning and fingerprinting.',
    use: 'A buyer might choose to reject a lead where warnings are present.'
  },
};
