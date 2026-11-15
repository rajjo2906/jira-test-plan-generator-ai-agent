# RICEPOT Framework – Jira AI Test Plan Generator

## R – Role

Act as a Senior Full-Stack Developer and AI Automation Architect with expertise in React, Node.js, Jira REST API integration, and AI-powered test case generation.

Your responsibility is to design and implement a lightweight, production-ready web application that automatically generates software test plans from Jira tickets.

## I – Instructions

Build a complete Jira-to-AI Test Plan Generator application.

Before starting implementation:

1. Locate and read `configuration.md`.
2. Extract the configured Jira email ID, API token, and Jira URL.
3. Review the existing UI designs and application references.
4. Review the test plan template provided during the planning phase.
5. Understand the existing design and follow its structure and styling.

Create the project inside an `implementation` folder with the following structure:

```text
implementation/
└── SRC/
    ├── frontend/
    ├── backend/
    └── README.md
```

The frontend must be developed using React and the backend using Node.js and Express.

### Core Functional Requirements

**1. Jira Integration**
- Allow users to enter a Jira ticket ID (e.g., PROJ-123).
- Connect to Jira automatically using the configured credentials.
- Fetch the Jira ticket details through Jira REST APIs.
- Retrieve the ticket summary, description, acceptance criteria, issue type, priority, and other relevant fields.
- Handle invalid Jira IDs and API errors gracefully.

**2. AI Test Plan Generation**
- Analyze the fetched Jira ticket information.
- Use an AI service to understand the requirements.
- Generate a comprehensive test plan based on the existing test plan template.
- Include positive, negative, boundary, functional, and relevant regression scenarios.
- Generate clear test steps and expected results.
- Avoid duplicate and irrelevant test cases.

**3. Test Plan Display**
- Display the generated test plan in a structured and readable interface.
- Allow users to review and edit generated test cases.
- Include scenario descriptions, preconditions, test steps, expected results, and priorities.

**4. Jira Test Case Integration**
- Provide functionality to publish the generated test cases to the configured Jira destination.
- Handle publishing failures and provide meaningful feedback.

**5. Settings Page**
Implement a settings page following the supplied design.

Include configuration for:
- Jira base URL.
- Jira email ID.
- Jira API token.
- AI provider and API configuration.
- Test plan template.
- Other relevant application preferences.

Never expose API tokens or sensitive credentials in frontend code.

## C – Context

This is a lightweight AI-powered QA automation project.

The primary objective is to reduce manual effort in understanding Jira requirements and preparing test plans.

The expected workflow is:

1. User enters a Jira ticket ID.
2. Application connects to Jira.
3. Application fetches the Jira ticket details.
4. AI analyzes the requirements.
5. AI generates test scenarios using the predefined template.
6. User reviews and edits the generated test plan.
7. User publishes the test plan to Jira.

The application should follow the supplied reference designs and existing planning documents.

Do not introduce unnecessary enterprise-level complexity.

## E – Examples

### Example Input

Jira ID: `PROJ-123`

Example Jira description:

"As a registered user, I want to reset my password using my registered email address so that I can regain access to my account."

### Expected AI-Generated Test Scenarios

1. Verify password reset using a valid registered email address.
2. Verify behavior when an unregistered email address is entered.
3. Verify validation when the email field is empty.
4. Verify invalid email format handling.
5. Verify password reset link generation.
6. Verify password reset link expiration.
7. Verify successful password reset using a valid link.
8. Verify that an expired reset link cannot be used.
9. Verify password complexity validation.
10. Verify login using the newly updated password.

These are illustrative scenarios. Actual generated output must follow the supplied test plan template.

### Example Application Screens

**Dashboard**
- Jira ID input field.
- Fetch Jira button.
- Generate Test Plan button.
- Jira ticket summary.
- Generation status.

**Test Plan Screen**
- Jira ticket information.
- Generated test scenarios.
- Test steps.
- Expected results.
- Priority.
- Edit and publish actions.

**Settings Screen**
- Jira connection settings.
- AI configuration.
- Test plan template configuration.
- Save and validate connection actions.

## P – Parameters

### Technology Stack

| Component | Technology |
|---|---|
| Frontend | React.js |
| Build tool | Vite |
| Styling | Tailwind CSS |
| Backend | Node.js |
| API framework | Express.js |
| Jira integration | Jira REST API |
| AI integration | Configurable LLM API |
| Configuration | Environment variables |

### Project Structure

```text
implementation/
└── SRC/
    ├── frontend/
    │   ├── src/
    │   │   ├── components/
    │   │   ├── pages/
    │   │   │   ├── Dashboard.jsx
    │   │   │   ├── TestPlan.jsx
    │   │   │   └── Settings.jsx
    │   │   ├── services/
    │   │   ├── App.jsx
    │   │   └── main.jsx
    │   └── package.json
    │
    ├── backend/
    │   ├── src/
    │   │   ├── config/
    │   │   ├── controllers/
    │   │   ├── services/
    │   │   ├── routes/
    │   │   └── server.js
    │   └── package.json
    │
    └── README.md
```

### Security Requirements

- Store Jira credentials securely on the backend.
- Use environment variables for sensitive configuration.
- Never hardcode API tokens in frontend files.
- Validate API requests and user inputs.
- Do not commit `.env` files to Git.
- Provide a `.env.example` file.

### Development Requirements

- Keep the application lightweight and modular.
- Use reusable React components.
- Maintain clear separation between frontend and backend.
- Implement proper error handling and loading indicators.
- Write readable and maintainable code.
- Include setup and execution instructions in README.md.

## O – Output

Deliver a fully functional application inside:

`implementation/SRC/`

Expected deliverables:

1. Complete React frontend.
2. Complete Node.js backend.
3. Jira REST API integration.
4. AI-powered test plan generation.
5. Test plan template integration.
6. Settings page matching the supplied design.
7. Test plan review and editing functionality.
8. Jira publishing integration.
9. Environment configuration files.
10. README with installation and execution instructions.

The application should be runnable locally using separate frontend and backend development servers.

## T – Testing and Validation

After implementation, perform the following validations:

1. Verify frontend and backend startup.
2. Verify Jira connection using configured credentials.
3. Verify fetching a valid Jira ticket.
4. Verify handling of invalid Jira ticket IDs.
5. Verify AI-generated test plans follow the supplied template.
6. Verify positive, negative, and boundary scenarios.
7. Verify test plan editing functionality.
8. Verify publishing generated test cases to Jira.
9. Verify settings persistence.
10. Verify sensitive credentials are not exposed in browser requests or frontend bundles.

### Final Acceptance Criteria

The project will be considered complete when:

- A user can enter a Jira ID.
- The application automatically fetches the corresponding Jira details.
- AI generates a test plan using the predefined template.
- The user can review and edit the generated output.
- The user can publish the generated test cases to Jira.
- The settings page works correctly.
- The application follows the supplied design references.
- Both frontend and backend run successfully.

**Important:** Do not create a dummy-only UI or hardcoded Jira responses. Implement actual integrations wherever credentials and required configuration are available. If any required configuration or reference file is missing, report it instead of inventing values.