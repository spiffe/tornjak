import { ClusterList } from "../../components/cluster-list"
import { checkProps } from "../../Utils/index"
import { shallow, configure } from "enzyme"
import Adapter from "@wojtekmaj/enzyme-adapter-react-17"
import * as IsManager from "../../components/is_manager"

configure({ adapter: new Adapter() })

const props = {
  clustersListUpdateFunc: jest.fn(), 
  tornjakMessageFunc: jest.fn(), 
  serverInfoUpdateFunc: jest.fn(), 
  globalServerSelected: "Test String",
  globalErrorMessage: "Test String", 
  globalTornjakServerInfo: {}, 
  globalClustersList: []
}

const clusterParams = {
  name: "Name", 
  editedName: "Edited", 
  creationTime: "Creation", 
  domainName: "Domain", 
  managedBy: "Managed", 
  platformType: "Platform", 
  agentsList: []
}

describe("Cluster List Component", () => {

  describe("Checking PropTypes", () => {
    // Props are allowed to be undefined/missing.
    test("Should NOT throw Warning/ Error", () => {
      const propsErr = checkProps(ClusterList, props)
      expect(propsErr).toBeUndefined();
    })
  })

  describe("Should Render Properly", () => {
    // Creates a rendered copy of a ClusterList.
    const wrapper = shallow(<ClusterList {...props} />)
    
    it("Should Render", () => {
      // Generates html as a point of comparison.
      expect(wrapper).toMatchSnapshot()
    })

    it("Cluster Validation/Adding", () => {
      // Manually adds cluster
      const list = wrapper.instance().props.globalClustersList
      list.push(clusterParams)

      // Checks whether the cluster was added.
      const clusters = wrapper.instance().clusterList()
      expect(clusters.length).toBe(1)

      // Validates the cluster metadata
      expect(clusters[0].props.cluster).toEqual(clusterParams)
      expect(clusters[0].key).toBe(clusterParams.name)

      console.log(wrapper.find("#table-1"))
    })

    it("Undefined Cluster List", () => {
      // Renders with different props to ensure the project works with multiple parameters.
      const newProps = {...props}
      newProps.globalClustersList = undefined
      shallow(<ClusterList {...newProps} />)
    })

    describe("Methods", () => {

      describe("Mounts", () => {
        
        test("With Manager", () => {
          // Renders with user management enabled.
          IsManager.default = true
          shallow(<ClusterList {...props} />)
        })
  
        test("Without Manager", () => {
          IsManager.default = false
          const newProps = {...props}
          newProps.globalTornjakServerInfo = {info: "Info"}
          shallow(<ClusterList {...newProps} />)
        })
      })

      describe("Updates", () => {

        test("With Manager", () => {
          IsManager.default = true
          const prevProps = {...props}
          prevProps.globalServerSelected = "Different Test String"
          const newWrapper = shallow(<ClusterList {...props} />)
          // Testing the update method with different parameters.
          newWrapper.instance().componentDidUpdate(prevProps)
        })

        test("Without Manager", () => {
          IsManager.default = false
          const prevProps = {...props}
          prevProps.globalTornjakServerInfo = {info: "Info"}
          const newWrapper = shallow(<ClusterList {...props} />)
          newWrapper.instance().componentDidUpdate(prevProps)
        })
      })
    })
  })
})