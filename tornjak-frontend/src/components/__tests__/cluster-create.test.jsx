import { ClusterCreate } from "../../components/cluster-create"
import { shallow, configure } from "enzyme"
import Adapter from "@wojtekmaj/enzyme-adapter-react-17"

configure({ adapter: new Adapter() })

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
    const wrapper = shallow(<ClusterCreate {...props} />)

    it("Should Render", () => {
        expect(wrapper).toMatchSnapshot()
    })

    it("Should Create Cluster", () => {
        const instance = wrapper.instance()

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