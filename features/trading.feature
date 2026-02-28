@trading @regression
Feature: Trading Functionality Validation
  As a user of the MultiBank (mb.io) platform
  I want to verify the trading/market data functionality
  So that I can view trading pairs and market information

  Background:
    Given I am on the explore page

  @spot
  Scenario: Validate explore page displays trading pairs
    Then the trading section should be visible
    And trading pairs should be displayed

  @categories
  Scenario: Validate trading categories exist
    Then trading category tabs should be displayed
    And the category count should be greater than zero

  @pair-structure
  Scenario: Validate trading pair data structure
    When I wait for dynamic content to load
    Then each trading pair should have valid data structure

  @table-headers
  Scenario: Validate market data table headers
    Then the market data should display expected column headers

  @dynamic-content
  Scenario: Validate dynamic content rendering
    When I wait for dynamic content to load
    Then trading pairs should be displayed
    And price values should be visible
