# Feature: Playground Socket.IO

As a user
I want to connect to MockForge Socket.IO namespaces from the playground
So that I can watch server pushes and emit chat messages where outbound traffic is supported

---

## Scenario: I open the Socket.IO panel from a deep link

Given I open `/playground?protocol=socketio`
Then I see the Socket.IO workbench with the protocol rail showing Socket.IO as active

## Scenario: Switch to Socket.IO from another protocol

Given I am on `/playground` with REST selected
When I choose "Socket.IO" in the protocol rail
Then I see the Socket.IO workbench

## Scenario: Start on the Ticker scenario by default

Given I open `/playground?protocol=socketio`
Then the "Scenario" preset "Ticker" is selected
And I see the preset description about stock ticks every second

## Scenario: Stream ticker events on the ticker namespace

Given I open `/playground?protocol=socketio`
And the "Scenario" preset "Ticker" is selected
When I press "Connect"
Then the event log shows "[connected]"
And I see at least one inbound `tick(...)` entry

## Scenario: Stream notification events on the notifications namespace

Given I open `/playground?protocol=socketio`
When I select the "Scenario" preset "Notifications"
And I press "Connect"
Then the event log shows "[connected]"
And I see at least one inbound `notification(...)` entry

## Scenario: Emit a chat message on the chat namespace

Given I open `/playground?protocol=socketio`
When I select the "Scenario" preset "Chat"
And I press "Connect"
And I open the "Message" tab
And I choose the sample message "Chat message"
And I press "Emit"
Then the event log shows an outbound `message(...)` entry with my chat JSON payload

## Scenario: Receive server chat events on the chat namespace

Given I open `/playground?protocol=socketio`
When I select the "Scenario" preset "Chat"
And I press "Connect"
Then the event log shows at least one inbound `message(...)` entry after "[connected]"

## Scenario: Reject invalid emit payload JSON

Given I open `/playground?protocol=socketio`
And I selected the "Scenario" preset "Chat"
And I am connected
And I opened the "Message" tab
When I enter a non-JSON payload and press "Emit"
Then I see the alert "Payload must be valid JSON or empty."

## Scenario: Receive-only scenarios hide outbound messaging

Given I open `/playground?protocol=socketio`
When I select the "Scenario" preset "Ticker"
Then I do not see a "Message" tab for outbound emits

## Scenario: Change scenario updates connection target and listen event

Given I open `/playground?protocol=socketio`
And the "Scenario" preset "Ticker" is selected
When I select the "Scenario" preset "Chat"
Then the "Connect to" endpoint shows the chat namespace URL for the active environment
And I see listening copy for the `message` event

## Scenario: Review static connection details

Given I open `/playground?protocol=socketio`
When I expand "Connection details"
Then I see read-only "Server origin", "Namespace", and "Engine.IO path" values for the selected scenario

## Scenario: Disconnect an active Socket.IO session

Given I open `/playground?protocol=socketio`
And I selected any Socket.IO scenario and pressed "Connect" until connected
When I press "Disconnect"
Then the connection returns to idle
And the event log records a client disconnect system entry

## Scenario: Cancel an in-flight Socket.IO connection

Given I open `/playground?protocol=socketio`
When I press "Connect" while the connection is still opening
And I press "Cancel"
Then the connection attempt stops and the control returns to "Connect"

## Scenario: Retry after a failed Socket.IO connection

Given I open `/playground?protocol=socketio`
And a connection attempt ended in an error state with "Retry" shown
When I press "Retry"
Then a new connection attempt starts

## Scenario: Clear the Socket.IO event log

Given I open `/playground?protocol=socketio`
And I am connected with at least one entry in "Event log"
When I press "Clear" in the event log toolbar
Then the event log is empty and shows the scenario-specific waiting hint
