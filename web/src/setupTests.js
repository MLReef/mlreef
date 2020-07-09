/* eslint-disable no-unused-vars */
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import 'whatwg-fetch';

configure({ adapter: new Adapter() });
