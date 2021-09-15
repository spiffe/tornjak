//import '@testing-library/jest-dom';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
//jest.enableAutomock()
//require('jest-localstorage-mock');
Enzyme.configure({ adapter: new Adapter() });
