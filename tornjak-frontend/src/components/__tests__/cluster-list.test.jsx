import { ClusterList } from "../../components/cluster-list"
import { checkProps, findByTestId } from "../../Utils/index"
import { shallow, configure } from "enzyme";
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
  globalClustersList: [{}]
};

describe("Cluster List Component", () => {

  describe("Checking PropTypes", () => {

    // Props are allowed to be undefined/missing.
    test("Should NOT throw Warning/ Error", () => {
      const propsErr = checkProps(ClusterList, props);
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

    it("Should Render Cluster Management Component without Errors", () => {
      // Locates the list element containing the clusters (should be empty at start).
      const clusterMan = findByTestId(wrapper, "cluster-management");
      expect(clusterMan.length).toBe(0);
    });

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
});