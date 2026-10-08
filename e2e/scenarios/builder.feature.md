# Feature: Schema builder

As a user
I want to define mock API schemas in the builder
So that I can preview sample data and publish a public GET endpoint

---

## Scenario: I open the builder from the site navigation

Given I am on any page with the global header
When I follow the "Builder" link
Then I see the heading "Build a mock API" and the section "Schema definition"

## Scenario: I switch between the form and JSON editors

Given I am on `/builder`
When I select "JSON" in the "Editor mode" control
Then I see the schema JSON textarea instead of the form fields
When I select "Form" in the "Editor mode" control
Then I see "Schema name" and the "Fields" section again

## Scenario: I prefill the Product starter when the schema is empty

Given I am on `/builder` with an empty schema and no loaded saved schema
When I choose "Prefill a Product example"
Then the "Schema name" field contains "Product"
And I see fields "name", "price", and "status" with types "String", "Number", and "Enum"

## Scenario: I see preview guidance until a field is named

Given I am on `/builder` with no field names filled in
Then in "Generated response" I see "Your sample response will appear here"
And I see "Name the first field to start generating records."

## Scenario: I see debounced sample records after naming a field

Given I am on `/builder`
When I set "Schema name" to "Widget"
And I name the first field "title"
Then in "Generated response" I see JSON sample records under "02 · Preview"

## Scenario: I add and remove fields in the form

Given I am on `/builder` with at least one field row
When I choose "+ Add field"
Then I have an additional empty field row
When I remove a field while more than one row remains
Then that field row is gone

## Scenario: I can choose each supported field type in the form

Given I am on `/builder`
When I open the "Type" control for a field
Then I can choose "String", "Number", "Boolean", "Date", "Enum", "Uuid", "Email", "Url", "Image", or "Array"

## Scenario: I configure enum, number, and array constraints in the form

Given I am on `/builder`
When I set a field type to "Enum" and leave allowed values empty
Then I see 'Field type "enum" requires a non-empty "values" array' after I try to save
When I set a field type to "Array" and leave "Select item type" unset
Then I see 'Field type "array" requires an "items" type (cannot be "array")' after I try to save
When I set a field type to "Number" and enter "Min" and "Max" values
Then those constraint inputs stay available for that row

## Scenario: I apply valid JSON and return to the form

Given I am on `/builder` in JSON mode with valid schema JSON containing "name" and "fields"
When I choose "Apply and return to form"
Then I am back in form mode with matching "Schema name" and field rows

## Scenario: I see a JSON editor error for invalid schema JSON

Given I am on `/builder` in JSON mode
When I replace the JSON with text that is not valid schema JSON
And I choose "Apply and return to form"
Then I see a red error such as "Invalid JSON: must have 'name' (string) and 'fields' (array with at least one field)" or field-level validation messages

## Scenario: I see form validation when required schema fields are missing

Given I am on `/builder` in form mode
When I clear "Schema name" or leave a field name empty
And I choose "Create endpoint"
Then I see "Schema name is required" or "Required" on the offending field

## Scenario: I see an error when the schema save API fails

Given I am on `/builder` with a valid schema
And the schema save API is unavailable
When I choose "Create endpoint"
Then I see an error alert with the failure message from the API

## Scenario: I create a persistent endpoint for the first time

Given I am on `/builder` with a valid schema
And "Persistent" is selected under "Endpoint persistence"
When I choose "Create endpoint"
Then I see "Endpoint ready" with a "GET" badge
And I see helper text "Creates a public GET endpoint."

## Scenario: I create an ephemeral endpoint

Given I am on `/builder` with a valid schema and no active saved slug
When I select "Ephemeral" under "Endpoint persistence"
Then I see helper text "Creates a temporary GET endpoint."
When I choose "Create endpoint"
Then I see "Endpoint ready"

## Scenario: I update a loaded schema

Given I saved a schema and loaded it from "Schemas"
When I change the definition and choose "Save changes"
Then I still see "Endpoint ready"
And I see helper text "Updates the live endpoint."

## Scenario: I copy the published endpoint URL and sample cURL

Given I see "Endpoint ready" after a successful save
When I choose "Copy" for the endpoint URL
Then I see "Copied" and hear or read "Endpoint URL copied"
When I choose "Copy" under "Sample request"
Then I see "Copied" and hear or read "Curl example copied"

## Scenario: I see an empty saved-schema list before my first save

Given I am on `/builder` with a new browser identity and no saved schemas
Then in "Schemas" I see "No saved schemas yet."

## Scenario: I see my saved schema in the sidebar after creating it

Given I created a persistent schema named "Contact"
When the "Schemas" list finishes loading
Then I see a row labeled "Contact" showing field count and "persistent"

## Scenario: I load a saved schema from the list

Given I have at least one saved schema in "Schemas"
When I activate "Load {schema name}" for that row
Then the form shows that schema's name and fields
And "Endpoint ready" shows its endpoint URL

## Scenario: I start a new schema from the sidebar

Given I loaded a saved schema
When I choose "+ New"
Then the form resets to an empty schema
And "Endpoint ready" is hidden

## Scenario: I delete a saved schema with confirmation

Given I have a saved schema listed under "Schemas"
When I choose "Delete {schema name}"
Then I see "Delete {schema name}? This cannot be undone."
When I choose "Confirm delete"
Then that schema row disappears from "Schemas"

## Scenario: I cancel deleting a saved schema

Given I opened delete confirmation for a saved schema
When I choose "Cancel"
Then the schema row remains in "Schemas"

## Scenario: I copy and restore my recovery key to manage schemas elsewhere

Given I am on `/builder`
When I open "Recovery key"
Then I see "Recovery key" with my UUID and "Copy recovery key"
When I paste a valid UUID recovery key and choose "Restore"
Then I see "Recovery key restored. Schema management now uses this identity."

## Scenario: I see an error for an invalid recovery key

Given the "Recovery key" dialog is open
When I choose "Restore" with an empty or invalid UUID in "Restore from a recovery key"
Then I see "Paste a recovery key to restore." or "Enter a valid UUID recovery key."
