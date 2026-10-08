# Feature: Landing page

As a user
I want to understand MockForge and try the hosted API from the homepage
So that I can integrate or explore without signing up

---

## Scenario: I see the hero value proposition and primary calls to action

Given I am on the homepage
Then I see the headline about building my app before the backend is ready
And I see "Use the API"
And I see "Explore in Playground"

## Scenario: Use the API scrolls me to the integration section

Given I am on the homepage
When I follow "Use the API"
Then I see the "Integration" section titled "Connect your app to the MockForge API"

## Scenario: I open the Playground from the hero

Given I am on the homepage
When I follow "Explore in Playground" in the hero
Then I am on the Playground page

## Scenario: I switch hero request samples between REST, GraphQL, and WebSocket

Given I am on the homepage
When I choose "GraphQL" in the hero terminal
Then I see a GraphQL-oriented sample in the hero terminal
When I choose "WebSocket" in the hero terminal
Then I see a WebSocket-oriented sample in the hero terminal

## Scenario: I run a live GET against the public mock API

Given I am on the homepage
And the hosted mock API is reachable
When I choose "Products" in the live demo
And I choose "Run request"
Then I see a successful live response with JSON body

## Scenario: I switch live demo endpoints before running a request

Given I am on the homepage
When I choose "Users" in the live demo
Then I see sample shape content for users
When I choose "Run request"
Then the request targets the users collection on the public API

## Scenario: I copy JSON from a successful live demo response

Given I am on the homepage
And I have run a live demo request successfully
When I choose "Copy JSON"
Then I am told the response JSON was copied

## Scenario: I see when the live demo cannot reach the mock API

Given I am on the homepage
And the hosted mock API is not reachable from my browser
When I choose "Run request" in the live demo
Then I see that the mock API could not be reached
And I can choose "Retry request"

## Scenario: I see total requests served when homepage stats are available

Given I am on the homepage
And the site loaded public request statistics successfully
Then I see "Requests served" with a formatted count in the live demo

## Scenario: I do not see a requests-served counter when homepage stats are unavailable

Given I am on the homepage
And the site could not load public request statistics
Then I do not see "Requests served" in the live demo

## Scenario: I browse protocol samples and open related documentation

Given I am on the homepage
When I choose "GraphQL" in the protocol showcase
Then I see a GraphQL sample for the Product resource
When I follow "Read GraphQL docs"
Then I am on the GraphQL documentation page

## Scenario: I open the Playground from the protocol showcase without a protocol query

Given I am on the homepage
When I follow "Explore in Playground" in the protocol showcase
Then I am on the Playground page at "/playground"

## Scenario: I open REST documentation from a featured resource card

Given I am on the homepage
When I follow the "Product" resource card
Then I am on "/docs/rest/products"

## Scenario: I reveal and hide additional built-in resources

Given I am on the homepage
When I choose "Show 8 more resources"
Then I see additional resource cards such as "Comment"
When I choose "Hide additional resources"
Then those additional resource cards are hidden again

## Scenario: I open the Builder from the custom schema call to action

Given I am on the homepage
When I follow "Open Builder" in the resources section
Then I am on the Builder page

## Scenario: I read why MockForge replaces hand-maintained fixtures

Given I am on the homepage
When I scroll to the differentiation section
Then I see the heading "Replace fixtures with a typed hosted API"
And I see a comparison table contrasting fixtures and generic placeholder APIs with MockForge

## Scenario: I browse team use cases on the homepage

Given I am on the homepage
When I scroll to the scenarios section
Then I see the heading "Where teams call the API from an existing app"
And I see use cases including "Frontend development" and "Integration tests"

## Scenario: I switch quickstart client examples and copy a sample

Given I am on the homepage
When I choose "Python" in the integration quickstart
Then I see a Python sample calling the public API
When I choose "Copy" for the sample
Then I am told the code was copied

## Scenario: I open getting started documentation from the quickstart

Given I am on the homepage
When I follow "Read the Docs" in the integration section
Then I am on "/docs/getting-started"

## Scenario: I use the final call to action to read documentation or explore

Given I am on the homepage
When I follow "Read the Docs" in the final call to action
Then I am on "/docs"
When I return to the homepage
And I follow "Explore in Playground" in the final call to action
Then I am on the Playground page

## Scenario: I navigate product destinations from the footer

Given I am on the homepage
When I follow "Documentation" in the footer
Then I am on "/docs"
When I return to the homepage
And I follow "Schema Builder" in the footer
Then I am on the Builder page
