# Feature: Playground GraphQL explorer

As a user  
I want to run GraphQL queries and mutations against the hosted MockForge API from the playground  
So that I can explore the schema and responses without a separate client

---

## Scenario: Deep link opens the GraphQL panel

Given I open "/playground?protocol=graphql"  
When the playground loads  
Then I see the protocol control "GraphQL" as active  
And I see "Examples" with GraphQL example presets including "Users (limit 5)"  
And I see a read-only "GraphQL endpoint URL" field showing POST to the playground GraphQL URL

---

## Scenario: I switch to GraphQL from the protocol rail

Given I am on "/playground?protocol=rest"  
When I choose the "GraphQL" protocol control  
Then the address bar includes "protocol=graphql"  
And I see the "Query" and "Variables" tabs

---

## Scenario: I run a users query preset

Given I am on "/playground?protocol=graphql"  
When I choose the "Users (limit 5)" example  
And I choose "Send"  
Then I see "Response" with JSON in "Body" containing user records

---

## Scenario: A preset with variables fills the Variables tab

Given I am on "/playground?protocol=graphql"  
When I choose the "Product by id" example  
And I open the "Variables" tab  
Then I see JSON in "GraphQL variables JSON"

---

## Scenario: I run a product-by-id query with variables

Given I am on "/playground?protocol=graphql"  
And I have chosen the "Product by id" example  
When I choose "Send"  
Then I see "Response" with product data in "Body"

---

## Scenario: Invalid variables JSON blocks send

Given I am on "/playground?protocol=graphql"  
When I open the "Variables" tab  
And I enter invalid JSON in "GraphQL variables JSON"  
Then I see "Invalid JSON — fix syntax or clear variables before sending."  
And the "Send" button is disabled

---

## Scenario: I open the static schema sidebar

Given I am on "/playground?protocol=graphql"  
When I choose "Toggle schema sidebar"  
Then I see "GraphQL schema" with heading "Schema"  
And I see field groups titled "Query" and "Mutation"  
And the schema is built-in (no live introspection request is required for the panel)

---

## Scenario: Selecting a schema field updates my query

Given I am on "/playground?protocol=graphql"  
And the "GraphQL schema" sidebar is open  
When I click a root field under "Query"  
Then my "GraphQL query" editor includes that operation

---

## Scenario: Schema sidebar open state survives reload

Given I am on "/playground?protocol=graphql"  
And I have opened the schema sidebar with "Toggle schema sidebar"  
When I reload the page  
Then the "GraphQL schema" sidebar is still visible

---

## Scenario: A create-post mutation returns a response without persisting data

Given I am on "/playground?protocol=graphql"  
When I choose the "Create post" example  
And I choose "Send"  
Then I see "Response" with created post fields in "Body", and the mutation is exploratory only (playground GraphQL writes are not stored on the server)

---

## Scenario: An update-todo mutation returns a response without persisting data

Given I am on "/playground?protocol=graphql"  
When I choose the "Update todo" example  
And I choose "Send"  
Then I see "Response" with updated todo fields in "Body", and the mutation is exploratory only (playground GraphQL writes are not stored on the server)

---

## Scenario: I copy the GraphQL response JSON

Given I am on "/playground?protocol=graphql"  
And I have sent an operation that produced a "Response"  
When I choose "Copy JSON"  
Then the button shows "Copied"
