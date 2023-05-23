import { ClusterCreate } from "../../components/cluster-create";
import { configure } from "enzyme";
import { render, screen, within, fireEvent, waitFor } from "@testing-library/react";
import Adapter from "@wojtekmaj/enzyme-adapter-react-17";

configure({adapter: new Adapter()});

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
};

const setup = () => render(<ClusterCreate {...props} />); 

describe("Cluster Create Component", () => {
    describe("Cluster type cannot be empty.", () => {
        it("Manual", () => {
            setup();
            fireEvent.change(screen.getByRole("cluster-type"), {selectedItem: "----Select this option and Enter Custom Cluster Type Below----"});
        });

        it("Not manual", () => {
            setup();
            fireEvent.change(screen.getByRole("cluster-type"), {selectedItem: ""});
        });

        afterEach(async () => {
            fireEvent.click(screen.getByTestId('create-cluster-button'));

            await waitFor(() => {
                const notification = screen.getByRole("error");
                const caption = within(notification).getByText('Cluster type cannot be empty.');
                expect(caption.textContent).toBe("Cluster type cannot be empty.");
            })
        })
    })
})