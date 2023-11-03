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

        instance.onChangeClusterName({target: {value: "Name"}})
        instance.onChangeManualClusterType({target: {value: "Type"}})
        instance.onChangeClusterDomainName({target: {value: "Domain"}})
        instance.onChangeClusterManagedBy({target: {value: "Managed By"}})

        wrapper.find("form").simulate("submit")

        expect(wrapper.state("clusterName")).toBe("Name")
        expect(wrapper.state("clusterType")).toBe("Type")
        expect(wrapper.state("clusterDomainName")).toBe("Domain")
        expect(wrapper.state("clusterManagedBy")).toBe("Managed By")
    })
})