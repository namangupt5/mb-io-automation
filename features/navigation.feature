@navigation @smoke
Feature: Navigation & Layout Validation
  As a user of the MultiBank (mb.io) platform
  I want to verify the navigation menu and layout
  So that I can access all sections of the platform easily

  Background:
    Given I am on the MultiBank home page

  @nav-menu
  Scenario: Validate top navigation bar is visible
    Then the navigation bar should be visible
    And the logo should be visible

  @nav-menu
  Scenario: Validate navigation menu options are displayed
    Then the navigation menu should display menu items
    And Sign In button should be visible
    And Sign Up button should be visible

  @nav-links
  Scenario: Validate navigation links have correct hrefs
    Then Sign In link should point to the login page
    And Sign Up link should point to the register page

  @nav-url
  Scenario: Validate clicking Sign In redirects to login page
    When I click the Sign In button
    Then the URL should contain "login"

  @layout
  Scenario: Validate layout consistency across page
    Then the navigation bar should be visible
    And the logo should be visible
    And the main content area should be visible
    And the hero section should be visible
    And the footer should be visible
