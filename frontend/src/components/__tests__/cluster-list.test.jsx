import { render, screen } from "@testing-library/react"
import { Provider } from "react-redux"
import { ClusterList } from "../cluster-list"
import { testReduxStore } from "../../Utils/index"

// ClusterList renders a redux-connected table, so it needs a real store.
const renderList = (overrides = {}) => {
  const props = {
    clustersListUpdateFunc: jest.fn(),
    tornjakMessageFunc: jest.fn(),
    serverInfoUpdateFunc: jest.fn(),
    globalServerSelected: "Test String",
    globalErrorMessage: "OK",
    globalTornjakServerInfo: {},
    globalClustersList: [],
    ...overrides,
  }
  return render(
    <Provider store={testReduxStore({})}>
      <ClusterList {...props} />
    </Provider>
  )
}

const cluster = (name) => ({
  name,
  creationTime: "Creation",
  domainName: `${name}.example.org`,
  managedBy: "person-A",
  platformType: "Kubernetes",
  agentsList: [],
})

describe("ClusterList", () => {
  it("renders the heading and table", () => {
    renderList()

    expect(screen.getByRole("heading", { name: "Clusters List" })).toBeInTheDocument()
    expect(screen.getByTestId("cluster-list")).toBeInTheDocument()
  })

  it("shows an error banner when the error message is not OK", () => {
    renderList({ globalErrorMessage: "something broke" })

    const alert = screen.getByRole("alert")
    expect(alert).toHaveTextContent("something broke")
  })

  it("hides the error banner when the error message is OK", () => {
    renderList({ globalErrorMessage: "OK" })

    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
  })

  it("renders a row per cluster with its metadata", () => {
    renderList({ globalClustersList: [cluster("alpha"), cluster("beta")] })

    for (const name of ["alpha", "beta"]) {
      expect(screen.getByText(name)).toBeInTheDocument()
      expect(screen.getByText(`${name}.example.org`)).toBeInTheDocument()
    }
    expect(screen.getAllByText("Kubernetes")).toHaveLength(2)
  })

  // globalClustersList is typed as required but arrives undefined on first
  // render in manager mode, so the component has to tolerate it.
  it("renders without crashing when the cluster list is undefined", () => {
    renderList({ globalClustersList: undefined })

    expect(screen.getByRole("heading", { name: "Clusters List" })).toBeInTheDocument()
  })
})
