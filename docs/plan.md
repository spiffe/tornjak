# Tornjak Plan

Due to there being several components that need to be built as well as dependencies on continuing effort, the work can be broken down into milestones. 

The nature of the design specification of milestones is based on two main ideas:
1. The scope of capabilities/goals that can be achieved
2. The dependencies required based on on-going and planned work in the community


## Milestones

Here are a set of milestones. It is defined in an order but does not have to strictly follow it apart from Milestones A and B to lay the foundations of other milestones.

List of milestones
- Milestone A: Global Visibility
- Milestone B: 

### Milestone A: Global Visibility

Very simple global visibility and management of SPIRE APIs with simple authentication.

Feature dependencies: None

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



### Milestone B: Global Visibility + Authentication

Add ability to obtain server info and some custom tornjak APIs with simple authentication

Feature dependencies: None

In addition to above:
- Agent
  - APIS: Implement some custom tornjak APIs
  - Authentication via simple certificate auth from configured root CA on agent


### Milestone C: Policy management

Provide authorization capabilities and policy management. Showcase the ability to use
the workload registrar usecase with a stricter threat model enforced by policy.

Feature dependencies: Authorization and policy management

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

### Milestone D: Improve Policy definitions and UX

Provide better UX around policy management and provide the ability to create
more sophisticated identity policy.

Feature dependencies: Authorization and policy management

In addition to above:
- Manager
  - Visibility and consumability of policies
  - Provide templates for more complex policies to be created

### Milestone E: Auditability

- Manager
  - Auditability of Identities and use for operations/forensics (Dependencies: Advanced Logging entries and infrastructure for SPIRE)

### Milestone F: Advanced Authentication

Other missing features:
- Agent
  - More sophisticated authentication mechanisms + move authentication mechanisms to use SPIRE native (Dependencies: More authentication options for SPIRE)


### Milestone G: Enhancing SPIRE API

Other missing features:
- Manager
  - Management of SPIRE Identity configurations (Dependencies: SPIRE API boundary decisions)
