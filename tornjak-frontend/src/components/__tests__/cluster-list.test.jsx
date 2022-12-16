import { ClusterList } from "../../components/cluster-list"
import { findByTestId, checkProps } from "../../Utils/index"
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

    test("Should NOT throw Warning/ Error", () => {
      const expectedInitialProps = props;
      const propsErr = checkProps(ClusterList, expectedInitialProps);
      expect(propsErr).toBeUndefined();
    })
  })

  describe("Should Render Properly", () => {
    const wrapper = shallow(<ClusterList {...props} />)
    
    it("Should Render", () => {
      expect(wrapper).toMatchSnapshot()
    })

    it("Undefined Cluster List", () => {
      const newProps = {...props}
      newProps.globalClustersList = undefined
      shallow(<ClusterList {...newProps} />)
    })

    describe("Methods", () => {
  
      beforeEach(() => {
        jest.resetModules()
      });

      describe("Mounts", () => {
        
        test("With Manager", () => {
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