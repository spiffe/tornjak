const selectors =
    {
      "aws_iid": [
        {
          "label": "aws_iid:tag:name"
        },
        {
          "label": "aws_iid:sg:id"
        },
        {
          "label": "aws_iid:sg:name"
        },
        {
          "label": "aws_iid:iamrole:arn:aws:iam"
        }
      ],
      "gcp_iit": [
        {
          "label": "gcp_iit:project-id"
        },
        {
          "label": "gcp_iit:zone"
        },
        {
          "label": "gcp_iit:instance-name"
        },
        {
          "label": "gcp_iit:tag"
        },
        {
          "label": "gcp_iit:sa"
        },
        {
          "label": "gcp_iit:label"
        },
        {
          "label": "gcp_iit:metadata"
        }
      ],
      "k8s_sat": [
        {
          "label": "k8s_sat:cluster"
        },
        {
          "label": "k8s_sat:agent_ns"
        },
        {
          "label": "k8s_sat:agent_sa"
        }
      ],
      "k8s_psat": [
        {
          "label": "k8s_psat:cluster"
        },
        {
          "label": "k8s_psat:agent_ns"
        },
        {
          "label": "k8s_psat:agent_sa"
        },
        {
          "label": "k8s_psat:agent_pod_name"
        },
        {
          "label": "k8s_psat:agent_pod_uid"
        },
        {
          "label": "k8s_psat:agent_pod_label"
        },
        {
          "label": "k8s_psat:agent_node_ip"
        },
        {
          "label": "k8s_psat:agent_node_name"
        },
        {
          "label": "k8s_psat:agent_node_uid"
        },
        {
          "label": "k8s_psat:agent_node_label"
        }
      ],
    };
  export {selectors};