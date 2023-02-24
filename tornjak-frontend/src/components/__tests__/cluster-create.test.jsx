import { ClusterCreate } from "../../components/cluster-create"
import { configure } from "enzyme"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import Adapter from "@wojtekmaj/enzyme-adapter-react-17"

configure({adapter: new Adapter()})

const props = {
    serverInfoUpdateFunc: jest.fn(), 
    agentsListUpdateFunc: jest.fn(), 
    tornjakMessageFunc: jest.fn(), 
    tornjakServerInfoUpdateFunc: jest.fn(), 
    clusterTypeInfoFunc: jest.fn(), 
    agentsList: [{}], 
    clusterTypeList: [], 
    globalServerSelected: "Test String", 
    globalErrorMessage: "Test String", 
    globalTornjakServerInfo: {}
}

describe("Cluster Create Component", () => {

    beforeEach(() => {
        render(<ClusterCreate {...props} />)
    })

    describe("Cluster type cannot be empty.", () => {

        it("Manual", () => {
            fireEvent.change(screen.getByRole("cluster-type"), {selectedItem: "----Select this option and Enter Custom Cluster Type Below----"})
        })

        it("Not manual", () => {
            fireEvent.change(screen.getByRole("cluster-type"), {selectedItem: ""})
        })

        afterEach(async () => {
            fireEvent.click(screen.getByRole("create-cluster-button"))

            await waitFor(() => {
                const notification = screen.getByRole("alert")
                const [ caption ] = notification.getElementsByClassName("bx--toast-notification__caption")
                expect(caption.textContent).toBe("Cluster type cannot be empty.")
            })
        })
    })
})