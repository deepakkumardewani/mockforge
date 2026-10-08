# Feature: Playground WebSocket

As a user
I want to explore live WebSocket scenarios against MockForge
So that I can see streaming data and send messages where the server accepts them

---

## Scenario: I open the WebSocket panel from a deep link

Given I open `/playground?protocol=websocket`
Then I see the WebSocket workbench with the protocol rail showing WebSocket as active

## Scenario: Switch to WebSocket from another protocol

Given I am on `/playground` with REST selected
When I choose "WebSocket" in the protocol rail
Then I see the WebSocket workbench

## Scenario: Start on the Ticker scenario by default

Given I open `/playground?protocol=websocket`
Then the "Scenario" preset "Ticker" is selected
And I see the preset description about stock ticks every second

## Scenario: Stream ticker updates

Given I open `/playground?protocol=websocket`
And the "Scenario" preset "Ticker" is selected
When I press "Connect"
Then the event log shows "[connected]"
And I see at least one inbound ticker payload after the connection opens

## Scenario: Stream notification alerts

Given I open `/playground?protocol=websocket`
When I select the "Scenario" preset "Notifications"
And I press "Connect"
Then the event log shows "[connected]"
And I see at least one inbound notification payload

## Scenario: Stream live request totals on Stats feed

Given I open `/playground?protocol=websocket`
When I select the "Scenario" preset "Stats feed"
And I press "Connect"
Then the event log shows "[connected]"
And I see at least one inbound JSON message containing a request total

## Scenario: Keep the stats socket alive with a pong reply

Given I open `/playground?protocol=websocket`
And I selected the "Scenario" preset "Stats feed"
And I am connected
When I open the "Message" tab
And I choose the sample message "Pong reply"
And I press "Send"
Then the event log shows an outbound entry with the text `pong`

## Scenario: Post a chat message to the playground room

Given I open `/playground?protocol=websocket`
When I select the "Scenario" preset "Chat"
And I press "Connect"
And I open the "Message" tab
And I choose the sample message "Chat JSON"
And I press "Send"
Then the event log shows an outbound JSON chat payload

## Scenario: Receive server chat traffic in the playground room

Given I open `/playground?protocol=websocket`
When I select the "Scenario" preset "Chat"
And I press "Connect"
Then the event log shows at least one inbound JSON chat message after "[connected]"

## Scenario: Receive-only scenarios hide outbound messaging

Given I open `/playground?protocol=websocket`
When I select the "Scenario" preset "Ticker"
Then I do not see a "Message" tab for outbound messages

## Scenario: Change scenario updates the displayed WebSocket URL

Given I open `/playground?protocol=websocket`
And the "Scenario" preset "Ticker" is selected
When I select the "Scenario" preset "Stats feed"
Then the "Connect to" URL changes to the stats WebSocket endpoint for the active environment

## Scenario: Disconnect an active WebSocket

Given I open `/playground?protocol=websocket`
And I selected any WebSocket scenario and pressed "Connect" until connected
When I press "Disconnect"
Then the connection returns to idle
And the event log records a disconnect system entry

## Scenario: Cancel an in-flight connection attempt

Given I open `/playground?protocol=websocket`
When I press "Connect" while the connection is still opening
And I press "Cancel"
Then the connection attempt stops and the control returns to "Connect"

## Scenario: Retry after a failed connection

Given I open `/playground?protocol=websocket`
And a connection attempt ended in an error state with "Retry" shown
When I press "Retry"
Then a new connection attempt starts

## Scenario: Clear the WebSocket event log

Given I open `/playground?protocol=websocket`
And I am connected with at least one entry in "Event log"
When I press "Clear" in the event log toolbar
Then the event log is empty and shows the scenario-specific waiting hint
