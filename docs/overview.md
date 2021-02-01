# Tornjak

The project aims to provide a management plane and capabilities for SPIFFE identities managed by SPIRE.
The goals are to provide global visibility, auditability, and configuration and policy management for identities. 
This can be thought about as a central management plane for identities across SPIRE servers, with the aim for use by an administrator or CISO to govern an organization's workload identities.

The architecture consists of 2 main components, the agent and the manager. 
- The manager provides a management control plane for SPIRE servers, and a central point of data collection. It interacts with the agents, SPIRE servers, and corresponding components to achieve this.
- The agent provides a way for the management plane to communicate with the SPIRE servers and provide introspection and configuration of identities. 

For more details of the components and execution plan, please refer to these documents
- [Manager design and details](manager.md)
- [Agent design and details](agent.md)
- [Execution plan](plan.md)
