module.exports = {
  age: {
    name: 'Age',
    description: 'The amount of time, in seconds, since the TrustedForm certificate was created. Serves as an approximation of lead age.',
    enabled: false
  },
  browser: {
    name: 'Browser',
    description: 'The name and version of the browser used during the lead event.',
    enabled: false
  },
  created_timestamp: {
    name: 'Created Timestamp',
    description: 'Timestamp of the creation of the TrustedForm certificate, in ISO 8601 format.',
    enabled: false
  },
  domain: {
    name: 'Domain',
    description: 'The name of the website the lead event took place on.',
    enabled: false
  },
  expiration_timestamp: {
    name: 'Expiration Timestamp',
    description: 'A timestamp indicating when this certificate will no longer be available for API requests.',
    enabled: false
  },
  framed: {
    name: 'Framed',
    description: 'Whether or not the lead event took place inside of an iframe. <a href="https://www.techtarget.com/whatis/definition/IFrame-Inline-Frame" target="_blank">Learn More.</a>',
    enabled: false
  },
  form_input_method: {
    name: 'Form Input Method',
    description: 'A list of ways the consumer input their data onto the form including one or more of the following: typing, paste, autofill.',
    enabled: false
  },
  form_input_kpm: {
    name: 'Form Input KPM',
    description: 'The consumer’s typing speed on the form, in keystrokes per minute.',
    enabled: false
  },
  form_input_wpm: {
    name: 'Form Input WPM',
    description: 'The consumer’s approximate typing speed on the form, in words per minute. This is calculated by using the Form Input KPM and assuming five characters represent a word.',
    enabled: false
  },
  ip_address: {
    name: 'IP Address',
    description: 'The public IP address of the consumer during the lead event.',
    enabled: false
  },
  location: {
    name: 'Location',
    description: 'The city, state, postal code, country, timezone, latitude and longitude of the consumer\'s location during the lead event based on IP address.',
    enabled: false
  },
  masked: {
    name: 'Masked',
    description: 'Whether or not the TrustedForm certificate is masked.',
    enabled: false
  },
  sensitive_content: {
    name: 'Sensitive Content',
    description: 'Count of how many content elements (e.g. input, textarea) are marked sensitive and hidden from the session replay.',
    enabled: false
  },
  sensitive_form_fields: {
    name: 'Sensitive Form Fields',
    description: 'Count of how many form fields (e.g. input, textarea) are marked sensitive and hidden from the session replay.',
    enabled: false
  },
  operating_system: {
    name: 'Operating System',
    description: 'The name and version of the operating system for the device used during the lead event.',
    enabled: false
  },
  page_scan: {
    name: 'Page Scan',
    description: 'Results indicating whether specified text was found on the web page that created the certificate. <a href="https://community.activeprospect.com/posts/4078890-trustedform-page-scan" target="_blank">Learn more.</a>',
    enabled: false
  },
  page_url: {
    name: 'Page URL',
    description: 'The URL of the page where the lead event took place.',
    enabled: false
  },
  parent_page_url: {
    name: 'Parent Page URL',
    description: 'The URL displayed in the consumer\'s browser if the Page URL was displayed in an iframe. <a href="https://www.techtarget.com/whatis/definition/IFrame-Inline-Frame" target="_blank">Learn more.</a>',
    enabled: false
  },
  time_on_page: {
    name: 'Time On Page',
    description: 'The amount of time, in seconds, that the consumer spent on the page during the lead event.',
    enabled: false
  }
}
