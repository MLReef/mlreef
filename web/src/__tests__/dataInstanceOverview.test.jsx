import React from 'react';
import Enzyme, { shallow, mount } from 'enzyme';
import { BrowserRouter as Router } from 'react-router-dom';
import { storeFactory } from '../functions/testUtils';
import Adapter from 'enzyme-adapter-react-16';
import { DataInstanceOverview } from "../components/data-instance/dataInstanceOverview";
import { projectsArrayMock } from '../testData';
import { Provider } from 'react-redux';

Enzyme.configure({ adapter: new Adapter() });

const store = storeFactory(projectsArrayMock);
const wrapper = shallow(<DataInstanceOverview store={store} />);

describe('Data instance overview contains 4 buttons', () => {
    it('renders filtering functionality buttons', () => {
      expect(wrapper.find('#buttons-container').contains([
        <button>All</button>,
        <button>In Progress</button>,
        <button>Active</button>,
        <button>Expired</button>
      ]));
      expect(wrapper.find('#buttons-container').children()).toHaveLength(4);
      console.log("PASS!!");
    });
  });

  describe('Button filters data instances', () => {
    it('according to the parameter', () => {
      const instanceWrapper = mount((
        <Provider store={store}>
          <Router>
            <DataInstanceOverview />)
          </Router> 
        </Provider>
      ));
      instanceWrapper.find('#buttons-container').childAt(0).simulate('click');
      expect(instanceWrapper).toMatchSnapshot();
    });
  });
  

