# Feature: Custom generated data (public GET)

As a user
I want to request data from my published custom endpoint
So that I can use generated records in apps or the REST playground without sending an identity header

---

## Scenario: I fetch my published list endpoint from the REST playground

Given I published a schema in the builder and copied the endpoint URL from "Endpoint ready"
When I open `/playground` with REST selected
And I set the method to "GET"
And I paste that endpoint path into the URL field
And I choose "Send"
Then I see a JSON response body with a "data" array of generated records

## Scenario: I fetch the list using the copied cURL sample from the builder

Given I published a schema and copied the "Sample request" cURL from "Endpoint ready"
When I run that GET request against the API base URL
Then I receive JSON with a "data" array and pagination fields such as "total", "limit", and "skip"

## Scenario: I page through generated records with limit and skip

Given I have a working custom list URL for my slug
When I request that URL with query parameters `limit=5` and `skip=0`
Then the response "limit" is 5 and "skip" is 0
And the "data" array length is at most 5

## Scenario: I filter generated records with the search query parameter

Given I have a working custom list URL for my slug
When I request that URL with query parameters `search=tech` and `limit=5`
Then I receive JSON with a "data" array
And each record's field values match the search filter for that request

## Scenario: I fetch a single record by id from the path

Given I have a working custom list URL for my slug
When I send GET to the same slug with an additional path segment such as `/api/custom/{slug}/any-id`
Then I receive JSON with a single "data" object whose "id" equals "any-id"

## Scenario: I see not found for an unknown custom slug

Given no schema exists for slug "does-not-exist"
When I send GET to `/api/custom/does-not-exist` from the REST playground
Then I see an error response indicating the schema was not found

## Scenario: I do not need X-MF-ID to read custom generated data

Given I published a custom endpoint from the builder
When I send GET to that endpoint without an `X-MF-ID` header
Then I still receive generated JSON data successfully
