import { ClusterList } from "../../components/cluster-list"
import { findByTestId, checkProps } from "../../Utils/index"
import { shallow, configure } from "enzyme";
import Adapter from "@wojtekmaj/enzyme-adapter-react-17"
import ShallowRenderer from "react-test-renderer/shallow"

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

    it("Should Render List", () => {
      const clusterListComp = findByTestId(wrapper, "cluster-list")
      expect(clusterListComp.length).toBe(1)
    })

    it("Undefined Cluster List", () => {
      props.globalClustersList = undefined
      shallow(<ClusterList {...props} />)
    })
  })
});