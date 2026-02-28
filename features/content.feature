@content @regression
Feature: Content Validation
  As a user of the MultiBank (mb.io) platform
  I want to verify the content, marketing sections and feature descriptions
  So that I can access promotional materials and information

  @banners
  Scenario: Validate marketing content on home page
    Given I am on the MultiBank home page
    Then the hero section should display crypto heading
    And the page should have feature sections

  @download
  Scenario: Validate Download the App link works
    Given I am on the MultiBank home page
    Then the Download App link should be visible
    And the Download App link should contain a valid href

  @banners
  Scenario: Validate marketing banners appear at page bottom
    Given I am on the MultiBank home page
    When I scroll to the bottom of the page
    Then marketing banners should be visible at page bottom

  @market-data
  Scenario: Validate market data sections on home page
    Given I am on the MultiBank home page
    When I scroll to the market data section
    Then crypto ticker links should be displayed

  @about
  Scenario: Validate company page section headers and content
    Given I am on the company page
    Then the company page heading should be visible
    And section headers should be present on the page
    And paragraph content should be present on the page

  @about
  Scenario: Validate company page visual components
    Given I am on the company page
    Then visual components should be present on the page

  @footer
  Scenario: Validate footer section and links
    Given I am on the MultiBank home page
    When I scroll to the bottom of the page
    Then the footer should be visible
    And footer links should be present
