const clusterType = 
[
  "Kubernetes",
  "VMs",
];

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

const workloadSelectors =
{
  "Docker": [
    {
      "label": "docker:label"
    },
    {
      "label": "docker:env"
    },
    {
      "label": "docker:image_id"
    },
  ],
  "Kubernetes": [
    {
      "label": "k8s:ns"
    },
    {
      "label": "k8s:sa"
    },
    {
      "label": "k8s:container-image"
    },
    {
      "label": "k8s:container-name"
    },
    {
      "label": "k8s:node-name"
    },
    {
      "label": "k8s:pod-label"
    },
    {
      "label": "k8s:pod-owner"
    },
    {
      "label": "k8s:pod-owner-uid"
    },
    {
      "label": "k8s:pod-uid"
    },
    {
      "label": "k8s:pod-name"
    },
    {
      "label": "k8s:pod-image"
    },
    {
      "label": "k8s:pod-image-count"
    },
    {
      "label": "k8s:pod-init-image"
    },
    {
      "label": "k8s:pod-init-image-count"
    },
  ],
  "Unix": [
    {
      "label": "unix:uid"
    },
    {
      "label": "unix:user"
    },
    {
      "label": "unix:gid"
    },
    {
      "label": "unix:group"
    },
    {
      "label": "unix:supplementary_gid"
    },
    {
      "label": "unix:supplementary_group"
    },
    {
      "label": "unix:path"
    },
    {
      "label": "unix:sha256"
    },
  ],
};
export { clusterType, selectors, workloadSelectors };