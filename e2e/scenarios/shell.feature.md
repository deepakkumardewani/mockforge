# Feature: Global shell

As a user
I want consistent navigation, theme, and client identity across the app
So that I can move between marketing, docs, and tools without losing context

---

## Background

Given I am viewing a page that shows the global header with "MockForge", "Docs", "Playground", and "Builder"

## Scenario: I see primary navigation and actions in the header

When I look at the primary navigation
Then I see the "MockForge" brand link
And I see "Docs", "Playground", and "Builder" links
And I see a "GitHub" link
And I see a "Toggle theme" control

## Scenario: I return home from the brand link

Given I am on "/docs"
When I follow the "MockForge" link
Then I am on the homepage

## Scenario: The Docs link reflects when I am in documentation

Given I am on "/docs/rest/products"
When I look at the "Docs" link in the header
Then that link is marked as the current page

## Scenario: Playground and Builder links reflect exact routes

Given I am on "/playground"
When I look at the "Playground" link in the header
Then that link is marked as the current page
And the "Builder" link is not marked as the current page

## Scenario: I open in-app destinations from the mobile navigation drawer

Given I am using a viewport where the mobile menu control is shown
When I activate "Toggle navigation menu"
Then I see "Docs", "Playground", and "Builder" in the mobile menu
When I choose "Docs"
Then I am on a documentation page
And the mobile menu closes

## Scenario: I dismiss the mobile navigation drawer with Escape

Given I am using a viewport where the mobile menu control is shown
And I have opened the mobile navigation menu
When I press Escape
Then the mobile navigation menu closes

## Scenario: GitHub opens in a new browsing context

When I follow the "GitHub" link in the header
Then I leave the MockForge app for the repository on GitHub

## Scenario: I switch between light and dark theme

When I activate "Toggle theme"
Then the page appearance switches between light and dark
When I activate "Toggle theme" again
Then the page appearance switches back

## Scenario: My theme choice persists after I reload

Given I have set the site to dark mode using "Toggle theme"
When I reload the page
Then the site still appears in dark mode

## Scenario: My theme choice persists when I move between homepage and docs

Given I have set the site to light mode using "Toggle theme"
When I follow "Docs" in the header
And I reload the documentation page
Then the site still appears in light mode

## Scenario: Visiting the homepage alone does not assign a client identity yet

Given I have cleared site data for MockForge
When I open the homepage
Then I have not been assigned a stored client identity for MockForge

## Scenario: Opening Playground from the header assigns a persistent client identity

Given I have cleared site data for MockForge
When I follow "Playground" in the header
Then my browser stores an anonymous client identity for MockForge

## Scenario: Opening Builder from the header assigns a persistent client identity

Given I have cleared site data for MockForge
When I follow "Builder" in the header
Then my browser stores an anonymous client identity for MockForge

## Scenario: My client identity survives navigation via the header

Given I have opened "Playground" from the header and received a client identity
When I follow "Docs" in the header
And I follow "MockForge" to return to the homepage
Then my browser still has the same client identity as before
