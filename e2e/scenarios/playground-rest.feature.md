# Feature: Playground REST explorer

As a user  
I want to send REST requests against the hosted MockForge API from the playground  
So that I can explore list, read, search, and write endpoints without leaving the app

---

## Scenario: I land on REST by default

Given I open "/playground"  
When the playground loads  
Then I see the protocol control "REST" as active  
And I see "Examples" with REST example presets including "List users"  
And I see "HTTP response" with "Send a request to see the response"

---

## Scenario: Deep link opens the REST panel

Given I open "/playground?protocol=rest"  
When the playground loads  
Then I see the protocol control "REST" as active  
And I see the "Send" button next to the "HTTP method" and "Request URL suffix" fields

---

## Scenario: I run a list-users preset

Given I am on "/playground?protocol=rest"  
When I choose the "List users" example  
And I choose "Send"  
Then I see "Response" with an HTTP success status and JSON in "Body"

---

## Scenario: I run a paginated products preset

Given I am on "/playground?protocol=rest"  
When I choose the "Paginated products" example  
And I choose "Send"  
Then I see "Response" with JSON in "Body" that includes paginated product records

---

## Scenario: Search URLs show query-param hints

Given I am on "/playground?protocol=rest"  
And my request URL suffix includes "/search"  
When the request bar is shown  
Then I see "Query params:" with chips such as "q=searchterm" and "limit=30"

---

## Scenario: I add a custom request header

Given I am on "/playground?protocol=rest"  
When I open the "Headers" tab  
And I choose "Add header"  
Then I can enter values in "Header key" and the value field for that row

---

## Scenario: Invalid JSON in the body blocks send

Given I am on "/playground?protocol=rest"  
And I open the "Body" tab  
When I enter invalid JSON in "JSON request body"  
Then I see "Invalid JSON — fix syntax or clear the body before sending."  
And the "Send" button is disabled

---

## Scenario: A create-post write returns a response without persisting data

Given I am on "/playground?protocol=rest"  
When I choose the "Create post" example  
And I choose "Send"  
Then I see "Response" with a successful create status and post fields in "Body", and the write is exploratory only (built-in REST writes are not stored on the server)

---

## Scenario: A delete request returns confirmation without persisting removal

Given I am on "/playground?protocol=rest"  
When I choose the "Delete todo" example  
And I choose "Send"  
Then I see "Response" with JSON indicating the todo id was deleted, and the delete is exploratory only (built-in REST writes are not stored on the server)

---

## Scenario: I copy the response JSON

Given I am on "/playground?protocol=rest"  
And I have sent a request that produced a "Response"  
When I choose "Copy JSON"  
Then the button shows "Copied"

---

## Scenario: I copy the request as curl

Given I am on "/playground?protocol=rest"  
And I have sent a request that produced a "Response"  
When I choose "Copy as curl"  
Then the button shows "Copied"

---

## Scenario: I inspect response headers

Given I am on "/playground?protocol=rest"  
And I have sent a request that produced a "Response"  
When I expand "Response headers"  
Then I see the response header map as JSON
