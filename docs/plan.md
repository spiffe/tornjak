# Tornjak Plan

Due to there being several components that need to be built as well as dependencies on continuing effort, the work can be broken down into milestones.


## Milestones

### Milestone 1:

Very simple global visibility and management of SPIRE APIs with simple authentication.

- Agent
  - APIS: Implement only SPIRE server APIs
  - No Authentication
  - No Authorization
- Manager
  - Global Visibility
    - Add tornjak agent (backend call instead, not addition to UI)
    - SPIRE API actions on servers
    - No server info + custom tornjak APIs
  - No Identity policy management
  - No Auditability of idetntites
  - No Management of SPIRE identity Configurations

Feature dependencies: None


### Milestone 2:

Add ability to obtain server info and some custom tornjak APIs with simple authentication

In addition to above:

- Agent
  - APIS: Implement some custom tornjak APIs
  - Authentication via simple certificate auth from configured root CA on agent


Feature dependencies: None

### Milestone 3:

Provide authorization capabilities and policy management. Showcase the ability to use
the workload registrar usecase with a stricter threat model enforced by policy.

In addition to above:
- Agent
  - Authorization through SPIRE configuration
- Manager
  - Provide an interface to the policy engines used by the SPIRE deployments
  - Actions
  - Add policy engine
    - Provide address
    - Choose authentication method - User or Certificate [pending auth issue #TBD]
  - CRUD on policies
  - No Visibility and consumability of policies
  - No Provide templates for more complex policies to be created


Feature dependencies: Authorization and policy management


### Milestone 4:

Provide better UX around policy management and provide the ability to create
more sophisticated identity policy.

In addition to above:
- Manager
  - Visibility and consumability of policies
  - Provide templates for more complex policies to be created


Feature dependencies: Authorization and policy management


### Milestone 5+:

Other missing features:
- Agent
  - More sophisticated authentication mechanisms + move mechanisms to use SPIRE native (Dependencies: More authentication options for SPIRE)
- Manager
  - Auditability of Identities and use for operations/forensics (Dependencies: Advanced Logging entries and infrastructure for SPIRE)
  - Management of SPIRE Identity configurations (Dependencies: SPIRE API boundary decisions)
