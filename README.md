VECNA

AI powered sustainable digital twin for smart buildings.

VECNA is a smart building platform that helps identify unusual electricity and water consumption, find possible causes, suggest solutions, and check the savings after a solution is applied.


WHAT VECNA DOES

Monitors electricity and water usage from building sensors

Detects unusual consumption patterns

Finds possible causes behind the problem

Suggests suitable solutions

Keeps track of applied solutions

Checks the actual savings after an intervention

Continues collecting sensor data during temporary internet loss

Automatically syncs stored sensor data when the network is back


OFFLINE DATA HANDLING

When the internet is unavailable, the IoT sensors continue collecting readings. The readings are stored locally and kept in a pending sync queue.

Once the network connection is restored, the stored readings are automatically sent to the cloud and updated on the dashboard.

IoT Sensors → Local Buffer → Pending Sync → Network Restored → Cloud → Dashboard


TECHNOLOGY USED

React

TypeScript

Google Gemini

Firebase Firestore

Firebase Authentication

IndexedDB

Google AI Studio


PROJECT FLOW

Building → Problem → Cause → Solution → Verification → Solution History


ABOUT THE PROJECT

VECNA was developed for the Sustainable Digital Twin for Building Resource Waste problem statement.

The idea is to help building managers understand resource wastage, identify the reason behind it, take action, and verify whether the solution actually reduced consumption.
