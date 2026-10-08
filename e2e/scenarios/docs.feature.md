# Feature: Documentation

As a user
I want to browse MockForge reference documentation
So that I know how to call the hosted API and related protocols

---

## Background

Given I am on "/docs"

## Scenario: I see the documentation overview

Then I see the page titled "Overview"
And I see guidance to point my app at the hosted origin
And I see links to REST, GraphQL, WebSockets, Socket.IO, and custom schemas

## Scenario: I open getting started from the sidebar

When I open "Getting started" in the documentation sidebar
Then I see the page titled "Getting started"
And I see example curl commands for products, users, and todos

## Scenario: I deep link directly to a REST entity page

Given I open "/docs/rest/products"
Then I see REST documentation for products
And the "Docs" link in the global header is marked as the current page

## Scenario: I browse REST entity pages from the sidebar group

When I expand "REST API" in the documentation sidebar if it is collapsed
And I open "users" under REST
Then I see REST documentation for users

## Scenario: I open each top-level protocol and topic from the sidebar

When I open "GraphQL" in the documentation sidebar
Then I see GraphQL documentation
When I open "WebSockets" in the documentation sidebar
Then I see WebSocket documentation
When I open "Socket.IO" in the documentation sidebar
Then I see Socket.IO documentation
When I open "Custom schemas" in the documentation sidebar
Then I see custom schema documentation
When I open "Identity & rate limits" in the documentation sidebar
Then I see identity and quota documentation

## Scenario: I follow an in-page link to identity documentation

Given I am on the documentation overview
When I follow "Identity & rate limits" in the page body
Then I see the page titled "Identity & rate limits"

## Scenario: I copy a curl example from a documentation page

Given I am on the documentation overview
When I activate "Copy command" for a curl example
Then I am told the command was copied

## Scenario: I see the public API base URL as a copyable curl example

Given I am on "Getting started"
Then I see a curl command that uses the configured public API base URL

## Scenario: An unknown documentation path shows not found

When I open "/docs/not-a-real-page"
Then I see the site's not-found page

## Scenario: I toggle theme while reading documentation

When I activate "Toggle theme" in the global header
Then the documentation appearance switches between light and dark

## Scenario: I return to the homepage without losing my theme on docs

Given I have set light mode using "Toggle theme"
When I follow "MockForge" in the global header
Then I am on the homepage
When I follow "Docs" in the global header
Then the documentation still appears in light mode

## Scenario: I open the Playground from documentation content

Given I am on the documentation overview
When I follow the Playground link in the page body
Then I am on the Playground page
