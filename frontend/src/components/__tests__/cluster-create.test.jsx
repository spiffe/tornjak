import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import axios from "axios"
import { ClusterCreate } from "../cluster-create"
import { showToast } from "../error-api"

// componentDidMount fetches agents and server info, and a successful submit
// POSTs the new cluster, so axios has to be mocked for the component to mount
// at all. Note the previous enzyme tests used shallow(), which never ran
// componentDidMount and so never exercised any of this.
jest.mock("axios")
// showToast is how the component surfaces validation failures to the user.
jest.mock("../error-api", () => ({
  showToast: jest.fn(),
  showResponseToast: jest.fn(),
}))

const CLUSTER_TYPE = "Kubernetes"

const makeProps = (overrides = {}) => ({
  serverInfoUpdateFunc: jest.fn(),
  agentsListUpdateFunc: jest.fn(),
  tornjakMessageFunc: jest.fn(),
  tornjakServerInfoUpdateFunc: jest.fn(),
  clusterTypeInfoFunc: jest.fn(),
  agentsList: [],
  clusterTypeList: [CLUSTER_TYPE, "VMs"],
  globalServerSelected: "",
  globalErrorMessage: "",
  globalTornjakServerInfo: {},
  ...overrides,
})

// Carbon renders TextInput as a labelled <input>, so label text is a stable
// handle. Element ids are not: clusterNameInputField is reused by both the
// "Cluster Name" and "Cluster Managed By" fields.
const typeIn = (label, value) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value } })

const selectClusterType = (type) => {
  fireEvent.click(screen.getByText("Select Cluster Type"))
  fireEvent.click(screen.getByText(type))
}

const submit = () => fireEvent.submit(screen.getByTestId("create-cluster-form"))

beforeEach(() => {
  jest.clearAllMocks()
  axios.get.mockResolvedValue({ data: {} })
  axios.post.mockResolvedValue({ data: {} })
})

describe("ClusterCreate", () => {
  it("renders the create form", () => {
    render(<ClusterCreate {...makeProps()} />)

    expect(screen.getByRole("heading", { name: "Create Cluster" })).toBeInTheDocument()
    expect(screen.getByTestId("create-cluster-form")).toBeInTheDocument()
    expect(screen.getByLabelText(/Cluster Name/)).toBeInTheDocument()
  })

  it("rejects a submit with no cluster name and does not call the API", () => {
    render(<ClusterCreate {...makeProps()} />)

    submit()

    expect(showToast).toHaveBeenCalledWith({
      caption: "The cluster name cannot be empty.",
    })
    expect(axios.post).not.toHaveBeenCalled()
  })

  it("rejects a submit with a name but no cluster type", () => {
    render(<ClusterCreate {...makeProps()} />)

    typeIn(/Cluster Name/, "myCluster")
    submit()

    expect(showToast).toHaveBeenCalledWith({
      caption: "The cluster type cannot be empty.",
    })
    expect(axios.post).not.toHaveBeenCalled()
  })

  it("posts exactly the cluster the user filled in", async () => {
    render(<ClusterCreate {...makeProps()} />)

    typeIn(/Cluster Name/, "myCluster")
    selectClusterType(CLUSTER_TYPE)
    typeIn(/Cluster Domain Name/, "example.org")
    typeIn(/Cluster Managed By/, "person-A")

    submit()

    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1))

    expect(showToast).not.toHaveBeenCalled()
    const [, payload] = axios.post.mock.calls[0]
    expect(payload).toEqual({
      cluster: {
        name: "myCluster",
        platformType: CLUSTER_TYPE,
        domainName: "example.org",
        managedBy: "person-A",
        agentsList: [],
      },
    })
  })
})
